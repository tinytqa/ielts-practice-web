import express from 'express';
import path from 'path';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';
import { getDb, saveDb } from './server/db.js';
import { gradeWritingEssay, gradeSpeakingResponse, generateBrainstormIdeas, lookupVocabDetails, generateFullStudySchedule } from './server/geminiService.js';

const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Initialize SQLite Database
  const db = await getDb();

  // Helper for generating unique ID
  const genId = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // ===================== API ROUTES =====================

  // 1. Authentication & User Profile
  app.post('/api/auth/login', async (req, res) => {
    const { email } = req.body;
    try {
      const stmt = db.prepare("SELECT * FROM users WHERE email = ?");
      stmt.bind([email || 'student@ielts.vn']);
      let user = null;
      if (stmt.step()) {
        user = stmt.getAsObject();
      }
      stmt.free();

      if (!user) {
        // Auto-create student if not exists
        const id = genId('u');
        db.run("INSERT INTO users (id, email, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?)",
          [id, email || 'student@ielts.vn', 'pass123', 'Học Viên Trải Nghiệm', 'STUDENT']);
        db.run("INSERT INTO user_profiles (user_id, current_band, target_band) VALUES (?, 5.5, 7.0)", [id]);
        db.run("INSERT INTO streaks (user_id, current_streak) VALUES (?, 1)", [id]);
        db.run("INSERT INTO wallets (user_id, credits) VALUES (?, 50)", [id]);
        saveDb();

        user = { id, email: email || 'student@ielts.vn', full_name: 'Học Viên Trải Nghiệm', role: 'STUDENT' };
      }

      // Fetch profile
      const profStmt = db.prepare("SELECT * FROM user_profiles WHERE user_id = ?");
      profStmt.bind([user.id]);
      let profile = {};
      if (profStmt.step()) {
        profile = profStmt.getAsObject();
      }
      profStmt.free();

      res.json({ user, profile });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/auth/me', async (req, res) => {
    const userId = (req.query.user_id as string) || 'u_student';
    try {
      const stmt = db.prepare("SELECT * FROM users WHERE id = ?");
      stmt.bind([userId]);
      let user = null;
      if (stmt.step()) {
        user = stmt.getAsObject();
      }
      stmt.free();

      const profStmt = db.prepare("SELECT * FROM user_profiles WHERE user_id = ?");
      profStmt.bind([userId]);
      let profile = null;
      if (profStmt.step()) {
        profile = profStmt.getAsObject();
      }
      profStmt.free();

      res.json({ user, profile });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/auth/onboarding', async (req, res) => {
    const { user_id, current_band, target_band, target_exam_date, weekly_hours, preferred_timeslot, focus_skills } = req.body;
    try {
      // Call Gemini AI to generate structured schedule
      const fullSchedule = await generateFullStudySchedule(
        current_band || 5.5,
        target_band || 7.0,
        target_exam_date || '2026-11-15',
        weekly_hours || 10,
        preferred_timeslot || 'EVENING',
        focus_skills || ['WRITING', 'SPEAKING']
      );

      const studyPlan = {
        reading: `${Math.round((weekly_hours || 10) * 0.25)} giờ/tuần - Luyện skimming, scanning & True/False/Not Given`,
        listening: `${Math.round((weekly_hours || 10) * 0.25)} giờ/tuần - Luyện chép chính tả & bắt keyword Part 3`,
        writing: `${Math.round((weekly_hours || 10) * 0.3)} giờ/tuần - Viết Task 1 & Task 2, chấm AI & khắc phục lỗi grammar_tense`,
        speaking: `${Math.round((weekly_hours || 10) * 0.2)} giờ/tuần - Luyện Part 2 Cue card & phán xạ Speaking Partner`,
        fullSchedule
      };

      db.run(`
        INSERT INTO user_profiles (user_id, current_band, target_band, target_exam_date, weekly_hours, study_plan_json)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET
          current_band = excluded.current_band,
          target_band = excluded.target_band,
          target_exam_date = excluded.target_exam_date,
          weekly_hours = excluded.weekly_hours,
          study_plan_json = excluded.study_plan_json,
          updated_at = CURRENT_TIMESTAMP
      `, [user_id, current_band, target_band, target_exam_date, weekly_hours, JSON.stringify(studyPlan)]);

      saveDb();
      res.json({ success: true, studyPlan, fullSchedule });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/ai/study-plan', async (req, res) => {
    const { current_band, target_band, target_exam_date, weekly_hours, preferred_timeslot, focus_skills } = req.body;
    try {
      const schedule = await generateFullStudySchedule(
        current_band || 5.5,
        target_band || 7.0,
        target_exam_date || '2026-11-15',
        weekly_hours || 10,
        preferred_timeslot || 'EVENING',
        focus_skills || ['WRITING', 'SPEAKING']
      );
      res.json(schedule);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 2. Tests Bank & Attempt Submissions (Reading / Listening / Practice)
  app.get('/api/tests', async (req, res) => {
    const skill = req.query.skill as string;
    try {
      let query = "SELECT * FROM tests";
      let params: any[] = [];
      if (skill && skill !== 'ALL') {
        query += " WHERE skill_type = ?";
        params.push(skill);
      }
      query += " ORDER BY created_at DESC";

      const stmt = db.prepare(query);
      if (params.length) stmt.bind(params);

      const tests: any[] = [];
      while (stmt.step()) {
        tests.push(stmt.getAsObject());
      }
      stmt.free();

      res.json({ tests });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/tests/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const testStmt = db.prepare("SELECT * FROM tests WHERE id = ?");
      testStmt.bind([id]);
      let test: any = null;
      if (testStmt.step()) {
        test = testStmt.getAsObject();
      }
      testStmt.free();

      if (!test) {
        return res.status(404).json({ error: 'Test not found' });
      }

      // Fetch Sections
      const secStmt = db.prepare("SELECT * FROM test_sections WHERE test_id = ? ORDER BY order_index ASC");
      secStmt.bind([id]);
      const sections: any[] = [];
      while (secStmt.step()) {
        sections.push(secStmt.getAsObject());
      }
      secStmt.free();

      // Fetch Questions for each section
      for (const sec of sections) {
        const qStmt = db.prepare("SELECT * FROM questions WHERE section_id = ? ORDER BY question_number ASC");
        qStmt.bind([sec.id]);
        const questions: any[] = [];
        while (qStmt.step()) {
          const qObj = qStmt.getAsObject();
          qObj.options = qObj.options_json ? JSON.parse(qObj.options_json as string) : [];
          questions.push(qObj);
        }
        qStmt.free();
        sec.questions = questions;
      }

      res.json({ test, sections });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/tests/:id/submit', async (req, res) => {
    const { id } = req.params;
    const { user_id, answers, time_spent_seconds, mode } = req.body;

    try {
      // Get all questions
      const qStmt = db.prepare(`
        SELECT q.id, q.correct_answer, q.explanation_text, q.question_number
        FROM questions q
        JOIN test_sections ts ON q.section_id = ts.id
        WHERE ts.test_id = ?
      `);
      qStmt.bind([id]);
      const questionsMap = new Map<string, any>();
      while (qStmt.step()) {
        const q = qStmt.getAsObject();
        questionsMap.set(q.id as string, q);
      }
      qStmt.free();

      let correctCount = 0;
      const totalQuestions = questionsMap.size || 1;
      const evaluatedAnswers: any[] = [];

      for (const [qId, userAns] of Object.entries(answers as Record<string, string>)) {
        const qInfo = questionsMap.get(qId);
        if (qInfo) {
          const isCorrect = userAns.trim().toLowerCase() === String(qInfo.correct_answer).trim().toLowerCase();
          if (isCorrect) correctCount++;

          evaluatedAnswers.push({
            question_id: qId,
            user_answer: userAns,
            is_correct: isCorrect,
            correct_answer: qInfo.correct_answer,
            explanation_text: qInfo.explanation_text
          });
        }
      }

      // Calculate estimated IELTS band for Reading/Listening
      const rawRatio = correctCount / totalQuestions;
      let bandScore = 4.0;
      if (rawRatio >= 0.9) bandScore = 8.5;
      else if (rawRatio >= 0.8) bandScore = 7.5;
      else if (rawRatio >= 0.7) bandScore = 7.0;
      else if (rawRatio >= 0.6) bandScore = 6.5;
      else if (rawRatio >= 0.5) bandScore = 6.0;
      else if (rawRatio >= 0.4) bandScore = 5.5;
      else bandScore = 5.0;

      const attemptId = genId('att');
      db.run(`
        INSERT INTO user_test_attempts (id, user_id, test_id, mode, band_score, correct_count, total_questions, time_spent_seconds, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'COMPLETED')
      `, [attemptId, user_id || 'u_student', id, mode || 'PRACTICE', bandScore, correctCount, totalQuestions, time_spent_seconds || 600]);

      for (const ans of evaluatedAnswers) {
        db.run(`
          INSERT INTO user_answers (id, attempt_id, question_id, user_answer, is_correct)
          VALUES (?, ?, ?, ?, ?)
        `, [genId('ans'), attemptId, ans.question_id, ans.user_answer, ans.is_correct ? 1 : 0]);
      }

      saveDb();

      res.json({
        attempt_id: attemptId,
        band_score: bandScore,
        correct_count: correctCount,
        total_questions: totalQuestions,
        evaluatedAnswers
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 3. AI Writing Grading
  app.post('/api/grading/writing', async (req, res) => {
    const { user_id, task_type, prompt_title, essay_text, target_band } = req.body;

    try {
      const wordCount = essay_text ? essay_text.trim().split(/\s+/).length : 0;
      const subId = genId('sub_w');

      db.run(`
        INSERT INTO writing_submissions (id, user_id, task_type, prompt_title, essay_text, word_count)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [subId, user_id || 'u_student', task_type || 'TASK_2', prompt_title, essay_text, wordCount]);

      // Call Gemini AI
      const aiResult = await gradeWritingEssay(
        task_type || 'TASK_2',
        prompt_title || 'IELTS Writing Task',
        essay_text,
        target_band || 7.0
      );

      const gradingId = genId('gr_w');
      db.run(`
        INSERT INTO ai_grading_results (id, submission_type, submission_id, overall_band, criteria_json, general_feedback, sample_comparison)
        VALUES (?, 'WRITING', ?, ?, ?, ?, ?)
      `, [
        gradingId,
        subId,
        aiResult.overall_band,
        JSON.stringify(aiResult.criteria),
        aiResult.general_feedback,
        aiResult.sample_comparison || ''
      ]);

      // Save Errors into error_instances for Error Notebook
      if (aiResult.errors && Array.isArray(aiResult.errors)) {
        for (const err of aiResult.errors) {
          // find tag_id
          const tagStmt = db.prepare("SELECT id FROM error_tags WHERE code = ?");
          tagStmt.bind([err.error_tag_code]);
          let tagId = 'et_1';
          if (tagStmt.step()) {
            tagId = tagStmt.getAsObject().id as string;
          }
          tagStmt.free();

          db.run(`
            INSERT INTO error_instances (id, user_id, error_tag_id, source_type, source_id, original_text, corrected_text, explanation)
            VALUES (?, ?, ?, 'WRITING', ?, ?, ?, ?)
          `, [genId('err'), user_id || 'u_student', tagId, subId, err.original_text, err.corrected_text, err.explanation]);
        }
      }

      // Save Advanced Suggestions
      if (aiResult.suggestions && Array.isArray(aiResult.suggestions)) {
        for (const sug of aiResult.suggestions) {
          db.run(`
            INSERT INTO advanced_suggestions (id, submission_id, original_phrase, suggested_phrase, target_band, reason)
            VALUES (?, ?, ?, ?, ?, ?)
          `, [genId('sug'), subId, sug.original_phrase, sug.suggested_phrase, sug.target_band || 7.5, sug.reason]);
        }
      }

      saveDb();

      res.json({
        submission_id: subId,
        word_count: wordCount,
        result: aiResult
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 4. AI Speaking Grading
  app.post('/api/grading/speaking', upload.single('audio'), async (req, res) => {
    const { user_id, part, prompt_title, transcript } = req.body;

    try {
      const subId = genId('sub_s');
      const speakingTranscript = transcript || 'Candidate spoke about their personal experience...';

      db.run(`
        INSERT INTO speaking_submissions (id, user_id, part, prompt_title, transcript)
        VALUES (?, ?, ?, ?, ?)
      `, [subId, user_id || 'u_student', part || 'PART_2', prompt_title || 'Describe a trip', speakingTranscript]);

      const aiResult = await gradeSpeakingResponse(
        part || 'PART_2',
        prompt_title || 'Speaking Topic',
        speakingTranscript
      );

      const gradingId = genId('gr_s');
      db.run(`
        INSERT INTO ai_grading_results (id, submission_type, submission_id, overall_band, criteria_json, general_feedback)
        VALUES (?, 'SPEAKING', ?, ?, ?, ?)
      `, [
        gradingId,
        subId,
        aiResult.overall_band,
        JSON.stringify(aiResult.criteria),
        aiResult.general_feedback
      ]);

      if (aiResult.errors && Array.isArray(aiResult.errors)) {
        for (const err of aiResult.errors) {
          db.run(`
            INSERT INTO error_instances (id, user_id, error_tag_id, source_type, source_id, original_text, corrected_text, explanation)
            VALUES (?, ?, 'et_6', 'SPEAKING', ?, ?, ?, ?)
          `, [genId('err'), user_id || 'u_student', subId, err.original_text, err.corrected_text, err.explanation]);
        }
      }

      saveDb();

      res.json({
        submission_id: subId,
        result: aiResult
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 5. AI Brainstorm Generator
  app.post('/api/ai/brainstorm', async (req, res) => {
    const { topic, task_type } = req.body;
    try {
      const ideas = await generateBrainstormIdeas(topic || 'AI Automation and Job Market', task_type || 'Task 2');
      res.json(ideas);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 6. Error Notebook (Tổng hợp lỗi sai)
  app.get('/api/error-notebook', async (req, res) => {
    const userId = (req.query.user_id as string) || 'u_student';
    try {
      const stmt = db.prepare(`
        SELECT ei.*, et.code as error_tag_code, et.name as error_tag_name, et.category as error_category
        FROM error_instances ei
        JOIN error_tags et ON ei.error_tag_id = et.id
        WHERE ei.user_id = ?
        ORDER BY ei.created_at DESC
      `);
      stmt.bind([userId]);

      const errors: any[] = [];
      while (stmt.step()) {
        errors.push(stmt.getAsObject());
      }
      stmt.free();

      // Group by tag count
      const tagStatsMap = new Map<string, { code: string; name: string; count: number }>();
      for (const err of errors) {
        const code = err.error_tag_code as string;
        const existing = tagStatsMap.get(code);
        if (existing) {
          existing.count++;
        } else {
          tagStatsMap.set(code, { code, name: err.error_tag_name as string, count: 1 });
        }
      }

      res.json({
        errors,
        frequent_errors: Array.from(tagStatsMap.values()).sort((a, b) => b.count - a.count)
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 7. Vocabulary Notebook & Dictionary Lookup
  app.get('/api/vocab', async (req, res) => {
    const userId = (req.query.user_id as string) || 'u_student';
    try {
      const stmt = db.prepare("SELECT * FROM user_vocab_notebook WHERE user_id = ? ORDER BY created_at DESC");
      stmt.bind([userId]);
      const words: any[] = [];
      while (stmt.step()) {
        words.push(stmt.getAsObject());
      }
      stmt.free();
      res.json({ words });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/vocab/lookup', async (req, res) => {
    const { word, user_id } = req.body;
    try {
      const details = await lookupVocabDetails(word);

      // Save to vocabulary notebook if user_id provided
      if (user_id) {
        db.run(`
          INSERT INTO user_vocab_notebook (id, user_id, word, ipa, meaning_vi, example_sentence)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [genId('v'), user_id, details.word, details.ipa, details.meaning_vi, details.example_sentence]);
        saveDb();
      }

      res.json(details);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 8. Knowledge Base Articles
  app.get('/api/knowledge', async (req, res) => {
    try {
      const stmt = db.prepare("SELECT * FROM knowledge_articles WHERE status = 'APPROVED' ORDER BY created_at DESC");
      const articles: any[] = [];
      while (stmt.step()) {
        const art = stmt.getAsObject();
        art.tags = art.tags_json ? JSON.parse(art.tags_json as string) : [];
        articles.push(art);
      }
      stmt.free();
      res.json({ articles });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 9. User Dashboard Stats & Predictive Scoring
  app.get('/api/user/stats', async (req, res) => {
    const userId = (req.query.user_id as string) || 'u_student';
    try {
      // Get attempts
      const attStmt = db.prepare(`
        SELECT uta.*, t.skill_type
        FROM user_test_attempts uta
        JOIN tests t ON uta.test_id = t.id
        WHERE uta.user_id = ?
        ORDER BY uta.created_at DESC
        LIMIT 10
      `);
      attStmt.bind([userId]);
      const attempts: any[] = [];
      while (attStmt.step()) {
        attempts.push(attStmt.getAsObject());
      }
      attStmt.free();

      // Get latest writing submissions
      const wrStmt = db.prepare(`
        SELECT agr.overall_band
        FROM ai_grading_results agr
        JOIN writing_submissions ws ON agr.submission_id = ws.id
        WHERE ws.user_id = ? AND agr.submission_type = 'WRITING'
        ORDER BY agr.created_at DESC LIMIT 3
      `);
      wrStmt.bind([userId]);
      const writingBands: number[] = [];
      while (wrStmt.step()) {
        writingBands.push(wrStmt.getAsObject().overall_band as number);
      }
      wrStmt.free();

      // Get latest speaking submissions
      const spStmt = db.prepare(`
        SELECT agr.overall_band
        FROM ai_grading_results agr
        JOIN speaking_submissions ss ON agr.submission_id = ss.id
        WHERE ss.user_id = ? AND agr.submission_type = 'SPEAKING'
        ORDER BY agr.created_at DESC LIMIT 3
      `);
      spStmt.bind([userId]);
      const speakingBands: number[] = [];
      while (spStmt.step()) {
        speakingBands.push(spStmt.getAsObject().overall_band as number);
      }
      spStmt.free();

      // Skill Averages
      let readingBand = 6.5;
      let listeningBand = 7.0;
      let writingBand = writingBands.length ? (writingBands.reduce((a, b) => a + b, 0) / writingBands.length) : 6.0;
      let speakingBand = speakingBands.length ? (speakingBands.reduce((a, b) => a + b, 0) / speakingBands.length) : 6.5;

      const readingAttempts = attempts.filter(a => a.skill_type === 'READING');
      if (readingAttempts.length) {
        readingBand = readingAttempts.reduce((acc, a) => acc + Number(a.band_score), 0) / readingAttempts.length;
      }

      const listeningAttempts = attempts.filter(a => a.skill_type === 'LISTENING');
      if (listeningAttempts.length) {
        listeningBand = listeningAttempts.reduce((acc, a) => acc + Number(a.band_score), 0) / listeningAttempts.length;
      }

      const rawOverall = (readingBand + listeningBand + writingBand + speakingBand) / 4;
      // Round to nearest 0.5 IELTS Band
      const predictedOverall = Math.round(rawOverall * 2) / 2;

      // Fetch streak & wallet
      const strStmt = db.prepare("SELECT * FROM streaks WHERE user_id = ?");
      strStmt.bind([userId]);
      let streakDays = 5;
      if (strStmt.step()) {
        streakDays = (strStmt.getAsObject().current_streak as number) || 5;
      }
      strStmt.free();

      const walStmt = db.prepare("SELECT * FROM wallets WHERE user_id = ?");
      walStmt.bind([userId]);
      let credits = 25;
      if (walStmt.step()) {
        credits = (walStmt.getAsObject().credits as number) || 25;
      }
      walStmt.free();

      res.json({
        predicted_overall_band: predictedOverall,
        confidence_level: attempts.length >= 3 ? "Độ tin cậy Cao (dựa trên các bài thi gần đây)" : "Độ tin cậy Trung bình (cần làm thêm bài thi thử)",
        skill_bands: {
          reading: Math.round(readingBand * 2) / 2,
          listening: Math.round(listeningBand * 2) / 2,
          writing: Math.round(writingBand * 2) / 2,
          speaking: Math.round(speakingBand * 2) / 2
        },
        total_attempts: attempts.length,
        streak_days: streakDays,
        credits: credits
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ===================== VITE OR STATIC MIDDLEWARE =====================
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 IELTS Master AI Server running on http://localhost:${PORT}`);
  });
}

startServer();

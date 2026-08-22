import express from 'express';
import path from 'path';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';
import { getDb, saveDb } from './server/db.js';
import { IELTS_LISTENING_TEST_1 } from './server/listeningTestData.js';
import { gradeWritingEssay, gradeFullWritingExam, gradeSpeakingResponse, generateBrainstormIdeas, lookupVocabDetails, generateFullStudySchedule, generateQuizizzQuestions, generateQuizizzFromFile } from './server/geminiService.js';

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

        // If listening test, attach transcript lines & duration from listening seed data
        if (test.skill_type === 'LISTENING') {
          const matchedSeedSec = IELTS_LISTENING_TEST_1.sections.find(s => s.id === sec.id);
          if (matchedSeedSec) {
            sec.transcript_lines = matchedSeedSec.transcript_lines;
            sec.duration_seconds = matchedSeedSec.duration_seconds;
          }
        }
      }

      res.json({ test, sections });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/tests/:id/submit', async (req, res) => {
    const { id } = req.params;
    const { user_id, answers, time_spent_seconds, mode, section_id } = req.body;

    try {
      // Fetch test details for logging errors and determining skill type
      const testInfoStmt = db.prepare("SELECT title, skill_type FROM tests WHERE id = ?");
      testInfoStmt.bind([id]);
      let testTitle = '';
      let testSkill = 'READING';
      if (testInfoStmt.step()) {
        const tObj = testInfoStmt.getAsObject();
        testTitle = tObj.title as string;
        testSkill = (tObj.skill_type as string) || 'READING';
      }
      testInfoStmt.free();

      // Get all questions or specific section questions if section_id is provided
      let qStmt;
      if (section_id) {
        qStmt = db.prepare(`
          SELECT q.id, q.correct_answer, q.explanation_text, q.question_number, q.options_json
          FROM questions q
          JOIN test_sections ts ON q.section_id = ts.id
          WHERE ts.test_id = ? AND ts.id = ?
        `);
        qStmt.bind([id, section_id]);
      } else {
        qStmt = db.prepare(`
          SELECT q.id, q.correct_answer, q.explanation_text, q.question_number, q.options_json
          FROM questions q
          JOIN test_sections ts ON q.section_id = ts.id
          WHERE ts.test_id = ?
        `);
        qStmt.bind([id]);
      }
      const questionsMap = new Map<string, any>();
      while (qStmt.step()) {
        const q = qStmt.getAsObject();
        questionsMap.set(q.id as string, q);
      }
      qStmt.free();

      let correctCount = 0;
      const totalQuestions = questionsMap.size || 1;
      const evaluatedAnswers: any[] = [];

      // Helper to check answer correctness flexibly
      const checkIsCorrect = (userAns: string, correctAns: string, optionsJson?: string): boolean => {
        const u = (userAns || '').trim().toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, ' ').replace(/\s+/g, ' ').trim();
        const c = (correctAns || '').trim().toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, ' ').replace(/\s+/g, ' ').trim();
        if (!u) return false;
        if (u === c) return true;

        // Strip prefixes like "a - ", "a: ", "1. "
        const uLetter = u.replace(/^([a-z])[\s\-:.)]+.*$/, '$1');
        const cLetter = c.replace(/^([a-z])[\s\-:.)]+.*$/, '$1');
        if (uLetter.length === 1 && cLetter.length === 1 && uLetter === cLetter) return true;

        // TRUE/FALSE/NOT GIVEN or YES/NO/NOT GIVEN aliases
        if ((c === 'yes' || c === 'true') && (u === 'yes' || u === 'true' || u === 'y' || u === 't')) return true;
        if ((c === 'no' || c === 'false') && (u === 'no' || u === 'false' || u === 'n' || u === 'f')) return true;
        if (c === 'not given' && (u === 'not given' || u === 'ng')) return true;

        // Singular / Plural variations & synonyms
        if (c === 'habitats' && u === 'habitat') return true;
        if (c === 'habitat' && u === 'habitats') return true;
        if (c === 'antibiotics' && u === 'antibiotic') return true;
        if (c === 'antibiotic' && u === 'antibiotics') return true;
        if (c === 'pizzas' && u === 'pizza') return true;
        if (c === 'pizza' && u === 'pizzas') return true;
        if (c === 'walking' && (u === 'walk' || u === 'walking exercise' || u === 'for a walk')) return true;
        if (c === 'fruit juice' && (u === 'juice' || u === 'fresh fruit juice')) return true;
        if (c === 'all corners' && (u === 'corners' || u === 'the corners' || u === 'all the corners')) return true;
        if (c === 'special skill' && (u === 'skill' || u === 'special skills')) return true;
        if (c === 'learning toys' && (u === 'toys' || u === 'special learning toys')) return true;
        if (c === 'germs' && (u === 'colds and flus' || u === 'infections' || u === 'infection' || u === 'viruses')) return true;
        if (c === 'topic' && u === 'a topic') return true;
        if (c === 'one' && (u === 'one area' || u === 'specific' || u === '1')) return true;
        if (c === 'thesis' && (u === 'a thesis' || u === 'thesis statement')) return true;
        if (c === 'outline' && u === 'an outline') return true;
        if (c === 'progresses' && (u === 'progress' || u === 'progression' || u === 'proceeds' || u === 'flows')) return true;
        if (c === 'aspects' && u === 'aspect') return true;
        if (c === 'real life' && (u === 'real' || u === 'real world')) return true;
        if (c === 'necessity' && u === 'academic necessity') return true;
        if (c === 'style guide' && u === 'university style guide') return true;
        if ((c === '10%' || c === '10') && (u === '10%' || u === '10 percent' || u === 'ten percent' || u === '10')) return true;
        if (c === 'dying' && u === 'sick and dying') return true;
        if (c === 'attention' && (u === 'scant attention' || u === 'interest')) return true;
        if (c === 'bruno' && (u === 'giordano bruno' || u === 'giordano')) return true;
        if (c === 'motion' && (u === 'movement' || u === 'orbit' || u === 'revolution')) return true;
        if (c === 'bible' && (u === 'the bible' || u === 'scripture')) return true;
        if ((c === '20%' || c === '20') && (u === '20%' || u === '20 percent' || u === 'twenty percent' || u === '20')) return true;

        // Check if user entered the option text matching the chosen letter
        if (optionsJson) {
          try {
            const opts: string[] = JSON.parse(optionsJson);
            const matchedOpt = opts.find(o => {
              const cleaned = o.trim().toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, ' ').replace(/\s+/g, ' ');
              return cleaned.startsWith(u + ' ') || cleaned.startsWith(u) || cleaned === u;
            });
            if (matchedOpt) {
              const optCleaned = matchedOpt.trim().toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, ' ').replace(/\s+/g, ' ');
              if (optCleaned.includes(c) || c.includes(uLetter) || c === uLetter) return true;
            }
          } catch {}
        }

        return false;
      };

      // Loop through all questions to evaluate every single question
      const answerRecord = (answers || {}) as Record<string, string>;
      for (const [qId, qInfo] of questionsMap.entries()) {
        const userAns = (answerRecord[qId] || '').trim();
        const isCorrect = checkIsCorrect(userAns, String(qInfo.correct_answer), qInfo.options_json as string);
        if (isCorrect) correctCount++;

        evaluatedAnswers.push({
          question_id: qId,
          question_number: qInfo.question_number,
          user_answer: userAns,
          is_correct: isCorrect,
          correct_answer: qInfo.correct_answer,
          explanation_text: qInfo.explanation_text
        });
      }

      // Sort evaluated answers by question number
      evaluatedAnswers.sort((a, b) => (a.question_number || 0) - (b.question_number || 0));

      // Calculate IELTS Band Score
      let bandScore = 2.0;
      if (testSkill === 'LISTENING') {
        // Official IELTS Listening Band Score Scale:
        // 39-40: 9.0 | 37-38: 8.5 | 35-36: 8.0 | 32-34: 7.5 | 30-31: 7.0 | 26-29: 6.5 | 23-25: 6.0
        // 18-22: 5.5 | 16-17: 5.0 | 13-15: 4.5 | 10-12: 4.0 | 6-9: 3.5 | 4-5: 3.0 | 0-3: 2.5
        if (totalQuestions >= 35) {
          if (correctCount >= 39) bandScore = 9.0;
          else if (correctCount >= 37) bandScore = 8.5;
          else if (correctCount >= 35) bandScore = 8.0;
          else if (correctCount >= 32) bandScore = 7.5;
          else if (correctCount >= 30) bandScore = 7.0;
          else if (correctCount >= 26) bandScore = 6.5;
          else if (correctCount >= 23) bandScore = 6.0;
          else if (correctCount >= 18) bandScore = 5.5;
          else if (correctCount >= 16) bandScore = 5.0;
          else if (correctCount >= 13) bandScore = 4.5;
          else if (correctCount >= 10) bandScore = 4.0;
          else if (correctCount >= 6) bandScore = 3.5;
          else if (correctCount >= 4) bandScore = 3.0;
          else bandScore = 2.5;
        } else {
          const rawRatio = correctCount / totalQuestions;
          if (rawRatio >= 0.9) bandScore = 8.5;
          else if (rawRatio >= 0.8) bandScore = 7.5;
          else if (rawRatio >= 0.7) bandScore = 7.0;
          else if (rawRatio >= 0.6) bandScore = 6.5;
          else if (rawRatio >= 0.5) bandScore = 6.0;
          else if (rawRatio >= 0.4) bandScore = 5.5;
          else bandScore = 5.0;
        }
      } else {
        // Official IELTS Academic Reading Band Score Scale
        if (totalQuestions >= 35) {
          if (correctCount >= 39) bandScore = 9.0;
          else if (correctCount >= 37) bandScore = 8.5;
          else if (correctCount >= 35) bandScore = 8.0;
          else if (correctCount >= 33) bandScore = 7.5;
          else if (correctCount >= 30) bandScore = 7.0;
          else if (correctCount >= 27) bandScore = 6.5;
          else if (correctCount >= 23) bandScore = 6.0;
          else if (correctCount >= 20) bandScore = 5.5;
          else if (correctCount >= 16) bandScore = 5.0;
          else if (correctCount >= 13) bandScore = 4.5;
          else if (correctCount >= 10) bandScore = 4.0;
          else if (correctCount >= 7) bandScore = 3.5;
          else if (correctCount >= 5) bandScore = 3.0;
          else if (correctCount >= 3) bandScore = 2.5;
          else bandScore = 2.0;
        } else {
          const rawRatio = correctCount / totalQuestions;
          if (rawRatio >= 0.9) bandScore = 8.5;
          else if (rawRatio >= 0.8) bandScore = 7.5;
          else if (rawRatio >= 0.7) bandScore = 7.0;
          else if (rawRatio >= 0.6) bandScore = 6.5;
          else if (rawRatio >= 0.5) bandScore = 6.0;
          else if (rawRatio >= 0.4) bandScore = 5.5;
          else bandScore = 5.0;
        }
      }

      const attemptId = genId('att');
      db.run(`
        INSERT INTO user_test_attempts (id, user_id, test_id, mode, band_score, correct_count, total_questions, time_spent_seconds, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'COMPLETED')
      `, [attemptId, user_id || 'u_student', id, mode || 'PRACTICE', bandScore, correctCount, totalQuestions, time_spent_seconds || 600]);

      // Fetch test details for logging errors
      const testInfoStmt = db.prepare("SELECT title, skill_type FROM tests WHERE id = ?");
      testInfoStmt.bind([id]);
      let testTitle = '';
      let testSkill = 'READING';
      if (testInfoStmt.step()) {
        const tObj = testInfoStmt.getAsObject();
        testTitle = tObj.title as string;
        testSkill = tObj.skill_type as string;
      }
      testInfoStmt.free();

      for (const ans of evaluatedAnswers) {
        db.run(`
          INSERT INTO user_answers (id, attempt_id, question_id, user_answer, is_correct)
          VALUES (?, ?, ?, ?, ?)
        `, [genId('ans'), attemptId, ans.question_id, ans.user_answer, ans.is_correct ? 1 : 0]);

        if (!ans.is_correct) {
          db.run(`
            INSERT INTO error_instances (id, user_id, error_tag_id, source_type, source_id, original_text, corrected_text, explanation)
            VALUES (?, ?, 'et_5', ?, ?, ?, ?, ?)
          `, [
            genId('err'),
            user_id || 'u_student',
            testSkill,
            id,
            `Bạn chọn "${ans.user_answer || '(bỏ trống)'}"`,
            `Đáp án đúng: ${ans.correct_answer}`,
            ans.explanation_text || 'Chưa đúng với đáp án chuẩn trong đề thi.'
          ]);
        }
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

  // 3b. Full IELTS Academic Writing Exam (Task 1 + Task 2 together in 60 mins)
  app.post('/api/grading/writing-full', async (req, res) => {
    const { user_id, task1_prompt, task1_essay, task2_prompt, task2_essay, target_band } = req.body;

    try {
      const task1WordCount = task1_essay ? task1_essay.trim().split(/\s+/).filter(Boolean).length : 0;
      const task2WordCount = task2_essay ? task2_essay.trim().split(/\s+/).filter(Boolean).length : 0;
      const subId1 = genId('sub_w1');
      const subId2 = genId('sub_w2');

      // Record submissions
      db.run(`
        INSERT INTO writing_submissions (id, user_id, task_type, prompt_title, essay_text, word_count)
        VALUES (?, ?, 'TASK_1', ?, ?, ?)
      `, [subId1, user_id || 'u_student', task1_prompt || 'IELTS Writing Task 1', task1_essay || '', task1WordCount]);

      db.run(`
        INSERT INTO writing_submissions (id, user_id, task_type, prompt_title, essay_text, word_count)
        VALUES (?, ?, 'TASK_2', ?, ?, ?)
      `, [subId2, user_id || 'u_student', task2_prompt || 'IELTS Writing Task 2', task2_essay || '', task2WordCount]);

      // Grade via Gemini AI
      const aiResult = await gradeFullWritingExam(
        task1_prompt || 'IELTS Writing Task 1',
        task1_essay || '',
        task2_prompt || 'IELTS Writing Task 2',
        task2_essay || '',
        target_band || 7.0
      );

      // Save Task 1 errors
      if (aiResult.task1_result?.errors && Array.isArray(aiResult.task1_result.errors)) {
        for (const err of aiResult.task1_result.errors) {
          db.run(`
            INSERT INTO error_instances (id, user_id, error_tag_id, source_type, source_id, original_text, corrected_text, explanation)
            VALUES (?, ?, 'et_1', 'WRITING', ?, ?, ?, ?)
          `, [genId('err'), user_id || 'u_student', subId1, err.original_text, err.corrected_text, err.explanation]);
        }
      }

      // Save Task 2 errors
      if (aiResult.task2_result?.errors && Array.isArray(aiResult.task2_result.errors)) {
        for (const err of aiResult.task2_result.errors) {
          db.run(`
            INSERT INTO error_instances (id, user_id, error_tag_id, source_type, source_id, original_text, corrected_text, explanation)
            VALUES (?, ?, 'et_4', 'WRITING', ?, ?, ?, ?)
          `, [genId('err'), user_id || 'u_student', subId2, err.original_text, err.corrected_text, err.explanation]);
        }
      }

      // Save Advanced Suggestions
      if (aiResult.task1_result?.suggestions && Array.isArray(aiResult.task1_result.suggestions)) {
        for (const sug of aiResult.task1_result.suggestions) {
          db.run(`
            INSERT INTO advanced_suggestions (id, submission_id, original_phrase, suggested_phrase, target_band, reason)
            VALUES (?, ?, ?, ?, ?, ?)
          `, [genId('sug'), subId1, sug.original_phrase, sug.suggested_phrase, sug.target_band || 7.5, sug.reason]);
        }
      }

      if (aiResult.task2_result?.suggestions && Array.isArray(aiResult.task2_result.suggestions)) {
        for (const sug of aiResult.task2_result.suggestions) {
          db.run(`
            INSERT INTO advanced_suggestions (id, submission_id, original_phrase, suggested_phrase, target_band, reason)
            VALUES (?, ?, ?, ?, ?, ?)
          `, [genId('sug'), subId2, sug.original_phrase, sug.suggested_phrase, sug.target_band || 7.5, sug.reason]);
        }
      }

      saveDb();

      res.json({
        task1_sub_id: subId1,
        task2_sub_id: subId2,
        task1_word_count: task1WordCount,
        task2_word_count: task2WordCount,
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
        const row = stmt.getAsObject() as any;

        // Resolve source_title (Tên bài thi / Đề bài)
        let source_title = '';

        if (row.source_type === 'WRITING') {
          const wStmt = db.prepare("SELECT prompt_title FROM writing_submissions WHERE id = ?");
          wStmt.bind([row.source_id]);
          if (wStmt.step()) {
            source_title = wStmt.getAsObject().prompt_title as string;
          }
          wStmt.free();
          if (!source_title) source_title = 'Writing Task 2: AI Automation & Future Jobs';
        } else if (row.source_type === 'SPEAKING') {
          const sStmt = db.prepare("SELECT prompt_title FROM speaking_submissions WHERE id = ?");
          sStmt.bind([row.source_id]);
          if (sStmt.step()) {
            source_title = sStmt.getAsObject().prompt_title as string;
          }
          sStmt.free();
          if (!source_title) source_title = 'Speaking Part 2: Describe a Memorable Journey';
        } else if (row.source_type === 'READING' || row.source_type === 'LISTENING') {
          const tStmt = db.prepare("SELECT title FROM tests WHERE id = ?");
          tStmt.bind([row.source_id]);
          if (tStmt.step()) {
            source_title = tStmt.getAsObject().title as string;
          } else {
            const attStmt = db.prepare("SELECT t.title FROM user_test_attempts uta JOIN tests t ON uta.test_id = t.id WHERE uta.id = ?");
            attStmt.bind([row.source_id]);
            if (attStmt.step()) {
              source_title = attStmt.getAsObject().title as string;
            }
            attStmt.free();
          }
          tStmt.free();
          if (!source_title) {
            source_title = row.source_type === 'READING' ? 'Reading Cam 18 Test 1: Coral Reefs' : 'Listening Practice: Campus Tour';
          }
        }

        if (!source_title) source_title = 'Đề thi / Bài tập tổng hợp';
        row.source_title = source_title;
        errors.push(row);
      }
      stmt.free();

      // Group by tag count
      const tagStatsMap = new Map<string, { code: string; name: string; count: number }>();
      // Group by test / source_title count
      const testStatsMap = new Map<string, { source_title: string; source_type: string; count: number }>();

      for (const err of errors) {
        const code = err.error_tag_code as string;
        const existingTag = tagStatsMap.get(code);
        if (existingTag) {
          existingTag.count++;
        } else {
          tagStatsMap.set(code, { code, name: err.error_tag_name as string, count: 1 });
        }

        const title = err.source_title as string;
        const existingTest = testStatsMap.get(title);
        if (existingTest) {
          existingTest.count++;
        } else {
          testStatsMap.set(title, { source_title: title, source_type: err.source_type as string, count: 1 });
        }
      }

      res.json({
        errors,
        frequent_errors: Array.from(tagStatsMap.values()).sort((a, b) => b.count - a.count),
        test_errors: Array.from(testStatsMap.values()).sort((a, b) => b.count - a.count)
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

  app.post('/api/vocab/quizizz', async (req, res) => {
    const { user_id, topic, manual_words, save_to_notebook } = req.body;
    try {
      let wordsList: any[] = [];
      
      if (manual_words && typeof manual_words === 'string' && manual_words.trim().length > 0) {
        const rawWords = manual_words.split(/[\n,;]+/).map(w => w.trim()).filter(w => w.length > 0);
        wordsList = rawWords.map(w => ({ word: w }));

        if (save_to_notebook) {
          for (const wordStr of rawWords) {
            db.run(`
              INSERT INTO user_vocab_notebook (id, user_id, word, ipa, meaning_vi, example_sentence)
              VALUES (?, 'u_student', ?, '', '', '')
            `, [genId('v'), wordStr]);
          }
          saveDb();
        }
      } else if (user_id) {
        const stmt = db.prepare("SELECT word, meaning_vi, example_sentence FROM user_vocab_notebook WHERE user_id = ? ORDER BY created_at DESC LIMIT 20");
        stmt.bind([user_id]);
        while (stmt.step()) {
          wordsList.push(stmt.getAsObject());
        }
        stmt.free();
      }

      const quizData = await generateQuizizzQuestions(wordsList, topic);
      res.json(quizData);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/vocab/quizizz-upload', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Vui lòng chọn file (ảnh, PDF, TXT, DOCX) để tải lên.' });
      }

      const fileBuffer = req.file.buffer;
      const mimeType = req.file.mimetype || 'application/octet-stream';
      const originalName = req.file.originalname || 'uploaded_document';

      const quizData = await generateQuizizzFromFile(fileBuffer, mimeType, originalName);

      // Save extracted words into user's vocab notebook automatically if extracted_words is present
      if (quizData.extracted_words && Array.isArray(quizData.extracted_words)) {
        for (const ew of quizData.extracted_words) {
          if (ew.word && ew.meaning_vi) {
            db.run(`
              INSERT INTO user_vocab_notebook (id, user_id, word, ipa, meaning_vi, example_sentence)
              VALUES (?, 'u_student', ?, ?, ?, ?)
            `, [genId('v'), ew.word, ew.ipa || '', ew.meaning_vi, ew.example_sentence || '']);
          }
        }
        saveDb();
      }

      res.json(quizData);
    } catch (err: any) {
      console.error("Quizizz Upload Handler Error:", err);
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

      // Fetch frequent errors from error_instances
      const errStmt = db.prepare(`
        SELECT et.code as tag_code, et.name as name
        FROM error_instances ei
        JOIN error_tags et ON ei.error_tag_id = et.id
        WHERE ei.user_id = ?
      `);
      errStmt.bind([userId]);
      const tagStatsMap = new Map<string, { tag_code: string; name: string; count: number }>();
      while (errStmt.step()) {
        const row = errStmt.getAsObject() as any;
        const code = row.tag_code as string;
        const existing = tagStatsMap.get(code);
        if (existing) {
          existing.count++;
        } else {
          tagStatsMap.set(code, { tag_code: code, name: row.name as string, count: 1 });
        }
      }
      errStmt.free();
      const frequentErrors = Array.from(tagStatsMap.values()).sort((a, b) => b.count - a.count);

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
        credits: credits,
        frequent_errors: frequentErrors
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // GET /api/leaderboard - Top 10 Leaderboard based on practice count + practice score
  app.get('/api/leaderboard', async (req, res) => {
    try {
      const db = await getDb();
      const userId = (req.query.user_id as string) || 'u_student';

      // Calculate current user practice count and average score
      const testAttemptsStmt = db.prepare("SELECT band_score FROM user_test_attempts WHERE user_id = ?");
      testAttemptsStmt.bind([userId]);
      let testCount = 0;
      let totalBands = 0;
      while (testAttemptsStmt.step()) {
        testCount++;
        totalBands += Number(testAttemptsStmt.getAsObject().band_score) || 6.5;
      }
      testAttemptsStmt.free();

      const wrStmt = db.prepare("SELECT count(*) as cnt FROM writing_submissions WHERE user_id = ?");
      wrStmt.bind([userId]);
      let wrCount = 0;
      if (wrStmt.step()) wrCount = (wrStmt.getAsObject().cnt as number) || 0;
      wrStmt.free();

      const spStmt = db.prepare("SELECT count(*) as cnt FROM speaking_submissions WHERE user_id = ?");
      spStmt.bind([userId]);
      let spCount = 0;
      if (spStmt.step()) spCount = (spStmt.getAsObject().cnt as number) || 0;
      spStmt.free();

      const vocabStmt = db.prepare("SELECT count(*) as cnt FROM user_vocab_notebook WHERE user_id = ?");
      vocabStmt.bind([userId]);
      let vocabCount = 0;
      if (vocabStmt.step()) vocabCount = (vocabStmt.getAsObject().cnt as number) || 0;
      vocabStmt.free();

      // Combined practice sessions count
      const userPracticeCount = Math.max(26, testCount + wrCount + spCount + Math.floor(vocabCount / 2));
      const userAvgBand = testCount > 0 ? Math.round((totalBands / testCount) * 2) / 2 : 7.5;
      const userTotalScore = (userPracticeCount * 20) + Math.round(userAvgBand * 30);

      const baseLeaderboard = [
        { user_id: 'u_triet', full_name: 'Hoàng Minh Triết', avatar_initials: 'MT', practice_count: 42, avg_band: 8.5, total_score: 1095, is_current_user: false },
        { user_id: 'u_dung', full_name: 'Lê Quốc Dũng', avatar_initials: 'LD', practice_count: 36, avg_band: 8.5, total_score: 975, is_current_user: false },
        { user_id: 'u_yen', full_name: 'Trần Thị Hải Yến', avatar_initials: 'HY', practice_count: 31, avg_band: 8.0, total_score: 860, is_current_user: false },
        { user_id: userId, full_name: 'Nguyễn Văn Học Viên (Bạn)', avatar_initials: 'NV', practice_count: userPracticeCount, avg_band: userAvgBand, total_score: userTotalScore, is_current_user: true },
        { user_id: 'u_ha', full_name: 'Phạm Thu Hà', avatar_initials: 'TH', practice_count: 27, avg_band: 8.0, total_score: 780, is_current_user: false },
        { user_id: 'u_thu', full_name: 'Trần Hoài Thu', avatar_initials: 'TT', practice_count: 24, avg_band: 7.5, total_score: 705, is_current_user: false },
        { user_id: 'u_anh', full_name: 'Đỗ Đức Anh', avatar_initials: 'DA', practice_count: 21, avg_band: 7.5, total_score: 645, is_current_user: false },
        { user_id: 'u_mai', full_name: 'Vũ Quỳnh Mai', avatar_initials: 'QM', practice_count: 18, avg_band: 7.0, total_score: 570, is_current_user: false },
        { user_id: 'u_nam', full_name: 'Đặng Bảo Nam', avatar_initials: 'BN', practice_count: 15, avg_band: 7.0, total_score: 510, is_current_user: false },
        { user_id: 'u_hang', full_name: 'Bùi Thanh Hằng', avatar_initials: 'BH', practice_count: 13, avg_band: 6.5, total_score: 455, is_current_user: false },
        { user_id: 'u_long', full_name: 'Ngô Hoàng Long', avatar_initials: 'HL', practice_count: 10, avg_band: 6.5, total_score: 395, is_current_user: false },
      ];

      // Sort by total_score descending
      baseLeaderboard.sort((a, b) => b.total_score - a.total_score);

      // Assign ranks
      const rankedLeaderboard = baseLeaderboard.map((item, index) => ({
        ...item,
        rank: index + 1
      }));

      // Top 10
      const top10 = rankedLeaderboard.slice(0, 10);
      const currentUserRankItem = rankedLeaderboard.find(u => u.is_current_user);

      res.json({
        leaderboard: top10,
        user_rank: currentUserRankItem
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

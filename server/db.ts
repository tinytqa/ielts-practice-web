import fs from 'fs';
import path from 'path';
import initSqlJs, { Database } from 'sql.js';

const DB_FILE = path.join(process.cwd(), 'database.sqlite');
let db: Database | null = null;

function saveDatabase() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_FILE, buffer);
  }
}

export async function getDb(): Promise<Database> {
  if (db) return db;

  const SQL = await initSqlJs();
  if (fs.existsSync(DB_FILE)) {
    const filebuffer = fs.readFileSync(DB_FILE);
    db = new SQL.Database(filebuffer);
  } else {
    db = new SQL.Database();
  }

  // Ensure PRAGMA foreign_keys = ON
  db.run("PRAGMA foreign_keys = ON;");

  // Create tables if not exist
  runMigrations(db);
  saveDatabase();

  return db;
}

export function saveDb() {
  saveDatabase();
}

function runMigrations(database: Database) {
  // 1. users
  database.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      avatar_url TEXT,
      role TEXT DEFAULT 'STUDENT',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 2. user_profiles
  database.run(`
    CREATE TABLE IF NOT EXISTS user_profiles (
      user_id TEXT PRIMARY KEY,
      current_band REAL DEFAULT 5.5,
      target_band REAL DEFAULT 7.0,
      target_exam_date TEXT,
      weekly_hours INTEGER DEFAULT 10,
      study_plan_json TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // 3. tests
  database.run(`
    CREATE TABLE IF NOT EXISTS tests (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      skill_type TEXT NOT NULL,
      category TEXT DEFAULT 'ACADEMIC',
      difficulty TEXT DEFAULT 'MEDIUM',
      time_limit_minutes INTEGER DEFAULT 60,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 4. test_sections
  database.run(`
    CREATE TABLE IF NOT EXISTS test_sections (
      id TEXT PRIMARY KEY,
      test_id TEXT NOT NULL,
      title TEXT NOT NULL,
      content_passage TEXT NOT NULL,
      audio_url TEXT,
      order_index INTEGER DEFAULT 1,
      FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE
    );
  `);

  // 5. questions
  database.run(`
    CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      section_id TEXT NOT NULL,
      question_number INTEGER NOT NULL,
      question_type TEXT NOT NULL,
      prompt TEXT NOT NULL,
      options_json TEXT,
      correct_answer TEXT NOT NULL,
      explanation_text TEXT NOT NULL,
      FOREIGN KEY (section_id) REFERENCES test_sections(id) ON DELETE CASCADE
    );
  `);

  // 6. user_test_attempts
  database.run(`
    CREATE TABLE IF NOT EXISTS user_test_attempts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      test_id TEXT NOT NULL,
      mode TEXT DEFAULT 'PRACTICE',
      band_score REAL DEFAULT 0.0,
      correct_count INTEGER DEFAULT 0,
      total_questions INTEGER DEFAULT 0,
      time_spent_seconds INTEGER DEFAULT 0,
      status TEXT DEFAULT 'COMPLETED',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (test_id) REFERENCES tests(id)
    );
  `);

  // 7. user_answers
  database.run(`
    CREATE TABLE IF NOT EXISTS user_answers (
      id TEXT PRIMARY KEY,
      attempt_id TEXT NOT NULL,
      question_id TEXT NOT NULL,
      user_answer TEXT,
      is_correct BOOLEAN DEFAULT 0,
      FOREIGN KEY (attempt_id) REFERENCES user_test_attempts(id) ON DELETE CASCADE,
      FOREIGN KEY (question_id) REFERENCES questions(id)
    );
  `);

  // 8. writing_submissions
  database.run(`
    CREATE TABLE IF NOT EXISTS writing_submissions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      task_type TEXT NOT NULL,
      prompt_title TEXT NOT NULL,
      essay_text TEXT NOT NULL,
      word_count INTEGER DEFAULT 0,
      status TEXT DEFAULT 'COMPLETED',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // 9. speaking_submissions
  database.run(`
    CREATE TABLE IF NOT EXISTS speaking_submissions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      part TEXT NOT NULL,
      prompt_title TEXT NOT NULL,
      audio_url TEXT,
      transcript TEXT,
      status TEXT DEFAULT 'COMPLETED',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // 10. ai_grading_results
  database.run(`
    CREATE TABLE IF NOT EXISTS ai_grading_results (
      id TEXT PRIMARY KEY,
      submission_type TEXT NOT NULL,
      submission_id TEXT NOT NULL,
      overall_band REAL NOT NULL,
      criteria_json TEXT NOT NULL,
      general_feedback TEXT NOT NULL,
      sample_comparison TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 11. error_tags
  database.run(`
    CREATE TABLE IF NOT EXISTS error_tags (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT
    );
  `);

  // 12. error_instances
  database.run(`
    CREATE TABLE IF NOT EXISTS error_instances (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      error_tag_id TEXT NOT NULL,
      source_type TEXT NOT NULL,
      source_id TEXT NOT NULL,
      original_text TEXT NOT NULL,
      corrected_text TEXT NOT NULL,
      explanation TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (error_tag_id) REFERENCES error_tags(id)
    );
  `);

  // 13. advanced_suggestions
  database.run(`
    CREATE TABLE IF NOT EXISTS advanced_suggestions (
      id TEXT PRIMARY KEY,
      submission_id TEXT NOT NULL,
      original_phrase TEXT NOT NULL,
      suggested_phrase TEXT NOT NULL,
      target_band REAL DEFAULT 7.5,
      reason TEXT NOT NULL
    );
  `);

  // 14. knowledge_articles
  database.run(`
    CREATE TABLE IF NOT EXISTS knowledge_articles (
      id TEXT PRIMARY KEY,
      author_id TEXT NOT NULL,
      title TEXT NOT NULL,
      skill_type TEXT NOT NULL,
      content TEXT NOT NULL,
      tags_json TEXT DEFAULT '[]',
      status TEXT DEFAULT 'APPROVED',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES users(id)
    );
  `);

  // 15. user_vocab_notebook
  database.run(`
    CREATE TABLE IF NOT EXISTS user_vocab_notebook (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      word TEXT NOT NULL,
      ipa TEXT,
      meaning_vi TEXT NOT NULL,
      example_sentence TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // 16. streaks & wallets
  database.run(`
    CREATE TABLE IF NOT EXISTS streaks (
      user_id TEXT PRIMARY KEY,
      current_streak INTEGER DEFAULT 1,
      best_streak INTEGER DEFAULT 1,
      last_active_date TEXT,
      streak_freezes_left INTEGER DEFAULT 2
    );
  `);

  database.run(`
    CREATE TABLE IF NOT EXISTS wallets (
      user_id TEXT PRIMARY KEY,
      credits INTEGER DEFAULT 50,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed default data if empty
  seedInitialData(database);
}

function seedInitialData(database: Database) {
  // Check users count
  const res = database.exec("SELECT COUNT(*) as count FROM users");
  const count = res[0]?.values[0]?.[0] as number;

  if (count === 0) {
    console.log("🌱 Seeding database with initial IELTS test data, users, and error tags...");

    // Seed Users
    database.run(`
      INSERT INTO users (id, email, password_hash, full_name, role) VALUES
      ('u_student', 'student@ielts.vn', 'password123', 'Nguyễn Văn Học Viên', 'STUDENT'),
      ('u_teacher', 'teacher@ielts.vn', 'password123', 'Cô Nga IELTS 8.5', 'TEACHER'),
      ('u_admin', 'admin@ielts.vn', 'admin123', 'Quản Trị Viên System', 'ADMIN');
    `);

    // Seed Profiles
    database.run(`
      INSERT INTO user_profiles (user_id, current_band, target_band, target_exam_date, weekly_hours, study_plan_json) VALUES
      ('u_student', 5.5, 7.0, '2026-11-15', 12, '${JSON.stringify({
        reading: "3 đề/tuần - Tập trung True/False/Not Given & Matching Headings",
        listening: "4 đề/tuần - Nghe chép chính tả Part 2, Part 3",
        writing: "2 bài Task 2 + 1 bài Task 1/tuần - Cải thiện Grammatical Accuracy",
        speaking: "15 phút/ngày luyện Part 2 Cue Card & Speaking Partner AI"
      })}');
    `);

    // Seed Error Tags
    database.run(`
      INSERT INTO error_tags (id, code, name, category, description) VALUES
      ('et_1', 'grammar_tense', 'Lỗi Thì Động Từ (Verb Tenses)', 'GRAMMAR', 'Sử dụng sai thì động từ trong câu phức hoặc nhầm lẫn giữa Quá khứ đơn & Hiện tại hoàn thành.'),
      ('et_2', 'grammar_preposition', 'Lỗi Giới Từ (Prepositions)', 'GRAMMAR', 'Dùng sai giới từ đi kèm động từ/tính từ (như in, on, at, with, to).'),
      ('et_3', 'vocab_repetition', 'Lặp Từ Cơ Bản (Word Repetition)', 'VOCABULARY', 'Sử dụng lặp đi lặp lại một từ vựng đơn giản (như important, good, increase).'),
      ('et_4', 'vocab_collocation', 'Kết Hợp Từ Sai (Collocation Error)', 'VOCABULARY', 'Dùng từ không tự nhiên theo thói quen của người bản xứ (VD: make homework thay vì do homework).'),
      ('et_5', 'reading_tfng', 'Nhầm Lẫn False & Not Given', 'STRATEGY', 'Không phân biệt được giữa thông tin trái ngược (False) và thông tin không được đề cập (Not Given).'),
      ('et_6', 'pronunciation_stress', 'Sai Trọng Âm Từ (Word Stress)', 'PRONUNCIATION', 'Nhấn sai trọng âm các từ 3-4 âm tiết làm giảm độ rõ ràng khi nói.');
    `);

    // Seed Sample Tests (Reading, Listening, Writing, Speaking)
    database.run(`
      INSERT INTO tests (id, title, skill_type, category, difficulty, time_limit_minutes) VALUES
      ('test_r1', 'Reading Cam 18 Test 1: The Impact of Climate Change on Coral Reefs', 'READING', 'ACADEMIC', 'MEDIUM', 20),
      ('test_l1', 'Listening Practice: University Course Registration & Campus Tour', 'LISTENING', 'ACADEMIC', 'EASY', 15),
      ('test_w1', 'Writing Task 2: AI Automation & Future Jobs', 'WRITING', 'ACADEMIC', 'HARD', 40),
      ('test_s1', 'Speaking Part 2 & 3: Describe a Memorable Journey', 'SPEAKING', 'ACADEMIC', 'MEDIUM', 15);
    `);

    // Reading Passage & Questions
    database.run(`
      INSERT INTO test_sections (id, test_id, title, content_passage, order_index) VALUES
      ('ts_r1', 'test_r1', 'Passage 1: Coral Reef Ecosystems', 'Coral reefs are among the most diverse ecosystems on Earth, occupying less than 0.1% of the ocean floor yet supporting approximately 25% of all marine life. However, rising sea temperatures caused by global warming have led to widespread coral bleaching events. Bleaching occurs when stressed corals expel the symbiotic algae (zooxanthellae) living in their tissues, turning completely white. While bleached corals are not immediately dead, they are under extreme stress and vulnerable to disease. Research indicates that if ocean temperatures continue rising at current rates, over 90% of global reefs could face severe degradation by 2050.', 1);
    `);

    database.run(`
      INSERT INTO questions (id, section_id, question_number, question_type, prompt, options_json, correct_answer, explanation_text) VALUES
      ('q_r1', 'ts_r1', 1, 'MULTIPLE_CHOICE', 'What percentage of marine species depend on coral reefs for survival?', '${JSON.stringify(["Less than 0.1%", "Approximately 25%", "Over 50%", "Over 90%"])}', 'Approximately 25%', 'Đoạn văn ghi rõ: "occupying less than 0.1% of the ocean floor yet supporting approximately 25% of all marine life". Đáp án đúng là 25%.'),
      ('q_r2', 'ts_r1', 2, 'TRUE_FALSE_NOT_GIVEN', 'Corals die instantly as soon as bleaching occurs.', '${JSON.stringify(["TRUE", "FALSE", "NOT GIVEN"])}', 'FALSE', 'Đoạn văn ghi: "While bleached corals are not immediately dead, they are under extreme stress..." -> San hô tẩy trắng KHÔNG chết ngay lập tức, vì vậy mệnh đề này là FALSE.'),
      ('q_r3', 'ts_r1', 3, 'TRUE_FALSE_NOT_GIVEN', 'Symbiotic algae provide corals with their vibrant colors.', '${JSON.stringify(["TRUE", "FALSE", "NOT GIVEN"])}', 'NOT GIVEN', 'Đoạn văn chỉ đề cập tảo cộng sinh bị trục xuất khi san hô bị căng thẳng, KHÔNG đề cập việc tảo đó có tạo nên màu sắc rực rỡ hay không -> NOT GIVEN.'),
      ('q_r4', 'ts_r1', 4, 'FILL_BLANK', 'Rising ocean temperatures cause corals to expel symbiotic _____ from their tissues.', '${JSON.stringify([])}', 'algae', 'Đoạn 1 nêu: "...expel the symbiotic algae (zooxanthellae) living in their tissues". Từ cần điền là algae.'),
      ('q_r5', 'ts_r1', 5, 'MULTIPLE_CHOICE', 'According to scientists, what proportion of reefs could be degraded by 2050 if warming continues?', '${JSON.stringify(["Under 10%", "Around 25%", "Over 90%", "100%"])}', 'Over 90%', 'Đoạn văn nêu: "over 90% of global reefs could face severe degradation by 2050".');
    `);

    // Listening Passage & Questions
    database.run(`
      INSERT INTO test_sections (id, test_id, title, content_passage, audio_url, order_index) VALUES
      ('ts_l1', 'test_l1', 'Section 1: Conversation between Student and Admissions Officer', '[Audio Script]\nOfficer: Welcome to Central University Admissions. How can I help you today?\nStudent: Hi, I would like to register for the Advanced Academic English module starting next Monday.\nOfficer: Certainly. I need a few details first. May I have your full name and student ID number?\nStudent: My name is Minh Nguyen, and my ID is ST-88291.\nOfficer: Thank you, Minh. The course fee is $250, which includes textbooks and online library access. Classes are held every Tuesday and Thursday at 10:00 AM in Building C, Room 304.', '', 1);
    `);

    database.run(`
      INSERT INTO questions (id, section_id, question_number, question_type, prompt, options_json, correct_answer, explanation_text) VALUES
      ('q_l1', 'ts_l1', 1, 'FILL_BLANK', 'Student Full Name: Minh _____', '${JSON.stringify([])}', 'Nguyen', 'Trong audio: "My name is Minh Nguyen". Từ cần điền là Nguyen.'),
      ('q_l2', 'ts_l1', 2, 'FILL_BLANK', 'Student ID Number: ST-_____', '${JSON.stringify([])}', '88291', 'Trong audio: "my ID is ST-88291".'),
      ('q_l3', 'ts_l1', 3, 'MULTIPLE_CHOICE', 'How much is the course fee for the module?', '${JSON.stringify(["$150", "$200", "$250", "$300"])}', '$250', 'Nhân viên nói: "The course fee is $250".'),
      ('q_l4', 'ts_l1', 4, 'MULTIPLE_CHOICE', 'Which days are classes held?', '${JSON.stringify(["Monday & Wednesday", "Tuesday & Thursday", "Wednesday & Friday", "Saturday & Sunday"])}', 'Tuesday & Thursday', 'Trong audio: "Classes are held every Tuesday and Thursday at 10:00 AM".'),
      ('q_l5', 'ts_l1', 5, 'FILL_BLANK', 'Class location: Building C, Room _____', '${JSON.stringify([])}', '304', 'Nhân viên nêu rõ: "Building C, Room 304".');
    `);

    // Seed Knowledge Base Articles
    database.run(`
      INSERT INTO knowledge_articles (id, author_id, title, skill_type, content, tags_json, status) VALUES
      ('art_1', 'u_teacher', 'Bí quyết khắc phục lỗi nhầm lẫn giữa False và Not Given trong IELTS Reading', 'READING', 'Bài viết phân tích sâu quy tắc phân biệt:\n1. FALSE: Khi thông tin trong bài khẳng định ngược lại hoàn toàn với nhận định.\n2. NOT GIVEN: Khi nhận định có vẻ hợp lý nhưng bài đọc KHÔNG cung cấp đủ bằng chứng để khẳng định hay phủ định.\nHãy chú ý các từ mang tính tuyệt đối như always, never, only...', '["et_5", "reading_tfng"]', 'APPROVED'),
      ('art_2', 'u_teacher', 'Top 10 Collocations ăn điểm Band 7.5+ cho Writing Task 2 Topic Technology', 'WRITING', 'Thay vì dùng "modern technology", bạn có thể nâng cấp thành "cutting-edge technology" hoặc "state-of-the-art innovations".\nThay vì "change the world", dùng "revolutionize daily living"...', '["et_4", "vocab_collocation", "et_3"]', 'APPROVED');
    `);

    // Seed Sample Error Notebook Entries for Student
    database.run(`
      INSERT INTO error_instances (id, user_id, error_tag_id, source_type, source_id, original_text, corrected_text, explanation) VALUES
      ('err_1', 'u_student', 'et_1', 'WRITING', 'sub_w1', 'In recent years, artificial intelligence progressed rapidly.', 'In recent years, artificial intelligence HAS PROGRESSED rapidly.', 'Cụm từ "In recent years" biểu thị hành động diễn ra từ quá khứ đến hiện tại -> Phải dùng thì Hiện tại hoàn thành (has progressed).'),
      ('err_2', 'u_student', 'et_4', 'WRITING', 'sub_w1', 'Students usually make homework late at night.', 'Students usually DO homework late at night.', 'Collocation chuẩn trong tiếng Anh là "do homework", không dùng "make homework".'),
      ('err_3', 'u_student', 'et_6', 'SPEAKING', 'sub_s1', 'The ENVIRONMENT is facing severe pollution.', 'en-VI-ron-ment (trọng âm rơi vào âm tiết thứ 2: /ɪnˈvaɪ.rən.mənt/)', 'Phát âm sai trọng âm từ environment thành /en-vi-ron-ment/ khiến người nghe khó hiểu.');
    `);

    // Seed Vocab Notebook
    database.run(`
      INSERT INTO user_vocab_notebook (id, user_id, word, ipa, meaning_vi, example_sentence) VALUES
      ('v_1', 'u_student', 'deterioration', '/dɪˌtɪə.ri.əˈreɪ.ʃən/', 'sự suy giảm, làm tệ đi', 'The rapid deterioration of marine ecosystems poses a threat to biodiversity.'),
      ('v_2', 'u_student', 'exacerbate', '/ɪɡˈzæs.ə.beɪt/', 'làm trầm trọng thêm', 'Rising emissions will exacerbate existing environmental issues.');
    `);

    // Seed Streak & Wallet
    database.run(`
      INSERT INTO streaks (user_id, current_streak, best_streak, last_active_date) VALUES ('u_student', 5, 12, '2026-08-04');
    `);
    database.run(`
      INSERT INTO wallets (user_id, credits) VALUES ('u_student', 25);
    `);
  }
}

import fs from 'fs';
import path from 'path';
import initSqlJs, { Database } from 'sql.js';
import { IELTS_READING_TEST_1 } from './readingTestData';
import { IELTS_LISTENING_TEST_1 } from './listeningTestData';

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

  // 16. streaks & wallets & coin transactions
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
      credits INTEGER DEFAULT 25,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  database.run(`
    CREATE TABLE IF NOT EXISTS coin_transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      amount INTEGER NOT NULL,
      base_amount INTEGER DEFAULT 0,
      bonus_amount INTEGER DEFAULT 0,
      balance_after INTEGER,
      reason TEXT NOT NULL,
      source_type TEXT NOT NULL,
      details_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  database.run(`
    CREATE TABLE IF NOT EXISTS reward_items (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      partner_name TEXT NOT NULL,
      discount_label TEXT NOT NULL,
      cost_coins INTEGER NOT NULL,
      original_value TEXT,
      description TEXT,
      terms TEXT,
      image_tag TEXT,
      badge TEXT,
      stock INTEGER DEFAULT 100,
      code_prefix TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  database.run(`
    CREATE TABLE IF NOT EXISTS user_reward_redemptions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      reward_item_id TEXT NOT NULL,
      reward_title TEXT NOT NULL,
      partner_name TEXT NOT NULL,
      discount_label TEXT NOT NULL,
      cost_coins INTEGER NOT NULL,
      voucher_code TEXT NOT NULL UNIQUE,
      status TEXT DEFAULT 'ACTIVE',
      instructions TEXT,
      expires_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  try {
    const txCheck = database.prepare("SELECT COUNT(*) as c FROM coin_transactions WHERE user_id = 'u_student'");
    let hasTx = false;
    if (txCheck.step()) {
      hasTx = (txCheck.getAsObject().c as number) > 0;
    }
    txCheck.free();

    if (!hasTx) {
      database.run(`
        INSERT INTO coin_transactions (id, user_id, amount, base_amount, bonus_amount, balance_after, reason, source_type, created_at)
        VALUES
          ('tx_init_1', 'u_student', 10, 10, 0, 10, 'Tặng Xu chào mừng tân học viên & kích hoạt AI', 'WELCOME_BONUS', datetime('now', '-3 days')),
          ('tx_init_2', 'u_student', 6, 2, 4, 16, 'Luyện tập Reading: Passage 1 (Band 6.5) - +2 xu làm bài, +4 xu điểm số', 'TEST_READING', datetime('now', '-2 days')),
          ('tx_init_3', 'u_student', 5, 2, 3, 21, 'Luyện tập Listening: Section 1 (Band 7.0) - +2 xu làm bài, +3 xu điểm số', 'TEST_LISTENING', datetime('now', '-1 days')),
          ('tx_init_4', 'u_student', 4, 3, 1, 25, 'Nộp bài Writing Task 2 (Band 6.0) - +3 xu nộp bài, +1 xu chất lượng bài', 'WRITING', datetime('now', '-4 hours'));
      `);
    }
  } catch (e) {}

  // Seed default data if empty
  seedInitialData(database);

  // Synchronize default user account to user's real account
  try {
    database.run(`
      UPDATE users 
      SET email = 'tranquynhanh28032016@gmail.com', full_name = 'Trần Quỳnh Anh'
      WHERE id = 'u_student';
    `);
  } catch (e) {}

  // Always ensure standard IELTS Reading, Listening, Writing & Speaking Tests, Knowledge Articles, and Vocabulary Notebook are seeded
  ensureReadingTestSeeded(database);
  ensureListeningTestSeeded(database);
  ensureWritingTestSeeded(database);
  ensureSpeakingTestSeeded(database);
  ensureKnowledgeArticlesSeeded(database);
  ensureVocabNotebookSeeded(database);
  ensureRewardItemsSeeded(database);
}

export function ensureVocabNotebookSeeded(database: Database) {
  try {
    const checkStmt = database.prepare("SELECT COUNT(*) as cnt FROM user_vocab_notebook WHERE user_id = 'u_student'");
    let count = 0;
    if (checkStmt.step()) {
      count = (checkStmt.getAsObject().cnt as number) || 0;
    }
    checkStmt.free();

    if (count < 5) {
      const sampleVocab = [
        {
          id: 'v_seed_1',
          word: 'deterioration',
          ipa: '/dɪˌtɪə.ri.əˈreɪ.ʃən/',
          meaning_vi: 'sự suy giảm, tình trạng xuống cấp trầm trọng',
          example_sentence: 'The rapid deterioration of marine ecosystems poses an existential threat to global biodiversity.'
        },
        {
          id: 'v_seed_2',
          word: 'exacerbate',
          ipa: '/ɪɡˈzæs.ə.beɪt/',
          meaning_vi: 'làm trầm trọng thêm, làm xấu đi tình hình',
          example_sentence: 'Unchecked greenhouse gas emissions will exacerbate existing socio-economic inequalities.'
        },
        {
          id: 'v_seed_3',
          word: 'ubiquitous',
          ipa: '/juːˈbɪk.wɪ.təs/',
          meaning_vi: 'phổ biến ở khắp mọi nơi, nhan nhản',
          example_sentence: 'Smartphones and digital displays have become ubiquitous features of contemporary urban life.'
        },
        {
          id: 'v_seed_4',
          word: 'mitigate',
          ipa: '/ˈmɪt.ɪ.ɡeɪt/',
          meaning_vi: 'giảm nhẹ, làm dịu bớt tác hại',
          example_sentence: 'Governments must implement stringent urban zoning regulations to mitigate climate change risks.'
        },
        {
          id: 'v_seed_5',
          word: 'unprecedented',
          ipa: '/ʌnˈpres.ɪ.den.tɪd/',
          meaning_vi: 'chưa từng có tiền lệ trong lịch sử',
          example_sentence: 'The 21st century has witnessed an unprecedented pace of technological disruption.'
        },
        {
          id: 'v_seed_6',
          word: 'disparity',
          ipa: '/dɪˈspær.ə.ti/',
          meaning_vi: 'sự chênh lệch, khoảng cách bất bình đẳng lớn',
          example_sentence: 'There remains a pronounced disparity in educational resource allocation between rural and metropolitan areas.'
        },
        {
          id: 'v_seed_7',
          word: 'paradigm',
          ipa: '/ˈpær.ə.daɪm/',
          meaning_vi: 'mô hình mẫu, hệ hình tư duy',
          example_sentence: 'Artificial intelligence represents a fundamental paradigm shift in how academic research is conducted.'
        },
        {
          id: 'v_seed_8',
          word: 'substantiate',
          ipa: '/səbˈstæn.ʃi.eɪt/',
          meaning_vi: 'chứng minh, đưa ra bằng chứng xác thực',
          example_sentence: 'Candidates in IELTS Writing Task 2 must substantiate their arguments with concrete real-world evidence.'
        }
      ];

      for (const v of sampleVocab) {
        database.run(`
          INSERT OR REPLACE INTO user_vocab_notebook (id, user_id, word, ipa, meaning_vi, example_sentence)
          VALUES (?, 'u_student', ?, ?, ?, ?)
        `, [v.id, v.word, v.ipa, v.meaning_vi, v.example_sentence]);
      }
    }
  } catch (e) {
    console.warn("Could not seed vocab notebook:", e);
  }
}

export function ensureKnowledgeArticlesSeeded(database: Database) {
  try {
    const articles = [
      {
        id: 'art_1',
        author_id: 'u_teacher',
        title: 'Chiến thuật bẻ khóa bẫy FALSE vs NOT GIVEN trong IELTS Reading',
        skill_type: 'READING',
        content: `## 📌 Bản chất của dạng bài True / False / Not Given (TFNG)

Dạng bài True/False/Not Given là một trong những "chướng ngại vật" lớn nhất đối với thí sinh IELTS. Điểm mấu chốt để đạt điểm tuyệt đối dạng này nằm ở việc **nắm vững bản chất logic** thay vì suy đoán theo cảm tính.

---

### 1. Phân biệt rõ ràng định nghĩa của 3 đáp án:
* **TRUE (Đúng)**: Thông tin trong câu hỏi khẳng định **100% khớp với ý nghĩa** trong bài đọc (thường được diễn đạt qua từ đồng nghĩa/paraphrasing).
* **FALSE (Sai)**: Thông tin trong bài đọc **trực tiếp mâu thuẫn hoặc phủ định** nhận định trong câu hỏi. (Tức là: Nếu câu hỏi nói A, thì bài đọc phải nói "Ngược lại với A").
* **NOT GIVEN (Không có thông tin)**: Bài đọc **không có đủ dữ kiện** để xác nhận nhận định đó đúng hay sai. Mặc dù nhận định có thể rất hợp lý ngoài đời thực, nhưng nếu bài đọc không đề cập đến mối liên hệ đó, bắt buộc phải chọn NOT GIVEN.

---

### 2. Các bẫy kinh điển Examiners thường gài:

#### ⚠️ Bẫy 1: Từ chỉ mức độ tuyệt đối (Qualifiers & Quantifiers)
* Hãy đặc biệt chú ý đến các từ: *always, never, only, all, impossible, exclusively*.
* *Ví dụ*:
  - **Bài đọc**: *"Many students prefer studying online."*
  - **Câu hỏi**: *"All students prefer studying online."*
  - ➔ **Đáp án**: **FALSE** (Vì "Many" mâu thuẫn với "All").

#### ⚠️ Bẫy 2: Suy đoán kiến thức thực tế (Real-world Knowledge Trap)
* Thí sinh hay lấy kiến thức thực tế của bản thân để trả lời thay vì dựa trên văn bản.
* *Quy tắc vàng*: Nếu bài đọc không nói đến, tuyệt đối không tự "suy luận giúp tác giả".

---

### 3. Quy trình 4 bước làm bài chuẩn xác:
1. **Gạch chân từ khóa cố định (Keywords)**: Tên riêng, năm tháng, thuật ngữ chuyên ngành (để định vị vị trí trong bài).
2. **Xác định từ khóa biến đổi (Micro-keywords)**: Động từ chính, tính từ, từ chỉ số lượng/tần suất.
3. **Đối chiếu logic 1-1**: So sánh từng thành phần ngữ nghĩa giữa câu hỏi và câu chứa thông tin trong đoạn văn.
4. **Áp dụng phép thử mâu thuẫn**:
   - Tự hỏi: *"Nếu câu này là FALSE, thì bài đọc có chứng minh điều ngược lại không?"*
   - Nếu có ➔ Chọn **FALSE**.
   - Nếu không chứng minh được ngược lại mà chỉ là không biết ➔ Chọn **NOT GIVEN**.`,
        tags_json: JSON.stringify(['READING', 'STRATEGY', 'TFNG', 'BAND_7.5_PLUS']),
        status: 'APPROVED'
      },
      {
        id: 'art_2',
        author_id: 'u_teacher',
        title: 'Tuyển tập 15 Collocations C1/C2 Band 8.0+ Đột Phá cho Writing Task 2',
        skill_type: 'WRITING',
        content: `## 🌟 Tầm quan trọng của Collocation trong Lexical Resource Band 8.0+

Trong tiêu chí chấm điểm IELTS Writing, tiêu chí **Lexical Resource** yêu cầu thí sinh ở Band 8.0 phải: *"Skillfully uses uncommon lexical items and sophisticated collocations with very rare errors."*

Dưới đây là 15 cụm Collocations học thuật phân loại theo các chủ đề nóng nhất trong Task 2.

---

### 🚀 Chủ đề 1: Technology & Artificial Intelligence
1. **Cutting-edge technological innovations** *(những đột phá công nghệ tiên tiến nhất)*
   - *Example*: Governments should allocate substantial budgets towards cutting-edge technological innovations to foster economic resilience.
2. **Automate repetitive and labor-intensive tasks** *(tự động hóa các công việc lặp lại và tốn nhiều sức lao động)*
   - *Example*: AI empowers organizations to automate repetitive and labor-intensive tasks, thereby boosting workplace productivity.
3. **Digital divide / Technological disparity** *(khoảng cách tiếp cận công nghệ giữa các tầng lớp)*
   - *Example*: The widening digital divide threatens to exacerbate social inequality in remote mountainous regions.

---

### 🌿 Chủ đề 2: Environment & Sustainability
4. **Impose stringent environmental regulations** *(ban hành các quy định nghiêm ngặt về môi trường)*
   - *Example*: It is imperative that policymakers impose stringent environmental regulations on heavy industrial emitters.
5. **Mitigate ecological degradation** *(giảm thiểu sự suy thoái hệ sinh thái)*
   - *Example*: Transitioning to renewable wind energy is vital to mitigate ecological degradation.
6. **Carbon footprint reduction** *(cắt giảm lượng khí thải carbon)*
   - *Example*: Sustainable urban transport networks facilitate substantial carbon footprint reduction.

---

### 🎓 Chủ đề 3: Education & Employment
7. **Cultivate critical thinking and problem-solving skills** *(trau dồi tư duy phản biện và kỹ năng giải quyết vấn đề)*
   - *Example*: The modern curriculum ought to cultivate critical thinking rather than relying on rote memorization.
8. **Gain a competitive edge in the volatile job market** *(giành lợi thế cạnh tranh trong thị trường việc làm biến động)*
   - *Example*: Higher educational credentials equip graduates with a distinct competitive edge in the job market.
9. **Bridge the gap between theoretical knowledge and practical application** *(thu hẹp khoảng cách giữa lý thuyết và thực tiễn)*
   - *Example*: Apprenticeship programs successfully bridge the gap between academic theory and practical execution.

---

### 💡 Lời khuyên của Examiner:
* Tránh "nhồi nhét" từ vựng gượng gạo. Mỗi bài luận Task 2 chỉ cần **4-6 cụm Collocation tinh tế** được dùng chính xác 100% ngữ cảnh là đủ để thuyết phục Giám khảo cho điểm Band 8+.`,
        tags_json: JSON.stringify(['WRITING', 'VOCABULARY', 'COLLOCATION', 'TASK_2', 'BAND_8.0']),
        status: 'APPROVED'
      },
      {
        id: 'art_3',
        author_id: 'u_teacher',
        title: 'Phương pháp AREA & Công thức PPF: Mở rộng ý tưởng Speaking không bao giờ bí từ',
        skill_type: 'SPEAKING',
        content: `## 🎙️ Làm sao để nói trôi chảy (Fluency & Coherence) Band 7.5 - 8.5?

Thách thức lớn nhất của học viên Việt Nam trong IELTS Speaking Part 2 & Part 3 là **bí ý tưởng** hoặc **nói quá ngắn, cụt ngủn**. Hai công thức sau đây là "vũ khí bí mật" của các thí sinh 8.0+.

---

### 1. Công thức AREA cho Speaking Part 3 (Two-way Discussion)

Mỗi câu trả lời Part 3 nên kéo dài từ **30 đến 45 giây** theo cấu trúc 4 bước:

* **A - Answer (Trả lời trực tiếp)**: Đưa ra quan điểm rõ ràng bằng câu phức.
* **R - Reason (Giải thích lý do)**: Trả lời câu hỏi *"Tại sao điều này lại xảy ra?"*.
* **E - Example (Dẫn chứng thực tế)**: Đưa ra một ví dụ cụ thể từ đời sống xã hội, số liệu hoặc hiện tượng quen thuộc.
* **A - Alternative / Aftermath (Mặt trái hoặc Hệ quả tương lai)**: Nhìn nhận vấn đề ở góc độ ngược lại hoặc dự đoán tương lai.

#### 📝 Ví dụ thực hành AREA:
- **Examiner**: *"Do you think artificial intelligence will replace teachers in the future?"*
- **Candidate (Band 8.0)**:
  - **(Answer)**: *"I strongly believe that while AI will revolutionize educational methodologies, it will never completely supplant human educators.*
  - **(Reason)**: *This is predominantly because teaching is not merely the transmission of factual knowledge; it inherently requires emotional empathy, pastoral care, and psychological encouragement.*
  - **(Example)**: *For instance, when a young student struggles with mental distress or lack of motivation, an algorithm cannot offer authentic moral reassurance.*
  - **(Alternative)**: *Nevertheless, educators who fail to integrate AI into their lesson planning might eventually be outperformed by those who leverage digital tools effectively."*

---

### 2. Công thức PPF (Past - Present - Future) cho Speaking Part 2 (Cue Card)

Khi chuẩn bị 1 phút cho bài nói Part 2, hãy chia dòng thời gian thành 3 giai đoạn:
1. **Past (Quá khứ)**: Bối cảnh ngày xưa, bạn biết đến sự việc/đồ vật/người này như thế nào (*"Initially, back when I was a high school student..."*).
2. **Present (Hiện tại)**: Tình trạng bây giờ, cảm xúc và tầm quan trọng của nó hiện tại (*"Fast forward to the present day..."*).
3. **Future (Tương lai)**: Kỳ vọng hoặc kế hoạch trong tương lai (*"Looking ahead, I definitely hope to..."*).

---

### 🌟 Examiner Pro-Tip:
Sử dụng các **Discourse Markers tự nhiên** như: *"To be perfectly honest", "From what I have observed", "In all likelihood", "On top of that"* để giữ nhịp điệu bài nói mượt mà không bị ngập ngừng.`,
        tags_json: JSON.stringify(['SPEAKING', 'FLUENCY', 'AREA_METHOD', 'PART_2', 'PART_3']),
        status: 'APPROVED'
      },
      {
        id: 'art_4',
        author_id: 'u_teacher',
        title: 'Kỹ thuật Paraphrasing 4 Cấp Độ đỉnh cao trong IELTS Writing',
        skill_type: 'WRITING',
        content: `## ✍️ Paraphrasing: Chìa khóa mở điểm Task Response & Lexical Resource

Nhiều thí sinh lầm tưởng Paraphrasing chỉ đơn giản là tra từ điển tìm từ đồng nghĩa (Synonyms). Điều này thường dẫn đến lỗi sai ngữ cảnh nghiêm trọng. Dưới đây là **4 cấp độ Paraphrasing chuẩn học thuật**.

---

### 🔹 Cấp độ 1: Dùng từ đồng nghĩa chính xác (Synonyms)
* *Gốc*: *"Governments should spend more money on public healthcare."*
* *Paraphrase*: *"Authorities ought to allocate greater financial resources towards healthcare infrastructure."*

---

### 🔹 Cấp độ 2: Chuyển đổi thể chủ động - bị động (Active to Passive Voice)
* *Gốc*: *"Excessive screen time damages children's cognitive development."*
* *Paraphrase*: *"Children's cognitive faculties can be significantly impaired by prolonged exposure to digital screens."*

---

### 🔹 Cấp độ 3: Biến đổi từ loại (Word Family Transformation: V ➔ N, Adj ➔ Adv)
* *Gốc*: *"Tourism has grown rapidly in coastal towns."*
* *Paraphrase*: *"Coastal destinations have experienced exponential growth in tourist arrivals."*
  *(Động từ "grown rapidly" ➔ Cụm danh từ "experienced exponential growth")*

---

### 🔹 Cấp độ 4: Tái cấu trúc mệnh đề quan hệ & Cụm phân từ rút gọn (Sentence Structure Overhaul)
* *Gốc*: *"People who live in metropolitan areas often suffer from chronic stress because they have hectic lifestyles."*
* *Paraphrase*: *"Leading frantic daily routines, urban dwellers are frequently susceptible to persistent psychological strain."*

---

### 🎯 Quy tắc vàng:
Kết hợp cùng lúc **ít nhất 2 cấp độ** (ví dụ: vừa đổi từ loại vừa dùng cấu trúc bị động) để câu viết đạt sự tự nhiên tối đa, tránh việc câu mới bị gượng gạo hoặc sai nghĩa gốc.`,
        tags_json: JSON.stringify(['WRITING', 'PARAPHRASING', 'TASK_1', 'TASK_2', 'GRAMMAR']),
        status: 'APPROVED'
      },
      {
        id: 'art_5',
        author_id: 'u_teacher',
        title: 'Chiến lược bắt Distractor Traps & Kỹ thuật Dự đoán từ khóa trong IELTS Listening',
        skill_type: 'LISTENING',
        content: `## 🎧 Vượt qua các bẫy "Đổi hướng đột ngột" trong IELTS Listening

Trong phần thi IELTS Listening (đặc biệt là Section 2 và Section 3), các đáp án gây nhiễu (Distractors) được thiết kế rất công phu để đánh lừa thí sinh chọn ngay từ đầu tiên nghe thấy.

---

### 1. Dấu hiệu nhận biết bẫy Distractor (Signaling Words)
Người nói trong bài audio thường đưa ra một thông tin rồi ngay sau đó **sửa lại hoặc phủ định**:
* *"I was initially planning to book the 10 AM slot, **however / actually / but then** I realized my flight lands at 11."*
* *"We thought of including the survey data, but **on second thought**, it was slightly outdated."*
* *"Although the library was supposed to open on Monday, **unforeseen delays have pushed it back to Wednesday**."*

---

### 2. Kỹ thuật 30 Giây Vàng đọc trước câu hỏi
1. **Dự đoán loại từ (Part of Speech)**: Chỗ trống là Danh từ (Số ít hay số nhiều?), Tính từ, Động từ hay Con số?
2. **Dự đoán trường nghĩa (Semantic Category)**: Chỗ trống hỏi về Ngày tháng, Tên đường, Chi phí ($ / £), hay Địa điểm?
3. **Gạch chân Anchor Keywords**: Là những từ **không thể bị paraphrase** trong audio (như tên riêng, số hiệu, mã số môn học).

---

### 3. Quy tắc kiểm tra chính tả và ngữ pháp sau khi nghe:
* **Kiểm tra số ít / số nhiều (Singular vs Plural 's')**: Đây là lỗi mất điểm oan uổng phổ biến nhất.
* **Quy tắc giới hạn từ (Word Limit)**: Đọc kỹ yêu cầu *"NO MORE THAN TWO WORDS AND/OR A NUMBER"*. Nếu viết 3 từ sẽ bị tính 0 điểm ngay lập tức.`,
        tags_json: JSON.stringify(['LISTENING', 'DISTRACTORS', 'STRATEGY', 'SECTION_3', 'SECTION_4']),
        status: 'APPROVED'
      },
      {
        id: 'art_6',
        author_id: 'u_teacher',
        title: 'Kiểm soát Câu Phức & Nghệ thuật Dấu Câu Học Thuật trong Writing Academic',
        skill_type: 'WRITING',
        content: `## 🖋️ Chấm dứt lỗi Run-on Sentences & Comma Splices

Tiêu chí **Grammatical Range and Accuracy** đánh giá khả năng sử dụng linh hoạt các loại câu (Câu đơn, Câu ghép, Câu phức) và sự chính xác của dấu câu.

---

### 1. Phân biệt Trạng từ liên kết (Conjunctive Adverbs) và Liên từ kết hợp (Coordinating Conjunctions)

Nhiều thí sinh mắc lỗi nghiêm trọng khi dùng dấu phẩy để nối 2 câu với **however, therefore, moreover, nevertheless**:

* ❌ **Sai (Comma Splice)**: *Online education offers great flexibility, however it requires high self-discipline.*
* ✅ **Đúng cách 1 (Dấu chấm phẩy)**: *Online education offers great flexibility; however, it requires high self-discipline.*
* ✅ **Đúng cách 2 (Tách 2 câu)**: *Online education offers great flexibility. However, it requires high self-discipline.*

---

### 2. Ba cấu trúc câu phức nâng tầm bài viết lên Band 8.0:

#### 🔹 Cấu trúc 1: Mệnh đề nhượng bộ nâng cao với "While / Whereas / In spite of"
* *Công thức*: **While + Clause 1, Clause 2**
* *Ví dụ*: *"While opponents argue that space exploration incurs colossal expenditure, proponents maintain that it catalyzes invaluable technological spinoffs."*

#### 🔹 Cấu trúc 2: Đảo ngữ có điều kiện (Inversion)
* *Gốc*: *"If governments invested more in renewable energy, pollution would decrease."*
* *Đảo ngữ*: *"Were governments to invest more substantially in renewable infrastructure, ecological contamination would be profoundly mitigated."*

#### 🔹 Cấu trúc 3: Cụm phân từ rút gọn đồng chủ ngữ (Participle Clauses)
* *Ví dụ*: *"Equipped with advanced diagnostic capabilities, artificial intelligence enables clinicians to detect oncological symptoms at nascent stages."*`,
        tags_json: JSON.stringify(['WRITING', 'GRAMMAR', 'PUNCTUATION', 'COMPLEX_SENTENCES', 'BAND_8.0']),
        status: 'APPROVED'
      }
    ];

    for (const art of articles) {
      database.run(`
        INSERT INTO knowledge_articles (id, author_id, title, skill_type, content, tags_json, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          title = excluded.title,
          skill_type = excluded.skill_type,
          content = excluded.content,
          tags_json = excluded.tags_json,
          status = excluded.status;
      `, [art.id, art.author_id, art.title, art.skill_type, art.content, art.tags_json, art.status]);
    }

    console.log("✅ High-yield IELTS Knowledge Articles successfully synchronized in SQLite.");
  } catch (err) {
    console.error("Error ensuring knowledge articles seeded:", err);
  }
}

export function ensureListeningTestSeeded(database: Database) {
  try {
    // 1. Upsert test metadata
    database.run(`
      INSERT INTO tests (id, title, skill_type, category, difficulty, time_limit_minutes)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        skill_type = excluded.skill_type,
        category = excluded.category,
        difficulty = excluded.difficulty,
        time_limit_minutes = excluded.time_limit_minutes;
    `, [
      IELTS_LISTENING_TEST_1.test.id,
      IELTS_LISTENING_TEST_1.test.title,
      IELTS_LISTENING_TEST_1.test.skill_type,
      IELTS_LISTENING_TEST_1.test.category,
      IELTS_LISTENING_TEST_1.test.difficulty,
      IELTS_LISTENING_TEST_1.test.time_limit_minutes
    ]);

    // 2. Remove any previous questions & sections for test_l1 to refresh
    const oldSections = database.exec(`SELECT id FROM test_sections WHERE test_id = '${IELTS_LISTENING_TEST_1.test.id}'`);
    if (oldSections[0]?.values) {
      for (const row of oldSections[0].values) {
        const sId = row[0];
        database.run(`DELETE FROM questions WHERE section_id = ?;`, [sId]);
      }
    }
    database.run(`DELETE FROM test_sections WHERE test_id = ?;`, [IELTS_LISTENING_TEST_1.test.id]);

    // 3. Insert 4 Sections and 40 Questions
    for (const sec of IELTS_LISTENING_TEST_1.sections) {
      database.run(`
        INSERT INTO test_sections (id, test_id, title, content_passage, order_index)
        VALUES (?, ?, ?, ?, ?);
      `, [sec.id, sec.test_id, sec.title, sec.content_passage, sec.order_index]);

      for (const q of sec.questions) {
        database.run(`
          INSERT INTO questions (id, section_id, question_number, question_type, prompt, options_json, correct_answer, explanation_text)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?);
        `, [
          q.id,
          q.section_id,
          q.question_number,
          q.question_type,
          q.prompt,
          JSON.stringify(q.options || []),
          q.correct_answer,
          q.explanation_text
        ]);
      }
    }
    console.log("✅ Standard IELTS Academic Listening test (4 sections, 40 questions) successfully synchronized.");
  } catch (err) {
    console.error("Error ensuring listening test seeded:", err);
  }
}

export function ensureSpeakingTestSeeded(database: Database) {
  try {
    database.run(`
      INSERT INTO tests (id, title, skill_type, category, difficulty, time_limit_minutes)
      VALUES ('test_s1', 'IELTS Speaking Academic: Weather (Part 1), Unforgettable Ad (Part 2), Art & Society (Part 3)', 'SPEAKING', 'ACADEMIC', 'MEDIUM', 15)
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        skill_type = excluded.skill_type,
        category = excluded.category,
        difficulty = excluded.difficulty,
        time_limit_minutes = excluded.time_limit_minutes;
    `);

    // Clean old sections for test_s1
    database.run(`DELETE FROM test_sections WHERE test_id = 'test_s1';`);

    // Insert Part 1, Part 2, Part 3 sections
    database.run(`
      INSERT INTO test_sections (id, test_id, title, content_passage, order_index) VALUES
      ('ts_s1_p1', 'test_s1', 'Part 1: Topic Weather (Introduction & Interview - 4-5 mins)', 'In Part 1, the examiner asks general questions on familiar daily topics.\nTopic: Weather\n1. What''s your favorite type of weather?\n2. Do you prefer hot or cold weather?\n3. Does the weather ever affect your mood?\n4. How is the weather in your hometown?\n5. Do you think that weather affects people''s behavior?', 1),
      ('ts_s1_p2', 'test_s1', 'Part 2: Describe an Unforgettable Advertisement (Cue Card Task - 3-4 mins)', 'Describe an unforgettable advertisement that you saw.\n\nYou should say:\n• Where you saw it\n• What kind of advertisement it was\n• What product/service was advertised\n• And say how you felt when you saw it', 2),
      ('ts_s1_p3', 'test_s1', 'Part 3: Topic Art & Society (Two-way Discussion - 4-5 mins)', 'In Part 3, the examiner discusses more abstract, analytical questions related to culture and society.\nTopic: Art & Society\n1. How important do you think art is in our daily lives?\n2. Do you believe that everyone can appreciate and understand art in the same way?\n3. In your opinion, should art education be mandatory in schools?\n4. How has the role of art in society changed over the years?\n5. Can you discuss the impact of technology on traditional art forms?', 3);
    `);

    console.log("✅ Standard IELTS Academic Speaking test (Part 1, Part 2 & Part 3) successfully synchronized.");
  } catch (err) {
    console.error("Error ensuring speaking test seeded:", err);
  }
}

export function ensureWritingTestSeeded(database: Database) {
  try {
    database.run(`
      INSERT INTO tests (id, title, skill_type, category, difficulty, time_limit_minutes)
      VALUES ('test_w1', 'Writing Academic Exam: 2004 vs 2014 Archaeological Maps (Task 1) & Hard Work in Education & Employment (Task 2)', 'WRITING', 'ACADEMIC', 'MEDIUM', 60)
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        skill_type = excluded.skill_type,
        category = excluded.category,
        difficulty = excluded.difficulty,
        time_limit_minutes = excluded.time_limit_minutes;
    `);

    // Clean old sections for test_w1
    database.run(`DELETE FROM test_sections WHERE test_id = 'test_w1';`);

    // Insert Task 1 & Task 2
    database.run(`
      INSERT INTO test_sections (id, test_id, title, content_passage, order_index) VALUES
      ('ts_w1', 'test_w1', 'Task 1: Archaeological Findings Map in 2004 and 2014 (150 words, 20 mins)', 'The maps below show recent archaeological findings at a historic site in 2004 and 2014. Provide an overview of the information by identifying and describing the key details, and include comparisons where appropriate.', 1),
      ('ts_w2', 'test_w1', 'Task 2: Hard Work in Education and Employment (250 words, 40 mins)', 'In both education and employment, some people work harder than others. Why do some people work harder than others? Is working hard always a good thing?', 2);
    `);

    console.log("✅ Standard IELTS Academic Writing test (Task 1 & Task 2) successfully synchronized.");
  } catch (err) {
    console.error("Error ensuring writing test seeded:", err);
  }
}

export function ensureReadingTestSeeded(database: Database) {
  try {
    // 1. Upsert test metadata
    database.run(`
      INSERT INTO tests (id, title, skill_type, category, difficulty, time_limit_minutes)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        skill_type = excluded.skill_type,
        category = excluded.category,
        difficulty = excluded.difficulty,
        time_limit_minutes = excluded.time_limit_minutes;
    `, [
      IELTS_READING_TEST_1.test.id,
      IELTS_READING_TEST_1.test.title,
      IELTS_READING_TEST_1.test.skill_type,
      IELTS_READING_TEST_1.test.category,
      IELTS_READING_TEST_1.test.difficulty,
      IELTS_READING_TEST_1.test.time_limit_minutes
    ]);

    // 2. Remove any previous questions & sections for test_r1 to refresh
    const oldSections = database.exec(`SELECT id FROM test_sections WHERE test_id = '${IELTS_READING_TEST_1.test.id}'`);
    if (oldSections[0]?.values) {
      for (const row of oldSections[0].values) {
        const sId = row[0];
        database.run(`DELETE FROM questions WHERE section_id = ?;`, [sId]);
      }
    }
    database.run(`DELETE FROM test_sections WHERE test_id = ?;`, [IELTS_READING_TEST_1.test.id]);

    // 3. Insert 3 Passages and 40 Questions
    for (const sec of IELTS_READING_TEST_1.sections) {
      database.run(`
        INSERT INTO test_sections (id, test_id, title, content_passage, order_index)
        VALUES (?, ?, ?, ?, ?);
      `, [sec.id, sec.test_id, sec.title, sec.content_passage, sec.order_index]);

      for (const q of sec.questions) {
        database.run(`
          INSERT INTO questions (id, section_id, question_number, question_type, prompt, options_json, correct_answer, explanation_text)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?);
        `, [
          q.id,
          q.section_id,
          q.question_number,
          q.question_type,
          q.prompt,
          JSON.stringify(q.options),
          q.correct_answer,
          q.explanation_text
        ]);
      }
    }
    console.log("✅ Standard IELTS Academic Reading test (3 passages, 40 questions) successfully synchronized.");
  } catch (err) {
    console.error("Error ensuring reading test seeded:", err);
  }
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
      ('u_student', 'tranquynhanh28032016@gmail.com', 'password123', 'Trần Quỳnh Anh', 'STUDENT'),
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
      ('test_w1', 'Writing Academic Exam: 2004 vs 2014 Archaeological Maps (Task 1) & Hard Work in Education & Employment (Task 2)', 'WRITING', 'ACADEMIC', 'MEDIUM', 60),
      ('test_s1', 'Speaking Academic Full Exam: Weather (Part 1), Unforgettable Ad (Part 2), Art (Part 3)', 'SPEAKING', 'ACADEMIC', 'MEDIUM', 15);
    `);

    // Writing Sections (Task 1 & Task 2)
    database.run(`
      INSERT INTO test_sections (id, test_id, title, content_passage, order_index) VALUES
      ('ts_w1', 'test_w1', 'Task 1: Archaeological Findings Map in 2004 and 2014 (150 words, 20 mins)', 'The maps below show recent archaeological findings at a historic site in 2004 and 2014. Provide an overview of the information by identifying and describing the key details, and include comparisons where appropriate.', 1),
      ('ts_w2', 'test_w1', 'Task 2: Hard Work in Education and Employment (250 words, 40 mins)', 'In both education and employment, some people work harder than others. Why do some people work harder than others? Is working hard always a good thing?', 2);
    `);

    // Speaking Sections (Part 1, Part 2, Part 3)
    database.run(`
      INSERT INTO test_sections (id, test_id, title, content_passage, order_index) VALUES
      ('ts_s1_p1', 'test_s1', 'Part 1: Topic Weather (Introduction & Interview - 4-5 mins)', 'In Part 1, the examiner asks you general questions on familiar topics.\nTopic: Weather\n1. What''s your favorite type of weather?\n2. Do you prefer hot or cold weather?\n3. Does the weather ever affect your mood?\n4. How is the weather in your hometown?\n5. Do you think that weather affects people''s behavior?', 1),
      ('ts_s1_p2', 'test_s1', 'Part 2: Describe an Unforgettable Advertisement (Cue Card - 3-4 mins)', 'Describe an unforgettable advertisement that you saw.\n\nYou should say:\n• Where you saw it\n• What kind of advertisement it was\n• What product/service was advertised\n• And say how you felt when you saw it', 2),
      ('ts_s1_p3', 'test_s1', 'Part 3: Topic Art (In-depth Two-way Discussion - 4-5 mins)', 'In Part 3, the examiner discusses more abstract, analytical questions related to culture and society.\nTopic: Art\n1. How important do you think art is in our daily lives?\n2. Do you believe that everyone can appreciate and understand art in the same way?\n3. In your opinion, should art education be mandatory in schools?\n4. How has the role of art in society changed over the years?\n5. Can you discuss the impact of technology on traditional art forms?', 3);
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

    // Seed Writing & Speaking Submissions
    database.run(`
      INSERT INTO writing_submissions (id, user_id, task_type, prompt_title, essay_text, word_count, status) VALUES
      ('sub_w1', 'u_student', 'TASK_2', 'Writing Task 2: AI Automation & Future Jobs', 'In recent years, artificial intelligence progressed rapidly. Students usually make homework late at night...', 260, 'COMPLETED');

      INSERT INTO speaking_submissions (id, user_id, part, prompt_title, audio_url, transcript, status) VALUES
      ('sub_s1', 'u_student', 'PART_2', 'Speaking Part 2: Describe a Memorable Journey', '', 'The ENVIRONMENT is facing severe pollution...', 'COMPLETED');
    `);

    // Seed Sample Error Notebook Entries for Student
    database.run(`
      INSERT INTO error_instances (id, user_id, error_tag_id, source_type, source_id, original_text, corrected_text, explanation) VALUES
      ('err_1', 'u_student', 'et_1', 'WRITING', 'sub_w1', 'In recent years, artificial intelligence progressed rapidly.', 'In recent years, artificial intelligence HAS PROGRESSED rapidly.', 'Cụm từ "In recent years" biểu thị hành động diễn ra từ quá khứ đến hiện tại -> Phải dùng thì Hiện tại hoàn thành (has progressed).'),
      ('err_2', 'u_student', 'et_4', 'WRITING', 'sub_w1', 'Students usually make homework late at night.', 'Students usually DO homework late at night.', 'Collocation chuẩn trong tiếng Anh là "do homework", không dùng "make homework".'),
      ('err_3', 'u_student', 'et_6', 'SPEAKING', 'sub_s1', 'The ENVIRONMENT is facing severe pollution.', 'en-VI-ron-ment (trọng âm rơi vào âm tiết thứ 2: /ɪnˈvaɪ.rən.mənt/)', 'Phát âm sai trọng âm từ environment thành /en-vi-ron-ment/ khiến người nghe khó hiểu.'),
      ('err_4', 'u_student', 'et_5', 'READING', 'test_r1', 'Corals die instantly as soon as bleaching occurs (Bạn chọn: TRUE)', 'Đáp án đúng: FALSE', 'Đoạn 1 ghi rõ: "While bleached corals are not immediately dead, they are under extreme stress..." -> San hô không chết ngay lập tức.'),
      ('err_5', 'u_student', 'et_2', 'LISTENING', 'test_l1', 'Building C, Room 304 (Nhầm lẫn số báo danh học viên)', 'Đáp án đúng: ST-88291', 'Nhầm lẫn nghe chép chính tả số báo danh học viên và địa điểm phòng học trong đoạn hội thoại.');
    `);

    // Seed Vocab Notebook
    database.run(`
      INSERT INTO user_vocab_notebook (id, user_id, word, ipa, meaning_vi, example_sentence) VALUES
      ('v_1', 'u_student', 'deterioration', '/dɪˌtɪə.ri.əˈreɪ.ʃən/', 'sự suy giảm, làm tệ đi', 'The rapid deterioration of marine ecosystems poses a threat to biodiversity.'),
      ('v_2', 'u_student', 'exacerbate', '/ɪɡˈzæs.ə.beɪt/', 'làm trầm trọng thêm', 'Rising emissions will exacerbate existing environmental issues.');
    `);

    // Seed Streak & Wallet
    const today = new Date().toISOString().split('T')[0];
    database.run(`
      INSERT OR REPLACE INTO streaks (user_id, current_streak, best_streak, last_active_date) VALUES ('u_student', 1, 1, '${today}');
    `);
    database.run(`
      INSERT OR REPLACE INTO wallets (user_id, credits) VALUES ('u_student', 25);
    `);
  }
}

export function calculateRealUserStreak(database: Database, userId: string = 'u_student'): { current_streak: number; best_streak: number; last_active_date: string } {
  try {
    const datesSet = new Set<string>();

    // 1. Attempts
    const attStmt = database.prepare("SELECT strftime('%Y-%m-%d', created_at) as d FROM user_test_attempts WHERE user_id = ?");
    attStmt.bind([userId]);
    while (attStmt.step()) {
      const d = attStmt.getAsObject().d as string;
      if (d) datesSet.add(d);
    }
    attStmt.free();

    // 2. Writing Submissions
    const wrStmt = database.prepare("SELECT strftime('%Y-%m-%d', created_at) as d FROM writing_submissions WHERE user_id = ?");
    wrStmt.bind([userId]);
    while (wrStmt.step()) {
      const d = wrStmt.getAsObject().d as string;
      if (d) datesSet.add(d);
    }
    wrStmt.free();

    // 3. Speaking Submissions
    const spStmt = database.prepare("SELECT strftime('%Y-%m-%d', created_at) as d FROM speaking_submissions WHERE user_id = ?");
    spStmt.bind([userId]);
    while (spStmt.step()) {
      const d = spStmt.getAsObject().d as string;
      if (d) datesSet.add(d);
    }
    spStmt.free();

    // 4. Vocab Notebook
    const vcStmt = database.prepare("SELECT strftime('%Y-%m-%d', created_at) as d FROM user_vocab_notebook WHERE user_id = ?");
    vcStmt.bind([userId]);
    while (vcStmt.step()) {
      const d = vcStmt.getAsObject().d as string;
      if (d) datesSet.add(d);
    }
    vcStmt.free();

    // 5. Streaks table recorded date
    const strStmt = database.prepare("SELECT last_active_date, current_streak, best_streak FROM streaks WHERE user_id = ?");
    strStmt.bind([userId]);
    let savedBest = 0;
    if (strStmt.step()) {
      const obj = strStmt.getAsObject();
      if (obj.last_active_date) {
        datesSet.add(obj.last_active_date as string);
      }
      savedBest = Number(obj.best_streak) || 0;
    }
    strStmt.free();

    if (datesSet.size === 0) {
      return { current_streak: 0, best_streak: 0, last_active_date: '' };
    }

    const formatDate = (date: Date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    };

    const todayDate = new Date();
    const todayStr = formatDate(todayDate);

    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = formatDate(yesterdayDate);

    let streak = 0;
    let startDate: Date | null = null;

    if (datesSet.has(todayStr)) {
      startDate = new Date(todayDate);
    } else if (datesSet.has(yesterdayStr)) {
      startDate = new Date(yesterdayDate);
    }

    if (startDate) {
      const curr = new Date(startDate);
      while (true) {
        const dStr = formatDate(curr);
        if (datesSet.has(dStr)) {
          streak++;
          curr.setDate(curr.getDate() - 1);
        } else {
          break;
        }
      }
    }

    const newBest = Math.max(savedBest, streak);
    const sortedDates = Array.from(datesSet).sort();
    const latestActive = datesSet.has(todayStr) ? todayStr : (datesSet.has(yesterdayStr) ? yesterdayStr : (sortedDates[sortedDates.length - 1] || ''));

    // Update streaks table
    try {
      database.run(`
        INSERT INTO streaks (user_id, current_streak, best_streak, last_active_date)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET
          current_streak = excluded.current_streak,
          best_streak = excluded.best_streak,
          last_active_date = excluded.last_active_date
      `, [userId, streak, newBest, latestActive]);
    } catch (e) {}

    return { current_streak: streak, best_streak: newBest, last_active_date: latestActive };
  } catch (err) {
    console.error("Error calculating real streak:", err);
    return { current_streak: 0, best_streak: 0, last_active_date: '' };
  }
}

export function recordUserActivity(database: Database, userId: string = 'u_student') {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    database.run(`
      INSERT INTO streaks (user_id, current_streak, best_streak, last_active_date)
      VALUES (?, 1, 1, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        last_active_date = ?
    `, [userId, todayStr, todayStr]);
    return calculateRealUserStreak(database, userId);
  } catch (err) {
    console.error("Error recording user activity:", err);
  }
}

// ----------------------------------------------------
// COIN / XU CONVERSION & REWARD SYSTEM
// ----------------------------------------------------

export interface CoinRewardResult {
  amount: number;
  base_amount: number;
  bonus_amount: number;
  new_balance: number;
  reason: string;
  source_type: string;
}

export function rewardUserCoins(
  database: Database,
  userId: string = 'u_student',
  baseAmount: number,
  bonusAmount: number,
  reason: string,
  sourceType: string,
  details: any = {}
): CoinRewardResult {
  const totalAmount = Math.max(0, baseAmount + bonusAmount);
  try {
    // 1. Fetch current credits
    let currentCredits = 25;
    const stmt = database.prepare("SELECT credits FROM wallets WHERE user_id = ?");
    stmt.bind([userId]);
    if (stmt.step()) {
      currentCredits = (stmt.getAsObject().credits as number) || 0;
    }
    stmt.free();

    const newBalance = currentCredits + totalAmount;

    // 2. Update wallet
    database.run(`
      INSERT INTO wallets (user_id, credits, updated_at)
      VALUES (?, ?, datetime('now'))
      ON CONFLICT(user_id) DO UPDATE SET
        credits = excluded.credits,
        updated_at = datetime('now')
    `, [userId, newBalance]);

    // 3. Log transaction
    const txId = 'tx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    database.run(`
      INSERT INTO coin_transactions (id, user_id, amount, base_amount, bonus_amount, balance_after, reason, source_type, details_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      txId,
      userId,
      totalAmount,
      baseAmount,
      bonusAmount,
      newBalance,
      reason,
      sourceType,
      JSON.stringify(details || {})
    ]);

    return {
      amount: totalAmount,
      base_amount: baseAmount,
      bonus_amount: bonusAmount,
      new_balance: newBalance,
      reason,
      source_type: sourceType
    };
  } catch (err) {
    console.error("Error rewarding user coins:", err);
    return {
      amount: totalAmount,
      base_amount: baseAmount,
      bonus_amount: bonusAmount,
      new_balance: 25 + totalAmount,
      reason,
      source_type: sourceType
    };
  }
}

/**
 * Quy tắc tính Xu cho Reading & Listening:
 * - Base: +2 Xu cho mỗi lần làm bài
 * - Band Score Performance Bonus:
 *   + Band >= 8.0: +5 Xu (Thành tích Xuất sắc)
 *   + Band 7.0 - 7.5: +4 Xu (Đạt chuẩn Cao thủ)
 *   + Band 6.0 - 6.5: +3 Xu (Đạt chuẩn Mục tiêu)
 *   + Band 5.0 - 5.5: +2 Xu (Nỗ lực tiến bộ)
 *   + Band < 5.0: +1 Xu (Động viên học tập)
 */
export function calculateCoinsForReadingListening(bandScore: number, correctCount: number, totalQuestions: number, skillName: string = 'Reading') {
  const baseAmount = 2;
  let bonusAmount = 1;
  let bonusTier = "Động viên học tập";

  if (bandScore >= 8.0) {
    bonusAmount = 5;
    bonusTier = "Xuất sắc Band 8.0+";
  } else if (bandScore >= 7.0) {
    bonusAmount = 4;
    bonusTier = "Điểm cao Band 7.0-7.5";
  } else if (bandScore >= 6.0) {
    bonusAmount = 3;
    bonusTier = "Đạt mục tiêu Band 6.0-6.5";
  } else if (bandScore >= 5.0) {
    bonusAmount = 2;
    bonusTier = "Nỗ lực Band 5.0-5.5";
  }

  const scoreText = totalQuestions > 0 ? ` (${correctCount}/${totalQuestions} câu, Band ${bandScore.toFixed(1)})` : ` (Band ${bandScore.toFixed(1)})`;
  const reason = `Luyện tập ${skillName}${scoreText}: +${baseAmount} xu làm bài + ${bonusAmount} xu điểm ${bonusTier}`;

  return {
    base_amount: baseAmount,
    bonus_amount: bonusAmount,
    total: baseAmount + bonusAmount,
    reason,
    bonus_tier: bonusTier
  };
}

/**
 * Quy tắc tính Xu cho Writing & Speaking:
 * - Base: +3 Xu cho mỗi lần hoàn thành bài viết / bài nói nộp AI chấm
 * - Band Score Bonus:
 *   + Band >= 8.0: +6 Xu
 *   + Band 7.0 - 7.5: +5 Xu
 *   + Band 6.0 - 6.5: +3 Xu
 *   + Band 5.0 - 5.5: +2 Xu
 *   + Band < 5.0: +1 Xu
 */
export function calculateCoinsForWritingSpeaking(overallBand: number, skillName: string = 'Writing', taskName: string = 'Task 2') {
  const baseAmount = 3;
  let bonusAmount = 1;
  let bonusTier = "Động viên nỗ lực";

  if (overallBand >= 8.0) {
    bonusAmount = 6;
    bonusTier = "Xuất sắc Band 8.0+";
  } else if (overallBand >= 7.0) {
    bonusAmount = 5;
    bonusTier = "Điểm cao Band 7.0-7.5";
  } else if (overallBand >= 6.0) {
    bonusAmount = 3;
    bonusTier = "Đạt mục tiêu Band 6.0-6.5";
  } else if (overallBand >= 5.0) {
    bonusAmount = 2;
    bonusTier = "Nỗ lực Band 5.0-5.5";
  }

  const reason = `Nộp bài ${skillName} ${taskName} (Band ${overallBand.toFixed(1)}): +${baseAmount} xu nộp bài + ${bonusAmount} xu điểm ${bonusTier}`;

  return {
    base_amount: baseAmount,
    bonus_amount: bonusAmount,
    total: baseAmount + bonusAmount,
    reason,
    bonus_tier: bonusTier
  };
}

/**
 * Quy tắc tính Xu cho Bài thi Khắc phục Sổ lỗi sai:
 * - Base: +2 Xu mỗi bài làm
 * - Điểm chính xác:
 *   + Đúng >= 80%: +3 Xu
 *   + Đúng >= 60%: +2 Xu
 *   + Đúng < 60%: +1 Xu
 */
export function calculateCoinsForRemedialTest(correctCount: number, totalQuestions: number) {
  const baseAmount = 2;
  const pct = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  let bonusAmount = 1;
  let tier = "Cố gắng luyện thêm";

  if (pct >= 80) {
    bonusAmount = 3;
    tier = `Chính xác xuất sắc (${pct}%)`;
  } else if (pct >= 60) {
    bonusAmount = 2;
    tier = `Đạt yêu cầu (${pct}%)`;
  }

  const reason = `Luyện tập Sổ lỗi sai (${correctCount}/${totalQuestions} câu): +${baseAmount} xu làm bài + ${bonusAmount} xu độ chính xác`;

  return {
    base_amount: baseAmount,
    bonus_amount: bonusAmount,
    total: baseAmount + bonusAmount,
    reason,
    bonus_tier: tier
  };
}

// ----------------------------------------------------
// REWARDS CATALOG & REDEMPTION STORE
// ----------------------------------------------------

export function ensureRewardItemsSeeded(database: Database) {
  try {
    const check = database.prepare("SELECT COUNT(*) as c FROM reward_items");
    let count = 0;
    if (check.step()) {
      count = (check.getAsObject().c as number) || 0;
    }
    check.free();

    if (count < 8) {
      const sampleRewards = [
        // 1. Course Discounts
        {
          id: 'rew_c1',
          title: 'Voucher Giảm 35% Học Phí Khóa IELTS Intensive Bứt Phá Band 7.0+',
          category: 'COURSE_DISCOUNT',
          partner_name: 'The IELTS Workshop / DOL English',
          discount_label: 'Giảm 35% Học Phí',
          cost_coins: 35,
          original_value: '1.800.000đ - 3.500.000đ',
          description: 'Áp dụng cho mọi khóa học IELTS Online hoặc Offline từ Pre-IELTS đến Master Band 7.5+. Được tặng kèm giáo trình độc quyền và hỗ trợ sửa bài 1-1.',
          terms: 'Hạn sử dụng 90 ngày kể từ lúc đổi. Áp dụng tại tất cả các cơ sở trung tâm hoặc đăng ký trực tuyến. Không áp dụng đồng thời khuyến mãi khác.',
          image_tag: 'graduation-cap',
          badge: 'Hot Nhất Tuần',
          stock: 45,
          code_prefix: 'IELTS-COURSE35'
        },
        {
          id: 'rew_c2',
          title: 'Voucher Giảm 50% Khóa Học Speaking 1-on-1 Với Chuyên Gia Bản Xứ 8.5+',
          category: 'COURSE_DISCOUNT',
          partner_name: 'KTDC IELTS & Global Native Mentors',
          discount_label: 'Giảm 50% (Tiết kiệm 800k)',
          cost_coins: 45,
          original_value: '1.600.000đ',
          description: 'Gói 5 buổi luyện phản xạ Speaking 1 kèm 1 theo bộ đề Forecast mới nhất. Chỉnh sửa phát âm, ngữ điệu và phát triển ý tưởng Part 3 chuyên sâu.',
          terms: 'Mỗi học viên được đổi tối đa 2 voucher. Đặt lịch trước 24 giờ với giáo viên bản ngữ.',
          image_tag: 'mic',
          badge: 'Khuyên Dùng',
          stock: 30,
          code_prefix: 'SPEAKING50'
        },
        {
          id: 'rew_c3',
          title: 'Voucher Giảm 500.000đ Khóa Luyện Viết Writing Task 1 & 2 Chuyên Sâu',
          category: 'COURSE_DISCOUNT',
          partner_name: 'IELTS Fighter Academy',
          discount_label: 'Giảm 500.000đ Trực Tiếp',
          cost_coins: 25,
          original_value: '500.000đ',
          description: 'Áp dụng trừ trực tiếp vào học phí khóa luyện viết 10 tuần. Bao gồm 20 bài chấm chữa sửa chi tiết từng câu và ngân hàng collocations C1-C2.',
          terms: 'Áp dụng cho khóa học tối thiểu 2.000.000đ. Mã có hiệu lực 60 ngày.',
          image_tag: 'edit-3',
          badge: 'Bán Chạy',
          stock: 60,
          code_prefix: 'WRITING500K'
        },
        {
          id: 'rew_c4',
          title: 'Học Bổng 100% Khóa Ngữ Pháp & Phát Âm Chuẩn Quốc Tế (3 Tháng E-learning)',
          category: 'COURSE_DISCOUNT',
          partner_name: 'IELTS AI Master Premium Academy',
          discount_label: 'Miễn Phí 100% (Trị giá 1.2tr)',
          cost_coins: 50,
          original_value: '1.200.000đ',
          description: 'Khóa học video bài giảng tương tác 60 bài bao trọn toàn bộ cấu trúc câu phức, thì ngữ pháp nâng cao và 44 âm IPA cùng giảng viên 8.5 IELTS.',
          terms: 'Kích hoạt tài khoản học trong vòng 30 ngày kể từ khi đổi voucher.',
          image_tag: 'award',
          badge: 'Đặc Quyền',
          stock: 25,
          code_prefix: 'FULLSCHOLAR'
        },

        // 2. Bookstore & Materials Vouchers
        {
          id: 'rew_b1',
          title: 'Voucher 100.000đ Mua Sách Tiếng Anh Tại Chuỗi Nhà Sách Fahasa',
          category: 'BOOKSTORE_VOUCHER',
          partner_name: 'Nhà Sách Fahasa (Toàn Quốc & Online)',
          discount_label: 'Voucher 100.000đ',
          cost_coins: 25,
          original_value: '100.000đ',
          description: 'Áp dụng mua tất cả sách tiếng Anh, giáo trình IELTS Cambridge, từ điển Oxford/Longman tại hơn 120 chi nhánh Fahasa toàn quốc hoặc fahasa.com.',
          terms: 'Áp dụng cho đơn hàng từ 250.000đ. Được cộng dồn cùng thẻ thành viên Fahasa.',
          image_tag: 'book-open',
          badge: 'Phổ Biến',
          stock: 80,
          code_prefix: 'FAHASA100K'
        },
        {
          id: 'rew_b2',
          title: 'Voucher 50.000đ Mua Sách Ngoại Văn & Tài Liệu Tại Nhà Sách Phương Nam',
          category: 'BOOKSTORE_VOUCHER',
          partner_name: 'Nhà Sách Phương Nam Bookstores',
          discount_label: 'Voucher 50.000đ',
          cost_coins: 15,
          original_value: '50.000đ',
          description: 'Phiếu mua hàng dùng trực tiếp tại hệ thống Nhà sách Phương Nam hoặc Phương Nam Online. Thỏa sức mua sách tham khảo, đề thi IELTS mẫu.',
          terms: 'Áp dụng cho đơn hàng từ 150.000đ. Hạn dùng 90 ngày.',
          image_tag: 'shopping-bag',
          badge: 'Dễ Đổi',
          stock: 100,
          code_prefix: 'PHUONGNAM50K'
        },
        {
          id: 'rew_b3',
          title: 'Voucher Giảm 40% Trọn Bộ Sách Cambridge IELTS 16-19 Bản Quyền (Tiki Trading)',
          category: 'BOOKSTORE_VOUCHER',
          partner_name: 'Tiki Trading Official Bookstore',
          discount_label: 'Giảm 40% Bộ Sách Cam',
          cost_coins: 20,
          original_value: 'Tiết kiệm ~220.000đ',
          description: 'Mã giảm giá độc quyền mua trọn bộ 4 cuốn Cambridge IELTS Academic 16, 17, 18, 19 kèm Audio bản quyền chính hãng giao nhanh 2h.',
          terms: 'Nhập mã tại bước thanh toán trên ứng dụng Tiki. Mỗi tài khoản áp dụng 1 lần.',
          image_tag: 'book',
          badge: 'Tài Liệu Hot',
          stock: 75,
          code_prefix: 'TIKICAM40'
        },
        {
          id: 'rew_b4',
          title: 'Voucher 30.000đ Mua Từ Điển & Sách Luyện Từ Vựng Collins / Oxford',
          category: 'BOOKSTORE_VOUCHER',
          partner_name: 'Nhà Sách Cá Chép & Tiki Books',
          discount_label: 'Voucher 30.000đ',
          cost_coins: 10,
          original_value: '30.000đ',
          description: 'Phiếu ưu đãi nhẹ nhàng dành cho các bạn mua sách từ vựng Academic Vocabulary in Use hoặc English Collocations in Use.',
          terms: 'Áp dụng cho đơn hàng từ 100.000đ.',
          image_tag: 'tag',
          badge: 'Chỉ 10 Xu',
          stock: 120,
          code_prefix: 'VOCAB30K'
        },

        // 3. Mock Tests & Exam Fees
        {
          id: 'rew_m1',
          title: 'Voucher Trợ Giá 500.000đ Lệ Phí Đăng Ký Thi IELTS Quốc Tế (IDP / British Council)',
          category: 'MOCK_TEST_EXAM',
          partner_name: 'Đối Tác Khảo Thí IDP & British Council',
          discount_label: 'Trợ Giá 500.000đ Lệ Phí',
          cost_coins: 60,
          original_value: '500.000đ',
          description: 'Hỗ trợ trực tiếp khi đăng ký thi IELTS Academic trên máy tính hoặc trên giấy tại các văn phòng đối tác chính thức của IDP và Hội Đồng Anh.',
          terms: 'Xuất trình mã code và thông tin học viên khi hoàn tất thủ tục đăng ký thi.',
          image_tag: 'shield-check',
          badge: 'Giá Trị Cao',
          stock: 20,
          code_prefix: 'IELTS-EXAM500'
        },
        {
          id: 'rew_m2',
          title: 'Voucher Miễn Phí 1 Lượt Thi Thử IELTS 4 Kỹ Năng Chuẩn Phòng Thi Máy Tính',
          category: 'MOCK_TEST_EXAM',
          partner_name: 'Trung Tâm Khảo Thí Mock Test Quốc Tế',
          discount_label: 'Miễn Phí 100% (Trị giá 350k)',
          cost_coins: 20,
          original_value: '350.000đ',
          description: 'Trải nghiệm phòng thi mô phỏng 100% kỳ thi IELTS thực tế với tai nghe chống ồn, máy tính chuyên dụng và nhận phiếu phân tích điểm sau 48h.',
          terms: 'Áp dụng tại các phòng thi thử đối tác ở Hà Nội, TP.HCM và Đà Nẵng, hoặc thi thử Online có giám thị.',
          image_tag: 'laptop',
          badge: 'Trải Nghiệm Thực',
          stock: 50,
          code_prefix: 'MOCKTESTFREE'
        }
      ];

      for (const rew of sampleRewards) {
        database.run(`
          INSERT OR REPLACE INTO reward_items (
            id, title, category, partner_name, discount_label, cost_coins, original_value,
            description, terms, image_tag, badge, stock, code_prefix
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          rew.id,
          rew.title,
          rew.category,
          rew.partner_name,
          rew.discount_label,
          rew.cost_coins,
          rew.original_value,
          rew.description,
          rew.terms,
          rew.image_tag,
          rew.badge,
          rew.stock,
          rew.code_prefix
        ]);
      }
    }
  } catch (err) {
    console.error("Error seeding reward items:", err);
  }
}

export interface RedeemRewardResult {
  success: boolean;
  message: string;
  voucher?: {
    id: string;
    code: string;
    title: string;
    partner_name: string;
    discount_label: string;
    cost_coins: number;
    expires_at: string;
    instructions: string;
  };
  new_balance?: number;
}

export function redeemRewardItem(
  database: Database,
  userId: string = 'u_student',
  rewardItemId: string
): RedeemRewardResult {
  try {
    // 1. Find reward item
    const itemStmt = database.prepare("SELECT * FROM reward_items WHERE id = ?");
    itemStmt.bind([rewardItemId]);
    let rewardItem: any = null;
    if (itemStmt.step()) {
      rewardItem = itemStmt.getAsObject();
    }
    itemStmt.free();

    if (!rewardItem) {
      return { success: false, message: "Phần thưởng không tồn tại hoặc đã hết hạn." };
    }

    // 2. Check current credits
    let currentCredits = 25;
    const walStmt = database.prepare("SELECT credits FROM wallets WHERE user_id = ?");
    walStmt.bind([userId]);
    if (walStmt.step()) {
      currentCredits = (walStmt.getAsObject().credits as number) || 0;
    }
    walStmt.free();

    if (currentCredits < rewardItem.cost_coins) {
      return { 
        success: false, 
        message: `Bạn chưa đủ Xu. Cần ${rewardItem.cost_coins} Xu nhưng hiện tại bạn có ${currentCredits} Xu. Hãy luyện thêm đề thi để tích lũy thêm!` 
      };
    }

    // 3. Deduct coins and update wallet
    const newBalance = currentCredits - rewardItem.cost_coins;
    database.run(`
      INSERT INTO wallets (user_id, credits, updated_at)
      VALUES (?, ?, datetime('now'))
      ON CONFLICT(user_id) DO UPDATE SET
        credits = excluded.credits,
        updated_at = datetime('now')
    `, [userId, newBalance]);

    // 4. Generate unique voucher code
    const randSuffix = Math.random().toString(36).substring(2, 6).toUpperCase() + Math.random().toString(36).substring(2, 4).toUpperCase();
    const voucherCode = `${rewardItem.code_prefix || 'VOUCHER'}-${randSuffix}`;
    const redemptionId = 'red_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5);
    
    // Set expiry 90 days from now
    const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
    const instructions = `Đưa mã voucher "${voucherCode}" tại quầy thu ngân của ${rewardItem.partner_name} hoặc nhập vào ô Mã giảm giá khi thanh toán online.`;

    // 5. Save redemption
    database.run(`
      INSERT INTO user_reward_redemptions (
        id, user_id, reward_item_id, reward_title, partner_name, discount_label,
        cost_coins, voucher_code, status, instructions, expires_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?, ?)
    `, [
      redemptionId,
      userId,
      rewardItem.id,
      rewardItem.title,
      rewardItem.partner_name,
      rewardItem.discount_label,
      rewardItem.cost_coins,
      voucherCode,
      instructions,
      expiresAt
    ]);

    // 6. Record transaction
    const txId = 'tx_redeem_' + Date.now();
    database.run(`
      INSERT INTO coin_transactions (
        id, user_id, amount, base_amount, bonus_amount, balance_after, reason, source_type, details_json
      ) VALUES (?, ?, ?, 0, 0, ?, ?, 'REDEMPTION', ?)
    `, [
      txId,
      userId,
      -rewardItem.cost_coins,
      newBalance,
      `Đổi quà: ${rewardItem.discount_label} tại ${rewardItem.partner_name}`,
      JSON.stringify({ voucher_code: voucherCode, reward_item_id: rewardItem.id })
    ]);

    // 7. Decrement stock
    database.run(`
      UPDATE reward_items SET stock = MAX(0, stock - 1) WHERE id = ?
    `, [rewardItem.id]);

    return {
      success: true,
      message: `Đổi thành công "${rewardItem.title}"!`,
      new_balance: newBalance,
      voucher: {
        id: redemptionId,
        code: voucherCode,
        title: rewardItem.title,
        partner_name: rewardItem.partner_name,
        discount_label: rewardItem.discount_label,
        cost_coins: rewardItem.cost_coins,
        expires_at: expiresAt,
        instructions
      }
    };
  } catch (err: any) {
    console.error("Error redeeming reward:", err);
    return { success: false, message: err.message || "Lỗi khi xử lý đổi quà" };
  }
}

export function getUserRedeemedVouchers(database: Database, userId: string = 'u_student') {
  try {
    const stmt = database.prepare(`
      SELECT * FROM user_reward_redemptions
      WHERE user_id = ?
      ORDER BY created_at DESC
    `);
    stmt.bind([userId]);
    const vouchers: any[] = [];
    while (stmt.step()) {
      vouchers.push(stmt.getAsObject());
    }
    stmt.free();
    return vouchers;
  } catch (err) {
    console.error("Error getting user redeemed vouchers:", err);
    return [];
  }
}

export function getRewardItemsCatalog(database: Database) {
  try {
    const stmt = database.prepare(`
      SELECT * FROM reward_items
      ORDER BY cost_coins ASC
    `);
    const catalog: any[] = [];
    while (stmt.step()) {
      catalog.push(stmt.getAsObject());
    }
    stmt.free();
    return catalog;
  } catch (err) {
    console.error("Error getting reward items catalog:", err);
    return [];
  }
}




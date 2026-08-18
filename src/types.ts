export type Role = 'STUDENT' | 'TEACHER' | 'ADMIN';

export type SkillType = 'READING' | 'LISTENING' | 'WRITING' | 'SPEAKING' | 'FULL';

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: Role;
  created_at: string;
}

export interface UserProfile {
  user_id: string;
  current_band: number;
  target_band: number;
  target_exam_date: string;
  weekly_hours: number;
  study_plan_json?: string;
  updated_at: string;
}

export interface TestItem {
  id: string;
  title: string;
  skill_type: SkillType;
  category: 'ACADEMIC' | 'GENERAL';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  time_limit_minutes: number;
  section_count?: number;
  total_questions?: number;
  created_at: string;
}

export interface TestSection {
  id: string;
  test_id: string;
  title: string;
  content_passage: string;
  audio_url?: string;
  order_index: number;
  questions?: Question[];
}

export interface Question {
  id: string;
  section_id: string;
  question_number: number;
  question_type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE_NOT_GIVEN' | 'MATCHING_HEADINGS' | 'FILL_BLANK';
  prompt: string;
  options?: string[]; // Parsed from JSON
  correct_answer: string;
  explanation_text: string;
}

export interface TestAttempt {
  id: string;
  user_id: string;
  test_id: string;
  mode: 'PRACTICE' | 'SIMULATION';
  band_score: number;
  correct_count: number;
  total_questions: number;
  time_spent_seconds: number;
  status: 'IN_PROGRESS' | 'COMPLETED';
  created_at: string;
  test_title?: string;
  skill_type?: SkillType;
}

export interface UserAnswer {
  question_id: string;
  user_answer: string;
  is_correct: boolean;
  correct_answer: string;
  explanation_text?: string;
}

export interface WritingSubmission {
  id: string;
  user_id: string;
  task_type: 'TASK_1' | 'TASK_2';
  prompt_title: string;
  essay_text: string;
  word_count: number;
  status: 'GRADING' | 'COMPLETED';
  created_at: string;
  grading_result?: AIGradingResult;
}

export interface SpeakingSubmission {
  id: string;
  user_id: string;
  part: 'PART_1' | 'PART_2' | 'PART_3';
  prompt_title: string;
  audio_url?: string;
  transcript?: string;
  status: 'GRADING' | 'COMPLETED';
  created_at: string;
  grading_result?: AIGradingResult;
}

export interface CriterionScore {
  name: string;
  score: number;
  comment: string;
}

export interface ErrorInstance {
  id: string;
  user_id: string;
  error_tag_id: string;
  error_tag_code: string;
  error_tag_name: string;
  source_type: 'WRITING' | 'SPEAKING' | 'READING' | 'LISTENING';
  source_id?: string;
  source_title?: string;
  original_text: string;
  corrected_text: string;
  explanation: string;
  created_at: string;
}

export interface AdvancedSuggestion {
  original_phrase: string;
  suggested_phrase: string;
  target_band: number;
  reason: string;
}

export interface AIGradingResult {
  id: string;
  submission_type: 'WRITING' | 'SPEAKING';
  submission_id: string;
  overall_band: number;
  criteria: CriterionScore[];
  general_feedback: string;
  errors: ErrorInstance[];
  suggestions: AdvancedSuggestion[];
  sample_comparison?: string;
  created_at: string;
}

export interface ErrorTag {
  id: string;
  code: string;
  name: string;
  category: 'GRAMMAR' | 'VOCABULARY' | 'PRONUNCIATION' | 'COHERENCE' | 'STRATEGY';
  description: string;
  count?: number;
}

export interface VocabWord {
  id: string;
  user_id: string;
  word: string;
  ipa: string;
  meaning_vi: string;
  example_sentence: string;
  created_at: string;
}

export interface KnowledgeArticle {
  id: string;
  author_id: string;
  author_name?: string;
  title: string;
  skill_type: SkillType;
  content: string;
  tags: string[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_at: string;
}

export interface LeaderboardItem {
  rank: number;
  user_id: string;
  full_name: string;
  avatar_initials: string;
  practice_count: number;
  avg_band: number;
  total_score: number;
  is_current_user?: boolean;
}

export interface UserStats {
  predicted_overall_band: number;
  confidence_level: string; // e.g. "High (based on 8 tests)"
  skill_bands: {
    reading: number;
    listening: number;
    writing: number;
    speaking: number;
  };
  total_attempts: number;
  streak_days: number;
  credits: number;
  frequent_errors: { tag_code: string; name: string; count: number }[];
}

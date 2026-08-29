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

export interface AudioTranscriptLine {
  time: string;
  seconds: number;
  speaker?: string;
  text: string;
}

export interface TestSection {
  id: string;
  test_id: string;
  title: string;
  content_passage: string;
  audio_url?: string;
  order_index: number;
  duration_seconds?: number;
  transcript_lines?: AudioTranscriptLine[];
  questions?: Question[];
}

export interface Question {
  id: string;
  section_id: string;
  question_number: number;
  question_type: string;
  prompt: string;
  options?: string[]; // Parsed from JSON
  correct_answer: string;
  explanation_text: string;
  audio_timestamp?: string;
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
  user_id?: string;
  error_tag_id?: string;
  error_tag_code: string;
  error_tag_name?: string;
  source_type?: 'WRITING' | 'SPEAKING' | 'READING' | 'LISTENING';
  source_id?: string;
  source_title?: string;
  original_text: string;
  corrected_text: string;
  explanation: string;
  created_at?: string;
}

export interface SentenceUpgrade {
  original_sentence: string;
  upgraded_sentence: string;
  target_band: number;
  changes_breakdown: {
    highlight_text: string;
    replaced_with: string;
    reason: string;
  }[];
  explanation: string;
}

export interface AdvancedSuggestion {
  original_phrase: string;
  suggested_phrase: string;
  target_band: number;
  reason: string;
}

export interface ImprovedBand8Essay {
  full_text: string;
  paragraph_breakdown: {
    paragraph_type: 'Introduction' | 'Overview' | 'Body 1' | 'Body 2' | 'Conclusion';
    original_paragraph: string;
    improved_paragraph: string;
    why_improved: string;
    key_changes: string[];
  }[];
  overall_strategy: string;
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
  sentence_upgrades?: SentenceUpgrade[];
  improved_band8_essay?: ImprovedBand8Essay;
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
  reward_coins?: number;
  reward_title?: string;
}

export interface LeaderboardScoringRule {
  activity: string;
  base_points: string;
  bonus_points: string;
  note: string;
}

export interface TopRankReward {
  rank: number;
  title: string;
  coins: number;
  voucher_bonus: string;
  badge: string;
}

export interface LeaderboardConfig {
  month_label: string;
  reset_cycle: string;
  top_rewards: {
    top_1: TopRankReward;
    top_2: TopRankReward;
    top_3: TopRankReward;
  };
  formula_summary: string;
  scoring_rules: LeaderboardScoringRule[];
}

export interface RemedialQuestion {
  id: string;
  scenario_type?: string; // e.g. "IELTS Writing Task 2 - Essay Excerpt", "IELTS Writing Task 1 - Trend Analysis", "Speaking Part 3 - Discussion"
  context_passage?: string; // Rich academic context paragraph containing the test sentence or blank [___]
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
  trap_mechanism?: string; // Analysis of why the distractors are tempting and what similar trap they test
  pro_tip?: string;
  rule_category: string;
  target_error_snippet: string;
  target_error_pattern?: string;
  original_mistake?: string;
  suggested_fix?: string;
}

export interface RemedialExam {
  test_id: string;
  title: string;
  description: string;
  target_band_focus: string;
  total_questions: number;
  time_limit_minutes: number;
  questions: RemedialQuestion[];
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
  has_completed_tests?: boolean;
  streak_days: number;
  credits: number;
  frequent_errors: { tag_code: string; name: string; count: number }[];
}

export interface CoinTransaction {
  id: string;
  user_id: string;
  amount: number;
  base_amount?: number;
  bonus_amount?: number;
  balance_after?: number;
  reason: string;
  source_type: string;
  details_json?: string;
  created_at: string;
}

export interface CoinRewardRule {
  label: string;
  coins: string;
  desc: string;
}

export interface CoinRewardRuleCategory {
  category: string;
  icon: string;
  badge: string;
  rules: CoinRewardRule[];
}

export interface CoinRewardEvent {
  amount: number;
  base_amount: number;
  bonus_amount: number;
  new_balance: number;
  reason: string;
  source_type: string;
}

export interface RewardItem {
  id: string;
  title: string;
  category: 'COURSE_DISCOUNT' | 'BOOKSTORE_VOUCHER' | 'MOCK_TEST_EXAM' | 'COACHING' | string;
  partner_name: string;
  discount_label: string;
  cost_coins: number;
  original_value?: string;
  description: string;
  terms: string;
  image_tag: string;
  badge?: string;
  stock: number;
  code_prefix: string;
}

export interface UserRedeemedVoucher {
  id: string;
  user_id: string;
  reward_item_id: string;
  reward_title: string;
  partner_name: string;
  discount_label: string;
  cost_coins: number;
  voucher_code: string;
  status: 'ACTIVE' | 'USED' | 'EXPIRED';
  instructions: string;
  expires_at: string;
  created_at: string;
}




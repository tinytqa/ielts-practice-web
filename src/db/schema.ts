import { pgTable, serial, text, real, integer, boolean, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  currentBand: real('current_band').default(5.5),
  targetBand: real('target_band').default(7.0),
  targetExamDate: text('target_exam_date').default('2026-11-15'),
  weeklyHours: integer('weekly_hours').default(12),
  preferredTimeSlot: text('preferred_timeslot').default('EVENING'),
  studyPlanJson: text('study_plan_json'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const gradingHistory = pgTable('grading_history', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  userUid: text('user_uid').notNull(),
  type: text('type').notNull(), // 'WRITING' | 'SPEAKING'
  prompt: text('prompt'),
  submission: text('submission'),
  overallBand: real('overall_band'),
  detailedGradesJson: text('detailed_grades_json'),
  audioUrl: text('audio_url'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const vocabBank = pgTable('vocab_bank', {
  id: serial('id').primaryKey(),
  userUid: text('user_uid').notNull(),
  term: text('term').notNull(),
  ipa: text('ipa'),
  type: text('type'),
  definition: text('definition'),
  example: text('example'),
  collocationsJson: text('collocations_json'),
  topic: text('topic'),
  mastered: boolean('mastered').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const errorNotebook = pgTable('error_notebook', {
  id: serial('id').primaryKey(),
  userUid: text('user_uid').notNull(),
  errorType: text('error_type').notNull(),
  description: text('description'),
  correction: text('correction'),
  skill: text('skill').notNull(),
  count: integer('count').default(1),
  resolved: boolean('resolved').default(false),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  gradingHistory: many(gradingHistory),
}));

export const gradingHistoryRelations = relations(gradingHistory, ({ one }) => ({
  user: one(users, {
    fields: [gradingHistory.userId],
    references: [users.id],
  }),
}));

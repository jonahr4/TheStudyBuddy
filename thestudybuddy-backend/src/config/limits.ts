/**
 * Security and resource limits
 * These limits prevent abuse and protect system resources
 */

export const LIMITS = {
  // User resource limits
  MAX_SUBJECTS_PER_USER: 10,
  MAX_NOTES_PER_SUBJECT: 10,
  MAX_FLASHCARD_SETS_PER_SUBJECT: 20,

  // File upload limits
  MAX_FILE_SIZE_MB: 10,
  MAX_FILE_SIZE_BYTES: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: ['.pdf'],

  // Content limits
  MAX_SUBJECT_NAME_LENGTH: 100,
  MAX_NOTE_FILENAME_LENGTH: 255,
  MAX_FLASHCARD_QUESTION_LENGTH: 500,
  MAX_FLASHCARD_ANSWER_LENGTH: 1000,
  MAX_CHAT_MESSAGE_LENGTH: 2000,

  // Rate limiting (requests per time window)
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 100, // 100 requests per 15 minutes
  RATE_LIMIT_UPLOAD_MAX: 10, // 10 uploads per 15 minutes
  RATE_LIMIT_AI_MAX: 30, // 30 AI requests per 15 minutes
} as const;

// Helper functions
export function isValidFileSize(sizeInBytes: number): boolean {
  return sizeInBytes > 0 && sizeInBytes <= LIMITS.MAX_FILE_SIZE_BYTES;
}

export function isValidFileType(filename: string): boolean {
  const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  return (LIMITS.ALLOWED_FILE_TYPES as readonly string[]).includes(extension);
}

export function isValidStringLength(str: string, maxLength: number): boolean {
  return str.length > 0 && str.length <= maxLength;
}

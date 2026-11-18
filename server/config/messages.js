// Every message the API sends back to the app lives here, so wording can be changed in one place.

export const MESSAGES = {
  SERVER: {
    HEALTHY: 'UniVoice API is running',
    RUNNING: 'Server running on port',
    DB_CONNECTED: 'MongoDB connected:',
    DB_FAILED: 'MongoDB connection failed:',
    MISSING_MONGO_URI: 'MONGO_URI is missing in server/.env',
  },
  ERRORS: {
    NOT_FOUND: 'Route not found',
    SERVER: 'Something went wrong. Please try again.',
    VALIDATION: 'Some fields are invalid',
    DUPLICATE: 'This value already exists:',
    INVALID_ID: 'Invalid ID format',
    TOO_MANY_REQUESTS: 'Too many requests, please try again later',
  },
  VALIDATION: {
    NAME_REQUIRED: 'Name is required',
    EMAIL_REQUIRED: 'Email is required',
    EMAIL_INVALID: 'Please enter a valid email',
    PASSWORD_REQUIRED: 'Password is required',
    PASSWORD_SHORT: 'Password must be at least 6 characters',
    DEPARTMENT_REQUIRED_OFFICER: 'Officers must belong to a department',
    TITLE_REQUIRED: 'Title is required',
    DESCRIPTION_REQUIRED: 'Description is required',
    ANONYMOUS_NOT_ALLOWED: 'Only teachers can submit anonymous complaints',
    RATING_RANGE: 'Rating must be between 1 and 5',
  },
  SEED: {
    START: 'Seeding database…',
    CLEARED: 'Old data cleared',
    DONE: 'Seed completed successfully!',
    FAILED: 'Seed failed:',
    CREDENTIALS: 'Login credentials:',
  },
};

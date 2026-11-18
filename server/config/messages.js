// Every message the API sends back to the app lives here, so wording can be changed in one place.

export const MESSAGES = {
  SERVER: {
    HEALTHY: 'UniVoice API is running',
    RUNNING: 'Server running on port',
    DB_CONNECTED: 'MongoDB connected',
    DB_FAILED: 'MongoDB connection failed:',
  },
  AUTH: {
    // e.g. LOGIN_SUCCESS: 'Logged in successfully'
  },
  COMPLAINT: {
    // e.g. CREATED: 'Complaint submitted'
  },
  ERRORS: {
    // e.g. NOT_FOUND: 'Resource not found'
  },
};

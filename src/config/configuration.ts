export default () => ({
    port: parseInt(process.env.PORT, 10) || 3000,
    database: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/content-aggregator',
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS, 10) || 150,
    },
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    },
    pagination: {
      defaultLimit: 10,
      maxLimit: 100,
    },
    logging: {
      level: process.env.LOG_LEVEL || 'info',
      dir: process.env.LOG_DIR || 'logs',
    },
    sentry: {
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE) || 0.1,
    },
    metrics: {
      enabled: process.env.METRICS_ENABLED === 'true',
      path: process.env.METRICS_PATH || '/metrics',
    },
  });
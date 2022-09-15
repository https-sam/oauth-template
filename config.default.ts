"use strict";

module.exports = {
  port: 8080,
  mongoURL: process.env.MONGO_URI,
  sessionSecret: process.env.SESSION_SECRET_KEY,
  frontendURL: process.env.FRONTEND_URL,
  googlePassport: {
    client: process.env.GOOGLE_CLIENT_ID,
    secret: process.env.GOOGLE_CLIENT_SECRET,
  },
  githubPassport: {
    client: process.env.GITHUB_CLIENT_ID,
    secret: process.env.GITHUB_CLIENT_SECRET,
  },
  twitterPassport: {
    consumer: process.env.TWITTER_CONSUMER_KEY,
    secret: process.env.TWITTER_CONSUMER_SECRET,
  },
};

// config.js
require('dotenv').config();

module.exports = {
  APP_ID: process.env.APP_ID || 'f041d2d3',
  API_KEY: process.env.API_KEY || '7b38198b179748262476c5e31db45315',
  BASE_URL: 'https://api.adzuna.com/v1/api/jobs',
  BASE_PARAMS: 'search/1?&results_per_page=20&content-type=application/json',
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/job-search-db',
};

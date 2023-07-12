require('dotenv').config();
const env = process.env;

const development = {
  username: env.awsec2username,
  password: env.awsec2password,
  database: env.awsec2database,
  host: env.awsec2host,
  dialect: 'mysql',
};
const test = {
  username: env.awsec2username,
  password: null,
  database: 'database_test',
  host: '127.0.0.1',
  dialect: 'mysql',
};
const production = {
  username: env.awsec2username,
  password: null,
  database: 'database_production',
  host: '127.0.0.1',
  dialect: 'mysql',
};

module.exports = { development, test, production };

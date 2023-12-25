const config = require("config");
const Sequelize = require("sequelize");

const dbPassword =
  process.env.NODE_ENV === "production" ? config.PASSWORD : config.EXT_PASSWORD;
const sequelize = new Sequelize(config.DB, config.USER, dbPassword, {
  host: config.HOST,
  port: config.PORT,
  dialect: config.dialect,
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.KnowItAllUser = require("./KnowItAllUsers.model.js")(sequelize, Sequelize);
db.KnowItAllResults = require("./KnowItAllResults.model.js")(
  sequelize,
  Sequelize
);

module.exports = db;

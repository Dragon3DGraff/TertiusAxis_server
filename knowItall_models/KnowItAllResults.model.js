module.exports = (sequelize, Sequelize) => {
  const KnowItAllResults = sequelize.define("multiplation", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    userId: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    date: {
      type: Sequelize.DATE,
    },
    timer: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },

    results: {
      type: Sequelize.JSON,
      allowNull: false,
    },
  });
  return KnowItAllResults;
};

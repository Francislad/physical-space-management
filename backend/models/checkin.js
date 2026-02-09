'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class checkin extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  checkin.init({
    user: DataTypes.INTEGER,
    room: DataTypes.STRING,
    checkedInAt: DataTypes.DATE,
    checkedOutAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'checkin',
  });
  return checkin;
};
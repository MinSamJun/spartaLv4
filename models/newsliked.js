'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class NewsLiked extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      this.belongsTo(models.Users, { 
        targetKey: 'userId', 
        foreignKey: 'userId', 
      });

      this.belongsTo(models.News, { // 2. News 모델에게 N:1 관계 설정을 합니다.
        targetKey: 'newsId', // 3. News 모델의 userId 컬럼을
        foreignKey: 'newsId', // 4. NewsLiked 모델의 UserId 컬럼과 연결합니다.
      });
    }
  }
  NewsLiked.init({
    id: {
      allowNull: false, // NOT NULL
      autoIncrement: true, // AUTO_INCREMENT
      primaryKey: true, // Primary Key (기본키)
      type: DataTypes.INTEGER,
    },
    newsId: {
      allowNull: false, // NOT NULL
      type: DataTypes.INTEGER,
    },
    userId: {
      allowNull: false, // NOT NULL
      type: DataTypes.INTEGER,
    },
    createdAt: {
      allowNull: false, // NOT NULL
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      allowNull: false, // NOT NULL
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    sequelize,
    modelName: 'NewsLiked',
  });
  return NewsLiked;
};
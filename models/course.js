'use strict';
const { Model, DataTypes } = require("sequelize")

module.exports = (sequelize, DataTypes) => {
    class Course extends Model { static associate(models) { } }
    Course.init({
        title: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Please provide a value for 'Title'"
                },
                notEmpty: {
                    msg: "Please provide a title"
                }
            }
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Please provide a value for 'Description'"
                },
                notEmpty: {
                    msg: "Please provide a description"
                }
            }
        },
        estimatedTime: {
            type: DataTypes.STRING,
        },
        materialsNeeded: {
            type: DataTypes.STRING,
        }
    }, { sequelize, modelName: 'Course' })

    Course.associate = (models) => {
        Course.belongsTo(models.User, {
            foreignKey: {
                fieldName: "userId",
                allowNull: false
            }
        })
    }

    return Course
}
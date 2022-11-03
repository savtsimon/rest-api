'use strict';
const { Model, DataTypes } = require('sequelize');
const bcrypt = require("bcrypt")

module.exports = (sequelize, DataTypes) => {
    class User extends Model { static associate(models) { } }
    User.init({
        firstName: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Please provide a value for 'First Name'"
                },
                notEmpty: {
                    msg: "Please provide a first name"
                }
            }
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Please provide a value for 'Last Name'"
                },
                notEmpty: {
                    msg: "Please provide a last name"
                }
            }
        },
        emailAddress: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: {
                msg: "This email is already in use"
            },
            validate: {
                notNull: {
                    msg: "Please provide a value for 'Email'"
                },
                isEmail: {
                    msg: "Please provide a valid email address"
                }
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Please provide a value for 'Password'"
                },
                notEmpty: {
                    msg: "Please provide a password"
                },
            },
            set(val) {
                const hashedPassword = bcrypt.hashSync(val, 10);
                this.setDataValue('password', hashedPassword);
            },
        }
    }, { sequelize, modelName: 'User' });

    User.associate = (models) => {
        User.hasMany(models.Course, {
            foreignKey: {
                fieldName: "userId",
                allowNull: false
            }
        })
    }

    return User;
}

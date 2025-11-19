import { DataTypes } from 'sequelize'
import { sequelize } from '../config/database.js'
import bcrypt from 'bcryptjs'

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        notEmpty: {
          msg: 'El nombre no puede estar vacío',
        },
      },
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: {
          msg: 'Por favor ingresa un email válido',
        },
        notEmpty: {
          msg: 'El email es requerido',
        },
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        len: {
          args: [6, 255],
          msg: 'La contraseña debe tener al menos 6 caracteres',
        },
      },
    },
    googleId: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
    },
    facebookId: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
    },
    avatar: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    provider: {
      type: DataTypes.ENUM('local', 'google', 'facebook'),
      defaultValue: 'local',
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('user', 'admin'),
      defaultValue: 'user',
      allowNull: false,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    verificationToken: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    resetPasswordToken: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    resetPasswordExpire: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'users',
    timestamps: true,
    underscored: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password && user.changed('password')) {
          const salt = await bcrypt.genSalt(12)
          user.password = await bcrypt.hash(user.password, salt)
        }
      },
      beforeUpdate: async (user) => {
        if (user.password && user.changed('password')) {
          const salt = await bcrypt.genSalt(12)
          user.password = await bcrypt.hash(user.password, salt)
        }
      },
    },
  }
)

// Método para comparar contraseñas
User.prototype.comparePassword = async function (candidatePassword) {
  if (!this.password) {
    return false
  }
  return await bcrypt.compare(candidatePassword, this.password)
}

// Método para obtener datos públicos
User.prototype.toJSON = function () {
  const values = { ...this.get() }
  delete values.password
  delete values.resetPasswordToken
  delete values.resetPasswordExpire
  delete values.verificationToken
  return values
}

export default User

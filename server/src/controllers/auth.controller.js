import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database.js';
import { AppError } from '../middlewares/errorHandler.js';

// Generar tokens JWT
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  );

  return { accessToken, refreshToken };
};

// Registrar nuevo usuario
export const register = async (req, res, next) => {
  try {
    const { email, password, name, phone } = req.body;

    // Verificar si el email ya existe
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      throw new AppError('El email ya está registrado', 409);
    }

    // Hash de la contraseña
    const passwordHash = await bcrypt.hash(password, 12);
    const userId = uuidv4();

    // Crear usuario
    const result = await query(
      `INSERT INTO users (id, email, password_hash, name, phone, role, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, 'customer', NOW(), NOW())
       RETURNING id, email, name, phone, role, created_at`,
      [userId, email, passwordHash, name, phone]
    );

    const user = result.rows[0];
    const tokens = generateTokens(user.id);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          role: user.role
        },
        ...tokens
      }
    });
  } catch (error) {
    next(error);
  }
};

// Iniciar sesión
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario
    const result = await query(
      'SELECT id, email, password_hash, name, phone, role FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      throw new AppError('Credenciales inválidas', 401);
    }

    const user = result.rows[0];

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      throw new AppError('Credenciales inválidas', 401);
    }

    const tokens = generateTokens(user.id);

    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          role: user.role
        },
        ...tokens
      }
    });
  } catch (error) {
    next(error);
  }
};

// Refrescar token
export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError('Refresh token requerido', 400);
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const tokens = generateTokens(decoded.userId);

    res.json({
      success: true,
      data: tokens
    });
  } catch (error) {
    next(error);
  }
};

// Obtener perfil del usuario actual
export const getProfile = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: req.user
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar perfil
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const userId = req.user.id;

    const result = await query(
      `UPDATE users
       SET name = COALESCE($1, name), phone = COALESCE($2, phone), updated_at = NOW()
       WHERE id = $3
       RETURNING id, email, name, phone, role`,
      [name, phone, userId]
    );

    res.json({
      success: true,
      message: 'Perfil actualizado',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Cambiar contraseña
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Obtener contraseña actual
    const result = await query(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    );

    const isValidPassword = await bcrypt.compare(currentPassword, result.rows[0].password_hash);

    if (!isValidPassword) {
      throw new AppError('Contraseña actual incorrecta', 400);
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    await query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [newPasswordHash, userId]
    );

    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

// Olvidé mi contraseña
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Verificar que el usuario existe
    const result = await query(
      'SELECT id, email, name FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      // No revelar si el email existe o no
      return res.json({
        success: true,
        message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña'
      });
    }

    // TODO: Generar token de recuperación y enviar email
    // const resetToken = uuidv4();
    // await sendResetEmail(email, resetToken);

    res.json({
      success: true,
      message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña'
    });
  } catch (error) {
    next(error);
  }
};

// Restablecer contraseña
export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    // TODO: Verificar token de recuperación
    // const userId = await verifyResetToken(token);

    res.json({
      success: true,
      message: 'Contraseña restablecida exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

// Cerrar sesión
export const logout = async (req, res, next) => {
  try {
    // TODO: Invalidar refresh token si se almacena en BD
    res.json({
      success: true,
      message: 'Sesión cerrada exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

import express from 'express';
import { query } from '../config/database.js';
import { validateRequest, adminLoginSchema } from '../middleware/validation.js';
import { generateToken, comparePassword } from '../middleware/auth.js';

const router = express.Router();

// POST /api/admin/login - Admin login
router.post('/login', validateRequest(adminLoginSchema), async (req, res) => {
  try {
    const { email, password } = req.validatedData;

    // Find admin by email
    const result = await query(
      'SELECT id, email, password_hash, name, role FROM admins WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const admin = result.rows[0];

    // Verify password
    const isPasswordValid = await comparePassword(password, admin.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    await query(
      'UPDATE admins SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [admin.id]
    );

    // Generate JWT token
    const token = generateToken({
      id: admin.id,
      email: admin.email,
      role: admin.role
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        admin: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role
        },
        token,
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
      }
    });

  } catch (error) {
    console.error('Error during admin login:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/admin/logout - Admin logout (optional - mainly for logging)
router.post('/logout', async (req, res) => {
  try {
    // In a stateless JWT system, logout is mainly handled client-side
    // But we can log the logout for audit purposes
    res.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Error during admin logout:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;

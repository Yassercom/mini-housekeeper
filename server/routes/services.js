import express from 'express';
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const router = express.Router();

// Database connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'mini_housekeeper',
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

// Middleware to verify admin JWT token
const verifyAdminToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Token d\'accès requis',
      errorCode: 'MISSING_TOKEN'
    });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.adminId = decoded.adminId;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token invalide ou expiré',
      errorCode: 'INVALID_TOKEN'
    });
  }
};

// GET /api/services - Get all services with pagination
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM services';
    let countQuery = 'SELECT COUNT(*) FROM services';
    const queryParams = [];
    let paramIndex = 1;

    // Add search filter if provided
    if (search.trim()) {
      const searchCondition = ` WHERE name ILIKE $${paramIndex} OR description ILIKE $${paramIndex}`;
      query += searchCondition;
      countQuery += searchCondition;
      queryParams.push(`%${search.trim()}%`);
      paramIndex++;
    }

    // Add ordering and pagination
    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(parseInt(limit), parseInt(offset));

    // Execute queries
    const [servicesResult, countResult] = await Promise.all([
      pool.query(query, queryParams),
      pool.query(countQuery, search.trim() ? [`%${search.trim()}%`] : [])
    ]);

    const totalServices = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalServices / limit);

    res.json({
      success: true,
      message: 'Services récupérés avec succès',
      data: servicesResult.rows,
      count: servicesResult.rows.length,
      total: totalServices,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages
    });

  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des services',
      errorCode: 'FETCH_ERROR'
    });
  }
});

// GET /api/services/:id - Get a specific service
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: 'ID de service invalide',
        errorCode: 'INVALID_ID'
      });
    }

    const result = await pool.query('SELECT * FROM services WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Service non trouvé',
        errorCode: 'SERVICE_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      message: 'Service récupéré avec succès',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du service',
      errorCode: 'FETCH_ERROR'
    });
  }
});

// POST /api/services - Create a new service (Admin only)
router.post('/', verifyAdminToken, async (req, res) => {
  try {
    const { name, description, picture } = req.body;

    // Validation
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Le nom du service est requis',
        errorCode: 'MISSING_NAME'
      });
    }

    if (name.trim().length > 255) {
      return res.status(400).json({
        success: false,
        message: 'Le nom du service ne peut pas dépasser 255 caractères',
        errorCode: 'NAME_TOO_LONG'
      });
    }

    // Check if service name already exists
    const existingService = await pool.query('SELECT id FROM services WHERE name = $1', [name.trim()]);
    if (existingService.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Un service avec ce nom existe déjà',
        errorCode: 'SERVICE_EXISTS'
      });
    }

    // Insert new service
    const result = await pool.query(
      'INSERT INTO services (name, description, picture) VALUES ($1, $2, $3) RETURNING *',
      [name.trim(), description?.trim() || null, picture?.trim() || null]
    );

    res.status(201).json({
      success: true,
      message: 'Service créé avec succès',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du service',
      errorCode: 'CREATE_ERROR'
    });
  }
});

// PUT /api/services/:id - Update a service (Admin only)
router.put('/:id', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, picture } = req.body;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: 'ID de service invalide',
        errorCode: 'INVALID_ID'
      });
    }

    // Validation
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Le nom du service est requis',
        errorCode: 'MISSING_NAME'
      });
    }

    if (name.trim().length > 255) {
      return res.status(400).json({
        success: false,
        message: 'Le nom du service ne peut pas dépasser 255 caractères',
        errorCode: 'NAME_TOO_LONG'
      });
    }

    // Check if service exists
    const existingService = await pool.query('SELECT * FROM services WHERE id = $1', [id]);
    if (existingService.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Service non trouvé',
        errorCode: 'SERVICE_NOT_FOUND'
      });
    }

    // Check if name is taken by another service
    const nameCheck = await pool.query('SELECT id FROM services WHERE name = $1 AND id != $2', [name.trim(), id]);
    if (nameCheck.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Un autre service avec ce nom existe déjà',
        errorCode: 'SERVICE_EXISTS'
      });
    }

    // Update service
    const result = await pool.query(
      'UPDATE services SET name = $1, description = $2, picture = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
      [name.trim(), description?.trim() || null, picture?.trim() || null, id]
    );

    res.json({
      success: true,
      message: 'Service mis à jour avec succès',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du service',
      errorCode: 'UPDATE_ERROR'
    });
  }
});

// DELETE /api/services/:id - Delete a service (Admin only)
router.delete('/:id', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: 'ID de service invalide',
        errorCode: 'INVALID_ID'
      });
    }

    // Check if service exists
    const existingService = await pool.query('SELECT * FROM services WHERE id = $1', [id]);
    if (existingService.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Service non trouvé',
        errorCode: 'SERVICE_NOT_FOUND'
      });
    }

    // Delete service
    await pool.query('DELETE FROM services WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Service supprimé avec succès',
      data: { id: parseInt(id) }
    });

  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du service',
      errorCode: 'DELETE_ERROR'
    });
  }
});

export default router;

import express from 'express';
import { query } from '../config/database.js';
import { validateRequest, validateId, housekeeperRegistrationSchema } from '../middleware/validation.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// POST /api/housekeepers - Register a new housekeeper
router.post('/', validateRequest(housekeeperRegistrationSchema), async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      location,
      experience,
      hourlyRate,
      photoUrl,
      bio,
      services
    } = req.validatedData;

    // Check if email already exists
    const existingHousekeeper = await query(
      'SELECT id FROM housekeepers WHERE email = $1',
      [email]
    );

    if (existingHousekeeper.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Insert new housekeeper
    const result = await query(
      `INSERT INTO housekeepers 
       (name, email, phone, location, experience, hourly_rate, photo_url, bio, services, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending') 
       RETURNING id, name, email, status, created_at`,
      [name, email, phone, location, experience, hourlyRate, photoUrl || null, bio || null, services]
    );

    const newHousekeeper = result.rows[0];

    res.status(201).json({
      success: true,
      message: 'Housekeeper registration submitted successfully',
      data: {
        id: newHousekeeper.id,
        name: newHousekeeper.name,
        email: newHousekeeper.email,
        status: newHousekeeper.status,
        submittedAt: newHousekeeper.created_at
      }
    });

  } catch (error) {
    console.error('Error registering housekeeper:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/housekeepers - Get all approved housekeepers with advanced filtering
router.get('/', async (req, res) => {
  try {
    // Vérifier si la table housekeepers existe
    const tableCheck = await query(
      "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'housekeepers')"
    );
    
    // Si la table n'existe pas, retourner une liste vide au lieu d'une erreur
    if (!tableCheck.rows[0].exists) {
      return res.json({
        success: true,
        message: 'No housekeepers found',
        data: [],
        count: 0
      });
    }
    
    const { region, service, minRating, maxRate, search, location, experience } = req.query;
    
    let queryText = `
      SELECT id, name, email, phone, location, region, experience, hourly_rate, 
             photo_url, bio, services, created_at, approved_at, rating
      FROM housekeepers 
      WHERE status = 'approved'
    `;
    
    const queryParams = [];
    let paramCount = 0;

    // Add filters - region (zone/quartier)
    if (region) {
      paramCount++;
      queryText += ` AND (region ILIKE $${paramCount} OR location ILIKE $${paramCount})`;
      queryParams.push(`%${region}%`);
    }
    
    // Legacy location filter (backward compatibility)
    else if (location) {
      paramCount++;
      queryText += ` AND (region ILIKE $${paramCount} OR location ILIKE $${paramCount})`;
      queryParams.push(`%${location}%`);
    }

    // Filter by service
    if (service) {
      paramCount++;
      queryText += ` AND $${paramCount} = ANY(services)`;
      queryParams.push(service);
    }
    
    // Filter by minimum rating
    if (minRating) {
      paramCount++;
      queryText += ` AND rating >= $${paramCount}`;
      queryParams.push(parseFloat(minRating));
    }

    // Filter by maximum hourly rate
    if (maxRate) {
      paramCount++;
      queryText += ` AND hourly_rate <= $${paramCount}`;
      queryParams.push(parseFloat(maxRate));
    }
    
    // Search by name (text libre)
    if (search) {
      paramCount++;
      queryText += ` AND name ILIKE $${paramCount}`;
      queryParams.push(`%${search}%`);
    }

    // Filter by experience (backward compatibility)
    if (experience) {
      paramCount++;
      queryText += ` AND experience = $${paramCount}`;
      queryParams.push(experience);
    }

    queryText += ' ORDER BY approved_at DESC';

    const result = await query(queryText, queryParams);

    res.json({
      success: true,
      message: 'Housekeepers retrieved successfully',
      data: result.rows,
      count: result.rows.length
    });

  } catch (error) {
    console.error('Error fetching housekeepers:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/housekeepers/pending - Get pending registrations (admin only)
router.get('/pending', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await query(
      `SELECT id, name, email, phone, location, experience, hourly_rate, 
              photo_url, bio, services, created_at
       FROM housekeepers 
       WHERE status = 'pending' 
       ORDER BY created_at ASC`
    );

    res.json({
      success: true,
      message: 'Pending registrations retrieved successfully',
      data: result.rows,
      count: result.rows.length
    });

  } catch (error) {
    console.error('Error fetching pending registrations:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// PATCH /api/housekeepers/:id/approve - Approve housekeeper (admin only)
router.patch('/:id/approve', authenticateToken, requireAdmin, validateId, async (req, res) => {
  try {
    const housekeeperId = req.validatedId;
    const adminId = req.admin.id;

    // Check if housekeeper exists and is pending
    const existingHousekeeper = await query(
      'SELECT id, name, email, status FROM housekeepers WHERE id = $1',
      [housekeeperId]
    );

    if (existingHousekeeper.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Housekeeper not found'
      });
    }

    const housekeeper = existingHousekeeper.rows[0];

    if (housekeeper.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Housekeeper is already ${housekeeper.status}`
      });
    }

    // Approve the housekeeper
    const result = await query(
      `UPDATE housekeepers 
       SET status = 'approved', approved_at = CURRENT_TIMESTAMP, approved_by = $1 
       WHERE id = $2 
       RETURNING id, name, email, status, approved_at`,
      [adminId, housekeeperId]
    );

    const approvedHousekeeper = result.rows[0];

    res.json({
      success: true,
      message: 'Housekeeper approved successfully',
      data: {
        id: approvedHousekeeper.id,
        name: approvedHousekeeper.name,
        email: approvedHousekeeper.email,
        status: approvedHousekeeper.status,
        approvedAt: approvedHousekeeper.approved_at
      }
    });

  } catch (error) {
    console.error('Error approving housekeeper:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// PATCH /api/housekeepers/:id/reject - Reject housekeeper (admin only)
router.patch('/:id/reject', authenticateToken, requireAdmin, validateId, async (req, res) => {
  try {
    const housekeeperId = req.validatedId;
    const adminId = req.admin.id;

    // Check if housekeeper exists and is pending
    const existingHousekeeper = await query(
      'SELECT id, name, email, status FROM housekeepers WHERE id = $1',
      [housekeeperId]
    );

    if (existingHousekeeper.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Housekeeper not found',
        errorCode: 'HOUSEKEEPER_NOT_FOUND'
      });
    }

    const housekeeper = existingHousekeeper.rows[0];

    if (housekeeper.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Housekeeper is already ${housekeeper.status}`,
        errorCode: 'INVALID_STATUS_TRANSITION'
      });
    }

    // Reject the housekeeper
    const result = await query(
      `UPDATE housekeepers 
       SET status = 'rejected', approved_at = NULL, approved_by = $1 
       WHERE id = $2 
       RETURNING id, name, email, status`,
      [adminId, housekeeperId]
    );

    const rejectedHousekeeper = result.rows[0];

    res.json({
      success: true,
      message: 'Housekeeper rejected successfully',
      data: {
        id: rejectedHousekeeper.id,
        name: rejectedHousekeeper.name,
        email: rejectedHousekeeper.email,
        status: rejectedHousekeeper.status
      }
    });

  } catch (error) {
    console.error('Error rejecting housekeeper:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      errorCode: 'SERVER_ERROR',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// DELETE /api/housekeepers/:id - Delete housekeeper (admin only)
router.delete('/:id', authenticateToken, requireAdmin, validateId, async (req, res) => {
  try {
    const housekeeperId = req.validatedId;

    // Check if housekeeper exists
    const existingHousekeeper = await query(
      'SELECT id, name, email FROM housekeepers WHERE id = $1',
      [housekeeperId]
    );

    if (existingHousekeeper.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Housekeeper not found'
      });
    }

    // Delete the housekeeper
    await query('DELETE FROM housekeepers WHERE id = $1', [housekeeperId]);

    res.json({
      success: true,
      message: 'Housekeeper deleted successfully',
      data: {
        id: housekeeperId,
        name: existingHousekeeper.rows[0].name,
        email: existingHousekeeper.rows[0].email
      }
    });

  } catch (error) {
    console.error('Error deleting housekeeper:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/housekeepers/:id - Get specific housekeeper details
router.get('/:id', validateId, async (req, res) => {
  try {
    const housekeeperId = req.validatedId;

    const result = await query(
      `SELECT id, name, email, phone, location, experience, hourly_rate, 
              photo_url, bio, services, status, created_at, approved_at
       FROM housekeepers 
       WHERE id = $1 AND status = 'approved'`,
      [housekeeperId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Housekeeper not found or not approved'
      });
    }

    res.json({
      success: true,
      message: 'Housekeeper details retrieved successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error fetching housekeeper details:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;

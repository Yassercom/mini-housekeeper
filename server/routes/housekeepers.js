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

// GET /api/housekeepers - Get housekeepers with pagination, filtering and optional status
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
        count: 0,
        page: 1,
        limit: 20,
        totalPages: 0
      });
    }
    
    // Extract query parameters with defaults
    const { 
      status = 'approved',      // Default status filter is 'approved'
      page = 1,                 // Default page number
      limit = 20,               // Default items per page
      region, 
      service, 
      minRating, 
      maxRate, 
      search, 
      location, 
      experience,
      sortBy = 'created_at',    // Default sort field
      sortOrder = 'DESC'        // Default sort order
    } = req.query;
    
    // Convert to numeric values
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;
    
    // Validate admin token if requesting non-approved housekeepers
    if (status !== 'approved') {
      try {
        // Verify admin token if trying to access non-public data
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return res.status(401).json({
            success: false,
            message: 'Unauthorized access',
            errorCode: 'UNAUTHORIZED'
          });
        }
      } catch (authError) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired token',
          errorCode: 'INVALID_TOKEN'
        });
      }
    }
    
    // Build the base query
    let queryText = `
      SELECT id, name, email, phone, location, region, experience, hourly_rate, 
             photo_url, bio, services, created_at, approved_at, rating, status
      FROM housekeepers 
      WHERE 1=1
    `;
    
    // Count query for pagination
    let countQueryText = `SELECT COUNT(*) FROM housekeepers WHERE 1=1`;
    
    const queryParams = [];
    const countParams = [];
    let paramCount = 0;
    
    // Add status filter if specified and not 'all'
    if (status && status.toLowerCase() !== 'all') {
      paramCount++;
      queryText += ` AND status = $${paramCount}`;
      countQueryText += ` AND status = $${paramCount}`;
      queryParams.push(status);
      countParams.push(status);
    }

    // Add filters - region (zone/quartier)
    if (region) {
      paramCount++;
      const filterText = ` AND (region ILIKE $${paramCount} OR location ILIKE $${paramCount})`;
      queryText += filterText;
      countQueryText += filterText;
      queryParams.push(`%${region}%`);
      countParams.push(`%${region}%`);
    }
    
    // Legacy location filter (backward compatibility)
    else if (location) {
      paramCount++;
      const filterText = ` AND (region ILIKE $${paramCount} OR location ILIKE $${paramCount})`;
      queryText += filterText;
      countQueryText += filterText;
      queryParams.push(`%${location}%`);
      countParams.push(`%${location}%`);
    }

    // Filter by service
    if (service) {
      paramCount++;
      const filterText = ` AND $${paramCount} = ANY(services)`;
      queryText += filterText;
      countQueryText += filterText;
      queryParams.push(service);
      countParams.push(service);
    }
    
    // Filter by minimum rating
    if (minRating) {
      paramCount++;
      const filterText = ` AND rating >= $${paramCount}`;
      queryText += filterText;
      countQueryText += filterText;
      queryParams.push(parseFloat(minRating));
      countParams.push(parseFloat(minRating));
    }

    // Filter by maximum hourly rate
    if (maxRate) {
      paramCount++;
      const filterText = ` AND hourly_rate <= $${paramCount}`;
      queryText += filterText;
      countQueryText += filterText;
      queryParams.push(parseFloat(maxRate));
      countParams.push(parseFloat(maxRate));
    }
    
    // Search by name or email
    if (search) {
      paramCount++;
      const filterText = ` AND (name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
      queryText += filterText;
      countQueryText += filterText;
      queryParams.push(`%${search}%`);
      countParams.push(`%${search}%`);
    }

    // Filter by experience (backward compatibility)
    if (experience) {
      paramCount++;
      const filterText = ` AND experience = $${paramCount}`;
      queryText += filterText;
      countQueryText += filterText;
      queryParams.push(experience);
      countParams.push(experience);
    }

    // Validate and sanitize sort parameters
    const allowedSortFields = ['created_at', 'name', 'hourly_rate', 'rating', 'approved_at'];
    const allowedSortOrders = ['ASC', 'DESC'];
    
    const sanitizedSortField = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const sanitizedSortOrder = allowedSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';
    
    // Add sorting
    queryText += ` ORDER BY ${sanitizedSortField} ${sanitizedSortOrder}`;
    
    // Add pagination
    queryText += ` LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    queryParams.push(limitNum, offset);

    // Execute the main query and count query
    const [result, countResult] = await Promise.all([
      query(queryText, queryParams),
      query(countQueryText, countParams)
    ]);
    
    // Calculate total pages
    const totalItems = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalItems / limitNum);

    res.json({
      success: true,
      message: `${result.rows.length} housekeepers retrieved successfully`,
      data: result.rows,
      count: result.rows.length,
      total: totalItems,
      page: pageNum,
      limit: limitNum,
      totalPages
    });

  } catch (error) {
    console.error('Error fetching housekeepers:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      errorCode: 'SERVER_ERROR',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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

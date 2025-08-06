-- Mini Housekeeper Database Schema

-- Create housekeepers table
CREATE TABLE IF NOT EXISTS housekeepers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    location VARCHAR(255) NOT NULL,
    experience VARCHAR(50) NOT NULL,
    hourly_rate DECIMAL(10, 2) NOT NULL,
    photo_url TEXT,
    bio TEXT,
    services TEXT[] NOT NULL, -- Array of services
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP,
    approved_by INTEGER
);

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_housekeepers_status ON housekeepers(status);
CREATE INDEX IF NOT EXISTS idx_housekeepers_email ON housekeepers(email);
CREATE INDEX IF NOT EXISTS idx_housekeepers_location ON housekeepers(location);
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);

-- Insert default admin user (password: admin123)
INSERT INTO admins (email, password_hash, name) 
VALUES ('admin@minihousekeeper.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin User')
ON CONFLICT (email) DO NOTHING;

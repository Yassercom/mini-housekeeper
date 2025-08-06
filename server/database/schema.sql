-- Mini Housekeeper Database Schema

-- Create database (run this manually in PostgreSQL)
-- CREATE DATABASE mini_housekeeper;

-- Use the database
-- \c mini_housekeeper;

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
-- Password hash for 'admin123' using bcrypt
INSERT INTO admins (email, password_hash, name) 
VALUES ('admin@minihousekeeper.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin User')
ON CONFLICT (email) DO NOTHING;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_housekeepers_updated_at 
    BEFORE UPDATE ON housekeepers 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Sample data for testing (optional)
INSERT INTO housekeepers (name, email, phone, location, experience, hourly_rate, services, status, bio) VALUES
('Sarah Johnson', 'sarah.johnson@email.com', '(555) 123-4567', 'Brooklyn, NY', '3-5 years', 45.00, ARRAY['House Cleaning', 'Organization'], 'approved', 'Experienced cleaner with attention to detail.'),
('Maria Rodriguez', 'maria.rodriguez@email.com', '(555) 987-6543', 'Queens, NY', '5+ years', 50.00, ARRAY['Cooking & Meal Prep', 'Light Cleaning'], 'approved', 'Professional chef with 8 years of experience.'),
('Jennifer Chen', 'jennifer.chen@email.com', '(555) 456-7890', 'Manhattan, NY', '1-2 years', 35.00, ARRAY['Babysitting', 'Pet Care'], 'pending', 'Loving caregiver who enjoys working with children and pets.')
ON CONFLICT (email) DO NOTHING;

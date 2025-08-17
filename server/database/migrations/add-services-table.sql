-- Migration: Add services table for admin service management
-- Date: 2025-01-17

-- Create services table
CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    picture TEXT, -- URL or path to service image
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_services_name ON services(name);

-- Create function to update updated_at timestamp (if it doesn't exist)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS update_services_updated_at ON services;
CREATE TRIGGER update_services_updated_at 
    BEFORE UPDATE ON services 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default services (matching current frontend services)
INSERT INTO services (name, description, picture) VALUES
('House Cleaning', 'Professional house cleaning services including deep cleaning, regular maintenance, and organization.', '/images/cleaning.jpg'),
('Babysitting', 'Reliable childcare services with experienced and background-checked caregivers.', '/images/babysitting.jpg'),
('Garden Maintenance', 'Complete garden care including lawn mowing, pruning, planting, and landscape maintenance.', '/images/gardening.jpg'),
('Cooking & Meal Prep', 'Personal chef services and meal preparation for busy families and individuals.', '/images/cooking.jpg'),
('Pet Care', 'Professional pet sitting, dog walking, and pet care services in your home.', '/images/pet-care.jpg'),
('Elderly Care', 'Compassionate care and companionship services for elderly individuals.', '/images/elderly-care.jpg')
ON CONFLICT (name) DO NOTHING;

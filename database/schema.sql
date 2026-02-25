-- FN Furniture Inventory System Database Schema

-- User/Admin Table
CREATE TABLE "User" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'admin',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Branch Table
CREATE TABLE Branch (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  location VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Item (Master) Table
CREATE TABLE Item (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unique_id VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Entry Template Table
CREATE TABLE EntryTemplate (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES Item(id) ON DELETE RESTRICT,
  name VARCHAR(255) NOT NULL,
  specifications JSONB,
  unit_price DECIMAL(10, 2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(item_id, name)
);

-- Inventory Table
CREATE TABLE Inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES Branch(id) ON DELETE RESTRICT,
  entry_template_id UUID NOT NULL REFERENCES EntryTemplate(id) ON DELETE RESTRICT,
  quantity INT DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(branch_id, entry_template_id)
);

-- Customer Table
CREATE TABLE Customer (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255),
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Receipt Table
CREATE TABLE Receipt (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id VARCHAR(50) NOT NULL UNIQUE,
  branch_id UUID NOT NULL REFERENCES Branch(id) ON DELETE RESTRICT,
  customer_id UUID REFERENCES Customer(id) ON DELETE SET NULL,
  total_price DECIMAL(12, 2) NOT NULL,
  receipt_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Receipt Items Table
CREATE TABLE ReceiptItems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id UUID NOT NULL REFERENCES Receipt(id) ON DELETE CASCADE,
  entry_template_id UUID NOT NULL REFERENCES EntryTemplate(id) ON DELETE RESTRICT,
  quantity INT NOT NULL,
  unit_price DECIMAL(10, 2),
  subtotal DECIMAL(12, 2)
);

-- System Log Table
CREATE TABLE SystemLog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type VARCHAR(50) NOT NULL,
  action_description TEXT,
  entity_type VARCHAR(50),
  entity_id UUID,
  branch_id UUID REFERENCES Branch(id) ON DELETE SET NULL,
  user_id VARCHAR(100),
  status VARCHAR(20),
  log_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_user_username ON "User"(username);
CREATE INDEX idx_user_email ON "User"(email);
CREATE INDEX idx_inventory_branch ON Inventory(branch_id);
CREATE INDEX idx_inventory_entry_template ON Inventory(entry_template_id);
CREATE INDEX idx_receipt_branch ON Receipt(branch_id);
CREATE INDEX idx_receipt_customer ON Receipt(customer_id);
CREATE INDEX idx_receipt_items_receipt ON ReceiptItems(receipt_id);
CREATE INDEX idx_system_log_timestamp ON SystemLog(log_timestamp);
CREATE INDEX idx_system_log_branch ON SystemLog(branch_id);
CREATE INDEX idx_customer_phone ON Customer(phone);

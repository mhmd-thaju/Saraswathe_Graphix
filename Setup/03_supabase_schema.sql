-- =============================================================
-- PrintFlow ERP — Supabase (PostgreSQL) Backup Schema
-- File: 03_supabase_schema.sql
-- Run this ONCE in your Supabase SQL Editor to set up the
-- cloud backup tables. Daily sync from SQLite pushes data here.
-- =============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -------------------------------------------------------------
-- Table: customers
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customers (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    mobile      TEXT NOT NULL UNIQUE,
    email       TEXT,
    gstin       TEXT,
    address     TEXT,
    city        TEXT,
    state       TEXT DEFAULT 'Tamil Nadu',
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW(),
    synced_at   TIMESTAMPTZ DEFAULT NOW()      -- When last synced from SQLite
);

-- -------------------------------------------------------------
-- Table: orders
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
    id              TEXT PRIMARY KEY,
    order_number    INTEGER UNIQUE,
    customer_id     TEXT NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    status          TEXT NOT NULL DEFAULT 'new'
                        CHECK(status IN ('new', 'designing', 'printing', 'ready')),
    gst_type        TEXT NOT NULL DEFAULT 'intra'
                        CHECK(gst_type IN ('intra', 'inter')),
    subtotal        NUMERIC(12,2) NOT NULL DEFAULT 0,
    cgst_amount     NUMERIC(12,2) NOT NULL DEFAULT 0,
    sgst_amount     NUMERIC(12,2) NOT NULL DEFAULT 0,
    igst_amount     NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_amount    NUMERIC(12,2) NOT NULL DEFAULT 0,
    notes           TEXT,
    due_date        DATE,
    priority        TEXT DEFAULT 'normal'
                        CHECK(priority IN ('low', 'normal', 'high', 'urgent')),
    created_at      TIMESTAMPTZ,
    updated_at      TIMESTAMPTZ,
    synced_at       TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------------------------------------------
-- Table: line_items
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS line_items (
    id              TEXT PRIMARY KEY,
    order_id        TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    description     TEXT NOT NULL,
    hsn_code        TEXT DEFAULT '4911',
    quantity        NUMERIC(10,2) NOT NULL DEFAULT 1,
    unit            TEXT DEFAULT 'pcs',
    unit_price      NUMERIC(12,2) NOT NULL DEFAULT 0,
    gst_rate        NUMERIC(5,2) NOT NULL DEFAULT 18,
    amount          NUMERIC(12,2) NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ,
    synced_at       TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------------------------------------------
-- Table: notification_log
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notification_log (
    id          TEXT PRIMARY KEY,
    order_id    TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    channel     TEXT NOT NULL CHECK(channel IN ('whatsapp', 'email', 'sms')),
    message     TEXT NOT NULL,
    sent_by     TEXT DEFAULT 'staff',
    sent_at     TIMESTAMPTZ,
    synced_at   TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------------------------------------------
-- Table: settings
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS settings (
    key         TEXT PRIMARY KEY,
    value       TEXT NOT NULL,
    updated_at  TIMESTAMPTZ,
    synced_at   TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------------------------------------------
-- Table: backup_log (track backup history)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS backup_log (
    id              SERIAL PRIMARY KEY,
    started_at      TIMESTAMPTZ DEFAULT NOW(),
    completed_at    TIMESTAMPTZ,
    status          TEXT CHECK(status IN ('success', 'failed', 'running')),
    records_synced  INTEGER DEFAULT 0,
    error_message   TEXT
);

-- Row Level Security (optional but recommended)
ALTER TABLE customers       ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders          ENABLE ROW LEVEL SECURITY;
ALTER TABLE line_items      ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings        ENABLE ROW LEVEL SECURITY;

-- Allow all operations for the service role (used by backend backup)
CREATE POLICY "Service role full access" ON customers
    FOR ALL USING (true);
CREATE POLICY "Service role full access" ON orders
    FOR ALL USING (true);
CREATE POLICY "Service role full access" ON line_items
    FOR ALL USING (true);
CREATE POLICY "Service role full access" ON notification_log
    FOR ALL USING (true);
CREATE POLICY "Service role full access" ON settings
    FOR ALL USING (true);

-- =============================================================
-- PrintFlow ERP — SQLite Schema
-- File: 01_sqlite_schema.sql
-- Run this once during initial setup (handled automatically by
-- FastAPI on first startup via SQLAlchemy).
-- =============================================================

PRAGMA journal_mode=WAL;       -- Better concurrent read performance
PRAGMA foreign_keys = ON;      -- Enforce FK constraints

-- -------------------------------------------------------------
-- Table: customers
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customers (
    id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name        TEXT NOT NULL,
    mobile      TEXT NOT NULL UNIQUE,           -- Primary search key
    email       TEXT,
    gstin       TEXT,
    address     TEXT,
    city        TEXT,
    state       TEXT DEFAULT 'Tamil Nadu',
    created_at  TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    updated_at  TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_customers_mobile ON customers(mobile);
CREATE INDEX IF NOT EXISTS idx_customers_name   ON customers(name);

-- -------------------------------------------------------------
-- Table: orders
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
    id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    order_number    INTEGER UNIQUE,             -- Human-readable #1001, #1002…
    customer_id     TEXT NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    status          TEXT NOT NULL DEFAULT 'new'
                        CHECK(status IN ('new', 'designing', 'printing', 'ready')),
    gst_type        TEXT NOT NULL DEFAULT 'intra'
                        CHECK(gst_type IN ('intra', 'inter')),
    subtotal        REAL NOT NULL DEFAULT 0,
    cgst_amount     REAL NOT NULL DEFAULT 0,
    sgst_amount     REAL NOT NULL DEFAULT 0,
    igst_amount     REAL NOT NULL DEFAULT 0,
    total_amount    REAL NOT NULL DEFAULT 0,
    notes           TEXT,
    due_date        TEXT,                       -- ISO date string YYYY-MM-DD
    priority        TEXT DEFAULT 'normal'
                        CHECK(priority IN ('low', 'normal', 'high', 'urgent')),
    created_at      TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    updated_at      TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status   ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created  ON orders(created_at DESC);

-- Auto-increment order_number trigger
CREATE TRIGGER IF NOT EXISTS trg_order_number
BEFORE INSERT ON orders
WHEN NEW.order_number IS NULL
BEGIN
    UPDATE orders SET order_number = (SELECT COALESCE(MAX(order_number), 1000) + 1 FROM orders)
    WHERE id = NEW.id;
    SELECT RAISE(IGNORE);
END;

-- -------------------------------------------------------------
-- Table: line_items
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS line_items (
    id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    order_id        TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    description     TEXT NOT NULL,
    hsn_code        TEXT DEFAULT '4911',        -- HSN for printed matter
    quantity        REAL NOT NULL DEFAULT 1,
    unit            TEXT DEFAULT 'pcs',         -- pcs, sqft, sqm, etc.
    unit_price      REAL NOT NULL DEFAULT 0,
    gst_rate        REAL NOT NULL DEFAULT 18,   -- Percentage: 5, 12, 18, 28
    amount          REAL NOT NULL DEFAULT 0,    -- quantity * unit_price (before GST)
    created_at      TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_line_items_order ON line_items(order_id);

-- -------------------------------------------------------------
-- Table: notification_log
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notification_log (
    id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    order_id    TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    channel     TEXT NOT NULL CHECK(channel IN ('whatsapp', 'email', 'sms')),
    message     TEXT NOT NULL,
    sent_by     TEXT DEFAULT 'staff',
    sent_at     TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_notif_order ON notification_log(order_id);

-- -------------------------------------------------------------
-- Table: settings (key-value store for shop config)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS settings (
    key         TEXT PRIMARY KEY,
    value       TEXT NOT NULL,
    updated_at  TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

-- Default shop settings (run once)
INSERT OR IGNORE INTO settings (key, value) VALUES
    ('shop_name',       'Saraswathe Graphix'),
    ('shop_gstin',      ''),
    ('shop_address',    ''),
    ('shop_city',       ''),
    ('shop_state',      'Tamil Nadu'),
    ('shop_mobile',     ''),
    ('shop_email',      ''),
    ('default_gst_rate','18'),
    ('default_gst_type','intra'),
    ('invoice_prefix',  'SGX'),
    ('backup_enabled',  'true'),
    ('backup_time',     '02:00');

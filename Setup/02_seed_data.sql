-- =============================================================
-- PrintFlow ERP — Seed Data for Demo / Testing
-- File: 02_seed_data.sql
-- Run AFTER 01_sqlite_schema.sql
-- WARNING: This will insert sample records. Use only for testing.
-- =============================================================

-- Sample Customers
INSERT OR IGNORE INTO customers (id, name, mobile, email, gstin, address, city, state) VALUES
    ('cust-001', 'Ravi Kumar',      '9876543210', 'ravi@example.com',   '33AABCU9603R1ZX', '12, MG Road',       'Chennai',   'Tamil Nadu'),
    ('cust-002', 'Priya Sharma',    '9123456780', 'priya@example.com',  '',                '45, Anna Nagar',    'Chennai',   'Tamil Nadu'),
    ('cust-003', 'Suresh Babu',     '9988776655', 'suresh@example.com', '33BBBCD1234R1ZY', '8, Gandhi Street',  'Coimbatore','Tamil Nadu'),
    ('cust-004', 'Meena Krishnan',  '9345678901', '',                   '',                '22, Nehru Nagar',   'Madurai',   'Tamil Nadu'),
    ('cust-005', 'TechPrint Corp',  '9001234567', 'info@techprint.com', '29AACCT1234A1Z5', '100, Whitefield',   'Bengaluru', 'Karnataka');

-- Sample Orders
INSERT OR IGNORE INTO orders (id, order_number, customer_id, status, gst_type, subtotal, cgst_amount, sgst_amount, igst_amount, total_amount, notes, due_date, priority) VALUES
    ('ord-001', 1001, 'cust-001', 'new',      'intra', 5000,  450,  450,  0,   5900,  'Flex banners for shop opening',     '2026-05-10', 'high'),
    ('ord-002', 1002, 'cust-002', 'designing','intra', 2500,  225,  225,  0,   2950,  'Wedding invitation cards x500',     '2026-05-08', 'urgent'),
    ('ord-003', 1003, 'cust-003', 'printing', 'intra', 8000,  720,  720,  0,   9440,  'Company brochures A4 glossy x1000', '2026-05-07', 'normal'),
    ('ord-004', 1004, 'cust-004', 'ready',    'intra', 1200,  108,  108,  0,   1416,  'Visiting cards x250',               '2026-05-05', 'low'),
    ('ord-005', 1005, 'cust-005', 'new',      'inter', 15000, 0,    0,    2700,17700, 'Roll-up standee banners x10',        '2026-05-12', 'high');

-- Sample Line Items
INSERT OR IGNORE INTO line_items (order_id, description, hsn_code, quantity, unit, unit_price, gst_rate, amount) VALUES
    ('ord-001', 'Flex Banner 10x4 ft', '4911', 3,    'pcs',   1200, 18, 3600),
    ('ord-001', 'Flex Banner 6x3 ft',  '4911', 2,    'pcs',   700,  18, 1400),
    ('ord-002', 'Wedding Card Design', '4911', 1,    'job',   500,  18, 500),
    ('ord-002', 'Invitation Cards',    '4911', 500,  'pcs',   4,    18, 2000),
    ('ord-003', 'Brochure Design',     '4911', 1,    'job',   1000, 18, 1000),
    ('ord-003', 'A4 Brochure Glossy',  '4911', 1000, 'pcs',   7,    18, 7000),
    ('ord-004', 'Visiting Cards',      '4911', 250,  'pcs',   4.8,  18, 1200),
    ('ord-005', 'Roll-up Standee',     '4911', 10,   'pcs',   1500, 18, 15000);

-- Sample Notification Log
INSERT OR IGNORE INTO notification_log (order_id, channel, message) VALUES
    ('ord-004', 'whatsapp', 'Hi Meena, your order #1004 (Visiting cards x250) is ready for pickup at Saraswathe Graphix! 📦');

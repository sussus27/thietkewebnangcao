-- Tai khoan demo. Mat khau cua TAT CA cac tai khoan duoi day la: admin123456
-- (hash bcrypt cost 10, sinh tu chinh mat khau do).
-- admin@example.com la tai khoan admin duy nhat, dung de goi cac route quan tri.
INSERT INTO users (email, username, password_hash, role)
VALUES
    ('admin@example.com', 'admin',
     '$2b$10$EchTy6iKR51iLVdcKDUuIOkMK0HtLDBrnIBwrF/JZM/JoIMs4hYMi',
     'admin'),

    ('alice@example.com', 'alice',
     '$2b$10$EchTy6iKR51iLVdcKDUuIOkMK0HtLDBrnIBwrF/JZM/JoIMs4hYMi',
     'listener'),

    ('bob@example.com', 'bob',
     '$2b$10$EchTy6iKR51iLVdcKDUuIOkMK0HtLDBrnIBwrF/JZM/JoIMs4hYMi',
     'listener'),

    ('charlie@example.com', 'charlie',
     '$2b$10$EchTy6iKR51iLVdcKDUuIOkMK0HtLDBrnIBwrF/JZM/JoIMs4hYMi',
     'listener'),

    ('david@example.com', 'david',
     '$2b$10$EchTy6iKR51iLVdcKDUuIOkMK0HtLDBrnIBwrF/JZM/JoIMs4hYMi',
     'listener')

ON CONFLICT (email) DO NOTHING;

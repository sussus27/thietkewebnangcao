INSERT INTO users (email, username, password_hash, role)
VALUES
    ('admin@example.com', 'admin',
     '$2b$10$TNN5KO9RGxufcKUKZE4L3O1Sur8xfRdHpmFMzZgMg7mUzKpkyzBT2',
     'admin'),

    ('alice@example.com', 'alice',
     '$2b$10$TNN5KO9RGxufcKUKZE4L3O1Sur8xfRdHpmFMzZgMg7mUzKpkyzBT2',
     'listener'),

    ('bob@example.com', 'bob',
     '$2b$10$TNN5KO9RGxufcKUKZE4L3O1Sur8xfRdHpmFMzZgMg7mUzKpkyzBT2',
     'listener'),

    ('charlie@example.com', 'charlie',
     '$2b$10$TNN5KO9RGxufcKUKZE4L3O1Sur8xfRdHpmFMzZgMg7mUzKpkyzBT2',
     'listener'),

    ('david@example.com', 'david',
     '$2b$10$TNN5KO9RGxufcKUKZE4L3O1Sur8xfRdHpmFMzZgMg7mUzKpkyzBT2',
     'listener')

ON CONFLICT (email) DO NOTHING;
-- Du lieu hu cau de thu API; cac duong dan /demo/ chua co file nhac/anh that.
-- Chay sau 02-music-schema.sql. Can thay audio_url truoc khi thu phat nhac.
-- Chi them du lieu demo neu chua co; khong gan ID co dinh.

BEGIN;

INSERT INTO artists (name)
SELECT demo.name
FROM (VALUES ('Demo Acoustic'), ('Demo Piano'), ('Demo Band')) AS demo(name)
WHERE NOT EXISTS (SELECT 1 FROM artists WHERE name = demo.name);

INSERT INTO songs (title, audio_url, cover_url, duration_seconds)
SELECT demo.title, demo.audio_url, demo.cover_url, demo.duration_seconds
FROM (VALUES
    ('Ngay moi', '/demo/audio/ngay-moi.mp3', '/demo/covers/ngay-moi.jpg', 210),
    ('Chieu mua', '/demo/audio/chieu-mua.mp3', '/demo/covers/chieu-mua.jpg', 195),
    ('Dem yen tinh', '/demo/audio/dem-yen-tinh.mp3', '/demo/covers/dem-yen-tinh.jpg', 240),
    ('Chuyen di xa', '/demo/audio/chuyen-di-xa.mp3', '/demo/covers/chuyen-di-xa.jpg', 225),
    ('Hen ngay mai', '/demo/audio/hen-ngay-mai.mp3', '/demo/covers/hen-ngay-mai.jpg', 180)
) AS demo(title, audio_url, cover_url, duration_seconds)
WHERE NOT EXISTS (SELECT 1 FROM songs WHERE audio_url = demo.audio_url);

INSERT INTO song_artists (song_id, artist_id)
SELECT songs.id, artists.id
FROM (VALUES
    ('/demo/audio/ngay-moi.mp3', 'Demo Acoustic'),
    ('/demo/audio/chieu-mua.mp3', 'Demo Acoustic'),
    ('/demo/audio/dem-yen-tinh.mp3', 'Demo Piano'),
    ('/demo/audio/chuyen-di-xa.mp3', 'Demo Band'),
    ('/demo/audio/hen-ngay-mai.mp3', 'Demo Band'),
    ('/demo/audio/hen-ngay-mai.mp3', 'Demo Piano')
) AS demo(audio_url, artist_name)
JOIN songs ON songs.audio_url = demo.audio_url
JOIN artists ON artists.name = demo.artist_name
ON CONFLICT (song_id, artist_id) DO NOTHING;

COMMIT;

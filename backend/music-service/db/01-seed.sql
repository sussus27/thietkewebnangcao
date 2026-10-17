BEGIN;

INSERT INTO artists (name)
SELECT src.name
FROM (VALUES
    ('Johann Sebastian Bach'),
    ('Edvard Grieg'),
    ('Alexander Borodin'),
    ('Joseph Haydn')
) AS src(name)
WHERE NOT EXISTS (SELECT 1 FROM artists WHERE artists.name = src.name);

INSERT INTO songs (title, audio_url, duration_seconds)
SELECT src.title, src.audio_url, src.duration_seconds
FROM (VALUES
    ('Aria from Goldberg Variations, BWV 988', '/demo/audio/bach-goldberg-aria.mp3', 292),
    ('Morning Mood (Peer Gynt Suite No. 1, Op. 46)', '/demo/audio/grieg-morning-mood.mp3', 229),
    ('In the Hall of the Mountain King (Peer Gynt Suite No. 1, Op. 46)', '/demo/audio/grieg-hall-of-the-mountain-king.mp3', 154),
    ('String Quartet No. 1 in A major, III. Scherzo: Prestissimo', '/demo/audio/borodin-quartet-scherzo.mp3', 115),
    ('String Quartet in D major, Op. 64 No. 5 "The Lark", III. Menuetto: Allegretto', '/demo/audio/haydn-lark-menuetto.mp3', 227)
) AS src(title, audio_url, duration_seconds)
ON CONFLICT (audio_url) DO UPDATE
SET title = EXCLUDED.title,
    cover_url = EXCLUDED.cover_url,
    duration_seconds = EXCLUDED.duration_seconds;

INSERT INTO song_artists (song_id, artist_id)
SELECT songs.id, artists.id
FROM (VALUES
    ('/demo/audio/bach-goldberg-aria.mp3', 'Johann Sebastian Bach'),
    ('/demo/audio/grieg-morning-mood.mp3', 'Edvard Grieg'),
    ('/demo/audio/grieg-hall-of-the-mountain-king.mp3', 'Edvard Grieg'),
    ('/demo/audio/borodin-quartet-scherzo.mp3', 'Alexander Borodin'),
    ('/demo/audio/haydn-lark-menuetto.mp3', 'Joseph Haydn')
) AS src(audio_url, artist_name)
JOIN songs ON songs.audio_url = src.audio_url
JOIN artists ON artists.name = src.artist_name
ON CONFLICT DO NOTHING;

INSERT INTO playlists (name, description)
SELECT src.name, src.description
FROM (VALUES
    ('Nhac thu gian', 'Cac ban nhac nhe nhang de nghe khi lam viec'),
    ('Khoi dong ngay moi', 'Nhung ban nhac nhip nhanh cho buoi sang')
) AS src(name, description)
WHERE NOT EXISTS (SELECT 1 FROM playlists WHERE playlists.name = src.name);

INSERT INTO playlist_songs (playlist_id, song_id, position)
SELECT playlists.id, songs.id, src.position
FROM (VALUES
    ('Nhac thu gian', '/demo/audio/bach-goldberg-aria.mp3', 1),
    ('Nhac thu gian', '/demo/audio/grieg-morning-mood.mp3', 2),
    ('Nhac thu gian', '/demo/audio/haydn-lark-menuetto.mp3', 3),
    ('Khoi dong ngay moi', '/demo/audio/grieg-hall-of-the-mountain-king.mp3', 1),
    ('Khoi dong ngay moi', '/demo/audio/borodin-quartet-scherzo.mp3', 2),
    ('Khoi dong ngay moi', '/demo/audio/haydn-lark-menuetto.mp3', 3)
) AS src(playlist_name, audio_url, position)
JOIN playlists ON playlists.name = src.playlist_name
JOIN songs ON songs.audio_url = src.audio_url
ON CONFLICT DO NOTHING;

COMMIT;

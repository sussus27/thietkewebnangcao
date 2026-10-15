-- Cac bang nhac dung chung account_db theo cau hinh Docker Compose hien tai.
-- Chay sau 00-schema.sql (bang users).
-- Docker chi tu chay cac file init khi volume database con trong.
-- Database da co du lieu: chay file nay thu cong, khong xoa volume.

BEGIN;

CREATE TABLE IF NOT EXISTS artists (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL CHECK (BTRIM(name) <> ''),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS songs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL CHECK (BTRIM(title) <> ''),
    audio_url TEXT NOT NULL CHECK (BTRIM(audio_url) <> ''),
    cover_url TEXT,
    duration_seconds INTEGER NOT NULL CHECK (duration_seconds > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Mot bai hat co the co nhieu nghe si; mot nghe si co nhieu bai hat.
CREATE TABLE IF NOT EXISTS song_artists (
    song_id INTEGER NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
    artist_id INTEGER NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
    PRIMARY KEY (song_id, artist_id)
);

-- Moi nguoi dung chi luu mot bai hat mot lan.
CREATE TABLE IF NOT EXISTS saved_songs (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    song_id INTEGER NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
    saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, song_id)
);

CREATE INDEX IF NOT EXISTS song_artists_artist_id_idx ON song_artists (artist_id);
CREATE INDEX IF NOT EXISTS saved_songs_song_id_idx ON saved_songs (song_id);

COMMIT;

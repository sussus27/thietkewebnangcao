-- Schema cua music-service: bai hat, nghe si, playlist.

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

CREATE TABLE IF NOT EXISTS playlists (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER,
    name VARCHAR(150) NOT NULL CHECK (BTRIM(name) <> ''),
    description TEXT,
    cover_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS playlist_songs (
    playlist_id INTEGER NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
    song_id INTEGER NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
    position INTEGER NOT NULL CHECK (position > 0),
    added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (playlist_id, song_id),
    UNIQUE (playlist_id, position)
);

-- Tang toc tra cuu theo chieu nguoc (tu artist ra song, tu song ra playlist).
CREATE INDEX IF NOT EXISTS song_artists_artist_id_idx ON song_artists (artist_id);
CREATE INDEX IF NOT EXISTS playlist_songs_song_id_idx ON playlist_songs (song_id);
CREATE INDEX IF NOT EXISTS playlists_owner_id_idx ON playlists (owner_id);

COMMIT;

import { useState } from 'react'
import { PlaylistPickerModal } from '../components/PlaylistPickerModal'
import { SpotifyIcon } from '../components/SpotifyIcon'
import { formatDuration } from '../utils/formatDuration'

export function HomePage({
  username,
  setScreen,
  handleLogout,
  homeLoading,
  homeError,
  homeSongs,
  homePlaylists,
  playlists = [],
  handleOpenPlaylistDetail,
  handleAddSongToPlaylist,
  playlistAddLoadingId,
  handlePlayTrack,
  currentTrack,
  isPlaying,
  progress,
  duration,
  isShuffle,
  isRepeat,
  handleTogglePlayback,
  handleSeek,
  handlePreviousTrack,
  handleNextTrack,
  handleToggleShuffle,
  handleToggleRepeat,
  audioRef,
  setDuration,
  setProgress,
  handleTrackEnd,
}) {
  const [pickerSong, setPickerSong] = useState(null)

  const openPlaylistPicker = (song) => {
    setPickerSong(song)
  }

  const handlePickerSelect = async (playlistId) => {
    if (!pickerSong || !playlistId) {
      return
    }

    const success = await handleAddSongToPlaylist(pickerSong.id, playlistId)
    if (success) {
      setPickerSong(null)
    }
  }

  return (
    <div className="home-page">
      <aside className="sidebar">
        <div className="brand-row">
          <SpotifyIcon />
          <span>Spotify</span>
        </div>

        <nav className="nav-menu" aria-label="Menu điều hướng">
          <button type="button" className="nav-link active" onClick={() => setScreen('home')}>Trang chủ</button>
          <button type="button" className="nav-link" onClick={() => setScreen('search')}>Tìm kiếm</button>
          <button type="button" className="nav-link" onClick={() => setScreen('playlist')}>Playlist</button>
          <button type="button" className="nav-link" onClick={() => setScreen('artist')}>Nghệ sĩ</button>
          <button type="button" className="nav-link" onClick={() => setScreen('profile')}>Hồ sơ</button>
        </nav>

        <div className="playlist-box">
          <h3>Playlist của bạn</h3>
          <ul>
            {homePlaylists.length === 0 ? (
              <li>Chưa có playlist nào</li>
            ) : (
              homePlaylists.map((playlist) => (
                <li key={playlist.id}>
                  <button
                    type="button"
                    className="sidebar-playlist-link"
                    onClick={() => handleOpenPlaylistDetail?.(playlist)}
                  >
                    {playlist.name || 'Playlist'}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      </aside>

      <main className="content-panel">
        <header className="topbar">
          <div>
            <p className="greeting">Xin chào,</p>
            <h2>{username || 'Người dùng'}</h2>
          </div>
          <div className="topbar-actions">
            <button type="button" className="logout-button" onClick={handleLogout}>Đăng xuất</button>
            <button type="button" className="profile-button">{(username || 'U').charAt(0).toUpperCase()}</button>
          </div>
        </header>

        {homeError ? <p className="form-error">{homeError}</p> : null}

        <section className="hero-banner">
          <div>
            <p>Nghe gì hôm nay</p>
            <h3>Khám phá âm nhạc mới</h3>
          </div>
          <button
            type="button"
            className="hero-button"
            onClick={() => {
              if (!homeSongs.length) {
                setScreen('search')
                return
              }

              const randomIndex = Math.floor(Math.random() * homeSongs.length)
              const randomTrack = homeSongs[randomIndex]
              handlePlayTrack(randomTrack, homeSongs)
            }}
          >
            Phát nhạc
          </button>
        </section>

        <section className="section-block">
          <div className="section-head">
            <h3>Dành cho bạn</h3>
            <span>Playlist</span>
          </div>

          <div className="playlist-grid">
            {homeLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <article key={index} className="playlist-card placeholder-card">
                  <span className="placeholder-line big" />
                  <small className="placeholder-line small" />
                </article>
              ))
            ) : homePlaylists.length === 0 ? (
              <div className="empty-state">
                <p>Chưa có playlist nào.</p>
              </div>
            ) : (
              homePlaylists.map((playlist) => (
                <article
                  key={playlist.id}
                  className="playlist-card playlist-card-button"
                  style={{ background: 'linear-gradient(135deg, #1db954, #0b3d2a)' }}
                  onClick={() => handleOpenPlaylistDetail?.(playlist)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      handleOpenPlaylistDetail?.(playlist)
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <strong>{playlist.name || 'Playlist'}</strong>
                  <small>{playlist.song_count ?? 0} bài hát</small>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="section-block">
          <div className="section-head">
            <h3>Nghe gần đây</h3>
            <span>Danh sách</span>
          </div>

          <div className="track-list">
            {homeLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="track-row placeholder-row">
                  <div className="track-meta">
                    <div className="track-art placeholder-art" aria-hidden="true" />
                    <div className="placeholder-text-group">
                      <strong className="placeholder-line medium" />
                      <small className="placeholder-line small" />
                    </div>
                  </div>
                  <span className="placeholder-line tiny" />
                </div>
              ))
            ) : homeSongs.length === 0 ? (
              <div className="empty-state">
                <p>Chưa có bài hát nào.</p>
              </div>
            ) : (
              homeSongs.map((song) => {
                const artistText = Array.isArray(song.artists) && song.artists.length > 0
                  ? song.artists.join(', ')
                  : 'Nghệ sĩ không xác định'

                return (
                  <div key={song.id} className="track-row" style={{ cursor: 'default' }}>
                    <div className="track-meta" onClick={() => handlePlayTrack(song, homeSongs)} style={{ cursor: 'pointer', flex: 1 }}>
                      <div className="track-art" aria-hidden="true" style={{ backgroundImage: song.cover_url ? `url(${song.cover_url})` : 'linear-gradient(135deg, #1db954, #0b3d2a)' }} />
                      <div>
                        <strong>{song.title || 'Không có tiêu đề'}</strong>
                        <small>{artistText}</small>
                      </div>
                    </div>
                    <div className="song-actions">
                      <span>{song.duration_seconds ? formatDuration(song.duration_seconds) : '0:00'}</span>
                      <button
                        type="button"
                        className="playlist-add-button"
                        onClick={() => openPlaylistPicker(song)}
                        disabled={playlists.length === 0 || playlistAddLoadingId === song.id}
                      >
                        {playlistAddLoadingId === song.id ? 'Đang thêm...' : 'Thêm'}
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </section>
      </main>

      <PlaylistPickerModal
        open={Boolean(pickerSong)}
        song={pickerSong}
        playlists={playlists}
        loadingSongId={playlistAddLoadingId}
        onClose={() => setPickerSong(null)}
        onSelect={handlePickerSelect}
      />
    </div>
  )
}

import { SpotifyIcon } from '../components/SpotifyIcon'

export function ArtistPage({
  username,
  setScreen,
  handleLogout,
  artists,
  artistLoading,
  artistError,
  handleOpenArtistDetail,
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
  return (
    <div className="home-page">
      <aside className="sidebar">
        <div className="brand-row">
          <SpotifyIcon />
          <span>Spotify</span>
        </div>

        <nav className="nav-menu" aria-label="Menu điều hướng">
          <button type="button" className="nav-link" onClick={() => setScreen('home')}>Trang chủ</button>
          <button type="button" className="nav-link" onClick={() => setScreen('search')}>Tìm kiếm</button>
          <button type="button" className="nav-link" onClick={() => setScreen('playlist')}>Playlist</button>
          <button type="button" className="nav-link active" onClick={() => setScreen('artist')}>Nghệ sĩ</button>
          <button type="button" className="nav-link" onClick={() => setScreen('profile')}>Hồ sơ</button>
        </nav>

      </aside>

      <main className="content-panel">
        <header className="topbar">
          <div>
            <p className="greeting">Khám phá</p>
            <h2>Nghệ sĩ</h2>
          </div>
          <div className="topbar-actions">
            <button type="button" className="logout-button" onClick={handleLogout}>Đăng xuất</button>
            <button type="button" className="profile-button" onClick={() => setScreen('profile')}>
              {(username || 'U').charAt(0).toUpperCase()}
            </button>
          </div>
        </header>

        <section className="artist-panel">
          {artistError ? <p className="form-error">{artistError}</p> : null}

          {artistLoading ? (
            <div className="artist-grid">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="artist-card placeholder-card">
                  <span className="placeholder-line big" />
                  <small className="placeholder-line small" />
                </div>
              ))}
            </div>
          ) : artists.length === 0 ? (
            <div className="empty-state">
              <p>Chưa có nghệ sĩ nào.</p>
            </div>
          ) : (
            <div className="artist-grid">
              {artists.map((artist) => (
                <article
                  key={artist.id}
                  className="artist-card artist-card-button"
                  onClick={() => handleOpenArtistDetail(artist)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      handleOpenArtistDetail(artist)
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="artist-avatar" aria-hidden="true">
                    {(artist.name || 'A').charAt(0).toUpperCase()}
                  </div>
                  <strong>{artist.name || 'Nghệ sĩ'}</strong>
                  <small>{artist.song_count ?? 0} bài hát</small>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

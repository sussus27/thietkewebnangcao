import { PlayerBar } from '../components/PlayerBar'
import { SpotifyIcon } from '../components/SpotifyIcon'
import { formatDuration } from '../utils/formatDuration'

export function ArtistDetailPage({
  username,
  setScreen,
  handleLogout,
  selectedArtist,
  artistDetail,
  artistDetailError,
  artistDetailLoading,
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
  const detailSongs = Array.isArray(artistDetail?.songs) ? artistDetail.songs : []

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

        <div className="playlist-box">
          <h3>Nghệ sĩ</h3>
          <ul>
            <li>{selectedArtist?.name || 'Nghệ sĩ'}</li>
          </ul>
        </div>
      </aside>

      <main className="content-panel">
        <header className="topbar">
          <div>
            <p className="greeting">Khám phá</p>
            <h2>{selectedArtist?.name || artistDetail?.name || 'Nghệ sĩ'}</h2>
          </div>
          <div className="topbar-actions">
            <button type="button" className="logout-button" onClick={handleLogout}>Đăng xuất</button>
            <button type="button" className="profile-button" onClick={() => setScreen('profile')}>
              {(username || 'U').charAt(0).toUpperCase()}
            </button>
          </div>
        </header>

        {artistDetailError ? <p className="form-error">{artistDetailError}</p> : null}

        <section className="artist-detail-page">
          <div className="artist-detail-hero">
            <div className="artist-avatar detail-avatar" aria-hidden="true">
              {(selectedArtist?.name || artistDetail?.name || 'A').charAt(0).toUpperCase()}
            </div>
            <div className="artist-detail-copy">
              <p>Nghệ sĩ</p>
              <h3>{selectedArtist?.name || artistDetail?.name || 'Nghệ sĩ'}</h3>
              <small>{detailSongs.length} bài hát</small>
              <div className="artist-detail-actions">
                <button type="button" className="primary-button small-button" onClick={() => {
                  if (detailSongs.length > 0) {
                    handlePlayTrack(detailSongs[0], detailSongs)
                  }
                }}>
                  Phát nhạc
                </button>
                <button type="button" className="logout-button small-button" onClick={() => setScreen('artist')}>
                  Quay lại
                </button>
              </div>
            </div>
          </div>

          {artistDetailLoading ? (
            <div className="artist-track-list">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="artist-track-row placeholder-row">
                  <div className="track-meta">
                    <div className="track-art placeholder-art" aria-hidden="true" />
                    <div className="placeholder-text-group">
                      <strong className="placeholder-line medium" />
                      <small className="placeholder-line small" />
                    </div>
                  </div>
                  <span className="placeholder-line tiny" />
                </div>
              ))}
            </div>
          ) : detailSongs.length === 0 ? (
            <div className="empty-state">
              <p>Nghệ sĩ này chưa có bài hát nào.</p>
            </div>
          ) : (
            <div className="artist-track-list">
              {detailSongs.map((song, index) => {
                const artistText = Array.isArray(song.artists) && song.artists.length > 0
                  ? song.artists.join(', ')
                  : 'Nghệ sĩ không xác định'

                return (
                  <div key={song.id || `${song.title}-${index}`} className="artist-track-row" onClick={() => handlePlayTrack(song, detailSongs)} style={{ cursor: 'pointer' }}>
                    <div className="track-meta">
                      <span className="track-index">{index + 1}</span>
                      <div className="track-art" aria-hidden="true" style={{ backgroundImage: song.cover_url ? `url(${song.cover_url})` : 'linear-gradient(135deg, #1db954, #0b3d2a)' }} />
                      <div>
                        <strong>{song.title || 'Không có tiêu đề'}</strong>
                        <small>{artistText}</small>
                      </div>
                    </div>
                    <span>{song.duration_seconds ? formatDuration(song.duration_seconds) : '0:00'}</span>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </main>

      <PlayerBar
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        progress={progress}
        duration={duration}
        isShuffle={isShuffle}
        isRepeat={isRepeat}
        onToggle={handleTogglePlayback}
        onSeek={handleSeek}
        onPrevious={handlePreviousTrack}
        onNext={handleNextTrack}
        onToggleShuffle={handleToggleShuffle}
        onToggleRepeat={handleToggleRepeat}
        audioRef={audioRef}
        onLoadedMetadata={() => setDuration(Number.isFinite(audioRef.current?.duration) ? audioRef.current.duration : 0)}
        onTimeUpdate={() => setProgress(audioRef.current?.currentTime || 0)}
        onEnded={handleTrackEnd}
      />
    </div>
  )
}

import { SpotifyIcon } from '../components/SpotifyIcon'
import { formatDuration } from '../utils/formatDuration'

export function PlaylistDetailPage({
  username,
  setScreen,
  handleLogout,
  selectedPlaylist,
  playlistDetail,
  playlistDetailError,
  playlistDetailLoading,
  detailSongs,
  handleDeletePlaylist,
  handleDeleteSongFromPlaylist,
  playlistActionLoadingId,
  playlistSongActionLoadingId,
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
          <button type="button" className="nav-link active" onClick={() => setScreen('playlist')}>Playlist</button>
          <button type="button" className="nav-link" onClick={() => setScreen('artist')}>Nghệ sĩ</button>
          <button type="button" className="nav-link" onClick={() => setScreen('profile')}>Hồ sơ</button>
        </nav>

        <div className="playlist-box">
          <h3>Playlist</h3>
          <ul>
            <li>{selectedPlaylist?.name || 'Playlist hiện tại'}</li>
          </ul>
        </div>
      </aside>

      <main className="content-panel">
        <header className="topbar">
          <div>
            <p className="greeting">Thư viện</p>
            <h2>{selectedPlaylist?.name || 'Playlist'}</h2>
          </div>
          <div className="topbar-actions">
            <button type="button" className="logout-button" onClick={handleLogout}>Đăng xuất</button>
            <button type="button" className="profile-button" onClick={() => setScreen('profile')}>
              {(username || 'U').charAt(0).toUpperCase()}
            </button>
          </div>
        </header>

        {playlistDetailError ? <p className="form-error">{playlistDetailError}</p> : null}

        <section className="playlist-detail-page">
          <div className="playlist-detail-hero">
            <div className="playlist-cover detail-cover" aria-hidden="true">
              {(selectedPlaylist?.name || 'P').charAt(0).toUpperCase()}
            </div>
            <div className="playlist-detail-copy">
              <p>Playlist</p>
              <h3>{selectedPlaylist?.name || playlistDetail?.name || 'Playlist'}</h3>
              <small>{detailSongs.length} bài hát</small>
              <div className="playlist-detail-actions">
                <button type="button" className="primary-button small-button" onClick={() => {
                  if (detailSongs.length > 0) {
                    handlePlayTrack(detailSongs[0], detailSongs)
                  }
                }}>
                  Phát tất cả
                </button>
                <button type="button" className="logout-button small-button" onClick={() => setScreen('playlist')}>
                  Quay lại
                </button>
                <button
                  type="button"
                  className="playlist-delete-button detail-delete-button"
                  onClick={() => selectedPlaylist && handleDeletePlaylist(selectedPlaylist.id)}
                  disabled={playlistActionLoadingId === selectedPlaylist?.id}
                >
                  {playlistActionLoadingId === selectedPlaylist?.id ? 'Đang xóa...' : 'Xóa playlist'}
                </button>
              </div>
            </div>
          </div>

          {playlistDetailLoading ? (
            <div className="playlist-detail-list">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="playlist-detail-row placeholder-row">
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
              <p>Playlist này chưa có bài hát nào.</p>
              <span>Hãy quay lại danh sách và thử playlist khác.</span>
            </div>
          ) : (
            <div className="playlist-detail-list">
              {detailSongs.map((song, index) => {
                const artistText = Array.isArray(song.artists) && song.artists.length > 0
                  ? song.artists.join(', ')
                  : 'Nghệ sĩ không xác định'

                return (
                  <div key={song.id || `${song.title}-${index}`} className="playlist-detail-row">
                    <div className="track-meta" onClick={() => handlePlayTrack(song, detailSongs)} style={{ cursor: 'pointer', flex: 1 }}>
                      <span className="track-index">{index + 1}</span>
                      <div className="track-art" aria-hidden="true" style={{ backgroundImage: song.cover_url ? `url(${song.cover_url})` : 'linear-gradient(135deg, #1db954, #0b3d2a)' }} />
                      <div>
                        <strong>{song.title || 'Không có tiêu đề'}</strong>
                        <small>{artistText}</small>
                      </div>
                    </div>
                    <div className="playlist-song-actions">
                      <span>{song.duration_seconds ? formatDuration(song.duration_seconds) : '0:00'}</span>
                      <button
                        type="button"
                        className="playlist-delete-button song-delete-button"
                        onClick={() => handleDeleteSongFromPlaylist(song.id)}
                        disabled={playlistSongActionLoadingId === song.id}
                      >
                        {playlistSongActionLoadingId === song.id ? '...' : 'Xóa'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

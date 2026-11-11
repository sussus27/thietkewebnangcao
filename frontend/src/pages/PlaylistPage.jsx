import { SpotifyIcon } from '../components/SpotifyIcon'

export function PlaylistPage({
  username,
  setScreen,
  handleLogout,
  playlists,
  playlistLoading,
  playlistError,
  playlistFormOpen,
  setPlaylistFormOpen,
  playlistForm,
  setPlaylistForm,
  playlistSubmitting,
  handleCreatePlaylist,
  handleOpenPlaylistDetail,
  handleDeletePlaylist,
  playlistActionLoadingId,
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

      </aside>

      <main className="content-panel">
        <header className="topbar">
          <div>
            <p className="greeting">Thư viện</p>
            <h2>Playlist của bạn</h2>
          </div>
          <div className="topbar-actions">
            <button type="button" className="logout-button" onClick={handleLogout}>Đăng xuất</button>
            <button type="button" className="profile-button">{(username || 'U').charAt(0).toUpperCase()}</button>
          </div>
        </header>

        <section className="playlist-panel">
          <div className="section-head playlist-head">
            <h3>Danh sách phát</h3>
            <button type="button" className="primary-button small-button" onClick={() => setPlaylistFormOpen((previous) => !previous)}>
              {playlistFormOpen ? 'Đóng' : 'Tạo playlist'}
            </button>
          </div>

          {playlistFormOpen ? (
            <form className="playlist-form" onSubmit={handleCreatePlaylist}>
              <label className="field-label">
                <span>Tên playlist</span>
                <input
                  type="text"
                  value={playlistForm.name}
                  onChange={(event) => setPlaylistForm({ ...playlistForm, name: event.target.value })}
                  placeholder="Nhập tên playlist"
                />
              </label>

              <label className="field-label">
                <span>Mô tả</span>
                <input
                  type="text"
                  value={playlistForm.description}
                  onChange={(event) => setPlaylistForm({ ...playlistForm, description: event.target.value })}
                  placeholder="Mô tả (tùy chọn)"
                />
              </label>

              <div className="playlist-form-actions">
                <button type="submit" className="primary-button small-button" disabled={playlistSubmitting}>
                  {playlistSubmitting ? 'Đang lưu...' : 'Lưu playlist'}
                </button>
                <button type="button" className="back-button ghost" onClick={() => setPlaylistFormOpen(false)}>
                  Hủy
                </button>
              </div>
            </form>
          ) : null}

          {playlistError ? <p className="form-error">{playlistError}</p> : null}

          {playlistLoading ? (
            <div className="playlist-grid">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="playlist-card placeholder-card">
                  <span className="placeholder-line big" />
                  <small className="placeholder-line small" />
                </div>
              ))}
            </div>
          ) : (
            <div className="playlist-grid">
              {playlists.length === 0 ? (
                <div className="empty-state playlist-empty">
                  <p>Chưa có playlist nào.</p>
                  <span>Hãy tạo playlist đầu tiên của bạn.</span>
                </div>
              ) : (
                playlists.map((playlist) => (
                  <article
                    key={playlist.id}
                    className="playlist-card playlist-real-card playlist-card-button"
                    onClick={() => handleOpenPlaylistDetail(playlist)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        handleOpenPlaylistDetail(playlist)
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="playlist-card-toolbar">
                      <div className="playlist-cover" aria-hidden="true">
                        {playlist.name ? playlist.name.charAt(0).toUpperCase() : 'P'}
                      </div>
                      <button
                        type="button"
                        className="playlist-delete-button"
                        onClick={(event) => {
                          event.stopPropagation()
                          handleDeletePlaylist(playlist.id)
                        }}
                        aria-label="Xóa playlist"
                        disabled={playlistActionLoadingId === playlist.id}
                      >
                        {playlistActionLoadingId === playlist.id ? '...' : 'Xóa'}
                      </button>
                    </div>
                    <strong>{playlist.name || 'Playlist'}</strong>
                    <small>{playlist.song_count ?? 0} bài hát</small>
                  </article>
                ))
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

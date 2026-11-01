import { PlayerBar } from '../components/PlayerBar'
import { SpotifyIcon } from '../components/SpotifyIcon'

export function ProfilePage({
  username,
  setScreen,
  handleLogout,
  profile,
  profileLoading,
  profileError,
  profileForm,
  setProfileForm,
  profileSaving,
  handleProfileSave,
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
          <button type="button" className="nav-link" onClick={() => setScreen('artist')}>Nghệ sĩ</button>
          <button type="button" className="nav-link active" onClick={() => setScreen('profile')}>Hồ sơ</button>
        </nav>

        <div className="playlist-box">
          <h3>Tài khoản</h3>
          <ul>
            <li>Thông tin</li>
            <li>Bảo mật</li>
            <li>Giao diện</li>
          </ul>
        </div>
      </aside>

      <main className="content-panel">
        <header className="topbar">
          <div>
            <p className="greeting">Tài khoản</p>
            <h2>Hồ sơ</h2>
          </div>
          <div className="topbar-actions">
            <button type="button" className="logout-button" onClick={handleLogout}>Đăng xuất</button>
            <button type="button" className="profile-button">{(username || 'U').charAt(0).toUpperCase()}</button>
          </div>
        </header>

        <section className="profile-panel">
          <div className="profile-summary">
            <div className="profile-avatar">{(username || 'U').charAt(0).toUpperCase()}</div>
            <div>
              <p>Xin chào</p>
              <h3>{username || 'Người dùng'}</h3>
            </div>
          </div>

          <form className="profile-form" onSubmit={handleProfileSave} noValidate>
            <label className="field-label" htmlFor="profile-username">
              <span>Tên người dùng</span>
              <input
                id="profile-username"
                type="text"
                value={profileForm.username}
                onChange={(event) => {
                  setProfileForm({ ...profileForm, username: event.target.value })
                }}
                placeholder="Tên người dùng"
              />
            </label>

            <label className="field-label" htmlFor="profile-email">
              <span>Email</span>
              <input
                id="profile-email"
                type="email"
                value={profileForm.email}
                onChange={(event) => {
                  setProfileForm({ ...profileForm, email: event.target.value })
                }}
                placeholder="name@domain.com"
              />
            </label>

            {profileError ? <p className="form-error">{profileError}</p> : null}

            <button type="submit" className="primary-button" disabled={profileSaving}>
              {profileSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </form>
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

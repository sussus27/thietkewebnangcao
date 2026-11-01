import { PlayerBar } from '../components/PlayerBar'
import { SpotifyIcon } from '../components/SpotifyIcon'

export function SearchPage({
  username,
  setScreen,
  handleLogout,
  artists = [],
  searchQuery,
  setSearchQuery,
  searchArtistId,
  setSearchArtistId,
  searchOrder,
  setSearchOrder,
  searchPage,
  setSearchPage,
  searchResults,
  searchLoading,
  searchError,
  searchPagination,
  handleSearch,
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
  const totalPages = Number(searchPagination?.totalPages) || 0
  const currentPage = Number(searchPagination?.page) || searchPage || 1

  return (
    <div className="home-page">
      <aside className="sidebar">
        <div className="brand-row">
          <SpotifyIcon />
          <span>Spotify</span>
        </div>

        <nav className="nav-menu" aria-label="Menu điều hướng">
          <button type="button" className="nav-link" onClick={() => setScreen('home')}>Trang chủ</button>
          <button type="button" className="nav-link active" onClick={() => setScreen('search')}>Tìm kiếm</button>
          <button type="button" className="nav-link" onClick={() => setScreen('playlist')}>Playlist</button>
          <button type="button" className="nav-link" onClick={() => setScreen('artist')}>Nghệ sĩ</button>
          <button type="button" className="nav-link" onClick={() => setScreen('profile')}>Hồ sơ</button>
        </nav>

        <div className="playlist-box">
          <h3>Gợi ý</h3>
          <ul>
            <li>Pop</li>
            <li>Acoustic</li>
            <li>Indie</li>
          </ul>
        </div>
      </aside>

      <main className="content-panel">
        <header className="topbar">
          <div>
            <p className="greeting">Khám phá</p>
            <h2>Tìm kiếm</h2>
          </div>
          <div className="topbar-actions">
            <button type="button" className="logout-button" onClick={handleLogout}>Đăng xuất</button>
            <button type="button" className="profile-button">{(username || 'U').charAt(0).toUpperCase()}</button>
          </div>
        </header>

        <section className="search-panel">
          <form className="search-form" onSubmit={(event) => handleSearch(event, 1)}>
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Tìm kiếm bài hát hoặc nghệ sĩ..."
              aria-label="Tìm kiếm bài hát"
            />

            <select
              value={searchArtistId}
              onChange={(event) => setSearchArtistId(event.target.value)}
              aria-label="Lọc theo nghệ sĩ"
            >
              <option value="">Tất cả nghệ sĩ</option>
              {artists.map((artist) => (
                <option key={artist.id} value={artist.id}>{artist.name || 'Nghệ sĩ'}</option>
              ))}
            </select>

            <select
              value={searchOrder}
              onChange={(event) => setSearchOrder(event.target.value)}
              aria-label="Sắp xếp kết quả"
            >
              <option value="desc">Mới nhất</option>
              <option value="asc">Cũ nhất</option>
            </select>

            <button type="submit" className="primary-button search-button" disabled={searchLoading}>
              {searchLoading ? 'Đang tìm...' : 'Tìm kiếm'}
            </button>
          </form>

          {searchError ? <p className="form-error search-error">{searchError}</p> : null}

          {totalPages > 0 ? (
            <div className="search-pagination">
              <button
                type="button"
                className="logout-button small-button"
                onClick={() => handleSearch(null, Math.max(1, currentPage - 1))}
                disabled={searchLoading || currentPage <= 1}
              >
                Trước
              </button>
              <span>Trang {currentPage} / {totalPages}</span>
              <button
                type="button"
                className="logout-button small-button"
                onClick={() => handleSearch(null, Math.min(totalPages, currentPage + 1))}
                disabled={searchLoading || currentPage >= totalPages}
              >
                Tiếp
              </button>
            </div>
          ) : null}

          <div className="search-results">
            {!searchLoading && searchResults.length === 0 ? (
              <div className="empty-state">
                <p>Chưa có kết quả nào.</p>
                <span>Hãy thử tìm theo tên bài hát hoặc nghệ sĩ.</span>
              </div>
            ) : null}

            {searchResults.map((song) => {
              const artistText = Array.isArray(song.artists) && song.artists.length > 0
                ? song.artists.join(', ')
                : 'Nghệ sĩ không xác định'

              return (
                <div key={song.id} className="search-result-item">
                  <div className="song-cover" style={{ backgroundImage: song.cover_url ? `url(${song.cover_url})` : 'linear-gradient(135deg, #1db954, #0b3d2a)' }} />
                  <div className="song-info">
                    <strong>{song.title || 'Không có tiêu đề'}</strong>
                    <small>{artistText}</small>
                  </div>
                  <div className="song-actions">
                    <span>{song.duration_seconds ? `${Math.floor(song.duration_seconds / 60)}:${String(song.duration_seconds % 60).padStart(2, '0')}` : '—'}</span>
                    <button type="button" onClick={() => handlePlayTrack(song, searchResults)}>Phát</button>
                  </div>
                </div>
              )
            })}
          </div>
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

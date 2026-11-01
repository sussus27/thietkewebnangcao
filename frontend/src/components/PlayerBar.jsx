import { formatDuration } from '../utils/formatDuration'

export function PlayerBar({
  currentTrack,
  isPlaying,
  progress,
  duration,
  isShuffle,
  isRepeat,
  onToggle,
  onSeek,
  onPrevious,
  onNext,
  onToggleShuffle,
  onToggleRepeat,
  audioRef,
  onLoadedMetadata,
  onTimeUpdate,
  onEnded,
}) {
  if (!currentTrack) {
    return null
  }

  const artistText = Array.isArray(currentTrack.artists) && currentTrack.artists.length > 0
    ? currentTrack.artists.join(', ')
    : 'Nghệ sĩ không xác định'

  return (
    <div className="player-bar">
      <audio
        ref={audioRef}
        src=""
        onLoadedMetadata={onLoadedMetadata}
        onTimeUpdate={onTimeUpdate}
        onEnded={onEnded}
      />

      <div className="player-track">
        <div className="player-cover" style={{ backgroundImage: currentTrack.cover_url ? `url(${currentTrack.cover_url})` : 'linear-gradient(135deg, #1db954, #0b3d2a)' }} />
        <div className="player-track-text">
          <strong>{currentTrack.title || 'Không có tiêu đề'}</strong>
          <small>{artistText}</small>
        </div>
      </div>

      <div className="player-controls">
        <button
          type="button"
          className={`player-mode-button ${isShuffle ? 'active' : ''}`}
          onClick={onToggleShuffle}
          aria-label="Shuffle"
        >
          ⤮
        </button>
        <button type="button" className="player-nav-button" onClick={onPrevious} aria-label="Bài trước">
          ⏮
        </button>
        <button type="button" className="player-toggle" onClick={onToggle}>
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button type="button" className="player-nav-button" onClick={onNext} aria-label="Bài tiếp theo">
          ⏭
        </button>
        <button
          type="button"
          className={`player-mode-button ${isRepeat ? 'active' : ''}`}
          onClick={onToggleRepeat}
          aria-label="Repeat"
        >
          ↻
        </button>
      </div>

      <div className="player-progress-wrap">
        <span>{formatDuration(progress)}</span>
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={progress}
          onChange={(event) => onSeek(Number(event.target.value))}
          aria-label="Phát nhạc"
        />
        <span>{formatDuration(duration)}</span>
      </div>
    </div>
  )
}

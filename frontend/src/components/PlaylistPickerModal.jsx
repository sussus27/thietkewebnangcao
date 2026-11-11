export function PlaylistPickerModal({
  open,
  song,
  playlists = [],
  loadingSongId = null,
  onClose,
  onSelect,
}) {
  if (!open || !song) {
    return null
  }

  return (
    <div className="playlist-modal-overlay" onClick={onClose} role="presentation">
      <div className="playlist-modal" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label="Chọn playlist">
        <div className="playlist-modal-header">
          <h3>Thêm vào playlist</h3>
          <button type="button" className="modal-close-button" onClick={onClose} aria-label="Đóng popup">
            ×
          </button>
        </div>

        <div className="playlist-modal-body">
          <p>
            <strong>{song.title || 'Bài hát'}</strong>
          </p>

          {playlists.length === 0 ? (
            <div className="playlist-modal-empty">
              <span>Bạn chưa có playlist nào.</span>
            </div>
          ) : (
            <div className="playlist-modal-list">
              {playlists.map((playlist) => (
                <button
                  key={playlist.id}
                  type="button"
                  className="playlist-modal-option"
                  onClick={() => onSelect(playlist.id)}
                  disabled={loadingSongId === song.id}
                >
                  <span>{playlist.name || 'Playlist'}</span>
                  <small>{playlist.song_count ?? 0} bài hát</small>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

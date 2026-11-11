import { useEffect, useState } from 'react'
import { SpotifyIcon } from '../components/SpotifyIcon'

const defaultArtistForm = { name: '' }
const defaultSongForm = { title: '', audioUrl: '', coverUrl: '', durationSeconds: '', artistIds: [] }

export function AdminPage({ username, setScreen, handleLogout }) {
  const [users, setUsers] = useState([])
  const [artists, setArtists] = useState([])
  const [songs, setSongs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [actionLoadingId, setActionLoadingId] = useState(null)
  const [adminView, setAdminView] = useState('overview')
  const [artistForm, setArtistForm] = useState(defaultArtistForm)
  const [songForm, setSongForm] = useState(defaultSongForm)
  const [editingArtistId, setEditingArtistId] = useState(null)
  const [editingSongId, setEditingSongId] = useState(null)
  const [loadingCatalog, setLoadingCatalog] = useState(false)
  const [songUploadFile, setSongUploadFile] = useState(null)
  const [songCoverFile, setSongCoverFile] = useState(null)
  const [songUploading, setSongUploading] = useState(false)

  useEffect(() => {
    const loadUsers = async () => {
      const token = localStorage.getItem('spotify_token')

      if (!token) {
        setScreen('login')
        return
      }

      setLoading(true)
      setError('')

      try {
        const response = await fetch('/api/users?limit=20', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data?.message || 'Không thể tải danh sách người dùng.')
        }

        setUsers(Array.isArray(data?.data) ? data.data : [])
      } catch (error_) {
        setError(error_.message || 'Có lỗi xảy ra khi tải danh sách người dùng.')
      } finally {
        setLoading(false)
      }
    }

    loadUsers()
  }, [setScreen])

  const loadCatalog = async () => {
    const token = localStorage.getItem('spotify_token')

    if (!token) {
      setScreen('login')
      return
    }

    if (!['artists', 'songs', 'overview'].includes(adminView)) {
      return
    }

    setLoadingCatalog(true)

    try {
      const [artistsResponse, songsResponse] = await Promise.all([
        fetch('/api/artists?limit=50', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/songs?limit=50', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      const artistsData = await artistsResponse.json()
      const songsData = await songsResponse.json()

      if (!artistsResponse.ok) {
        throw new Error(artistsData?.message || 'Không thể tải danh sách nghệ sĩ.')
      }

      if (!songsResponse.ok) {
        throw new Error(songsData?.message || 'Không thể tải danh sách bài hát.')
      }

      setArtists(Array.isArray(artistsData?.data) ? artistsData.data : [])
      setSongs(Array.isArray(songsData?.data) ? songsData.data : [])
    } catch (error_) {
      setError(error_.message || 'Có lỗi xảy ra khi tải danh mục admin.')
    } finally {
      setLoadingCatalog(false)
    }
  }

  useEffect(() => {
    loadCatalog()
  }, [adminView, setScreen])

  const handleRoleChange = async (userId, nextRole) => {
    const token = localStorage.getItem('spotify_token')

    if (!token) {
      setScreen('login')
      return
    }

    setActionLoadingId(userId)
    setError('')

    try {
      const response = await fetch(`/api/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: nextRole }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.message || 'Không thể cập nhật quyền người dùng.')
      }

      const updatedUser = data?.data || null
      setUsers((previous) => previous.map((user) => {
        if (user.id !== userId) {
          return user
        }

        return {
          ...user,
          role: updatedUser?.role || nextRole,
        }
      }))
    } catch (error_) {
      setError(error_.message || 'Có lỗi xảy ra khi cập nhật quyền.')
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleDeleteUser = async (userId) => {
    const token = localStorage.getItem('spotify_token')

    if (!token) {
      setScreen('login')
      return
    }

    const shouldDelete = window.confirm('Bạn có chắc muốn xóa tài khoản này?')

    if (!shouldDelete) {
      return
    }

    setActionLoadingId(userId)
    setError('')

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.message || 'Không thể xóa tài khoản.')
      }

      setUsers((previous) => previous.filter((user) => user.id !== userId))
    } catch (error_) {
      setError(error_.message || 'Có lỗi xảy ra khi xóa tài khoản.')
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleArtistSubmit = async (event) => {
    event.preventDefault()

    const token = localStorage.getItem('spotify_token')

    if (!token) {
      setScreen('login')
      return
    }

    const trimmedName = artistForm.name.trim()

    if (!trimmedName) {
      setError('Tên nghệ sĩ không được để trống.')
      return
    }

    try {
      const endpoint = editingArtistId ? `/api/artists/${editingArtistId}` : '/api/artists'
      const method = editingArtistId ? 'PATCH' : 'POST'

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: trimmedName }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.message || 'Không thể lưu nghệ sĩ.')
      }

      const freshArtist = data?.data || data
      const nextArtists = editingArtistId
        ? artists.map((artist) => (artist.id === editingArtistId ? { ...artist, ...freshArtist } : artist))
        : [freshArtist, ...artists]

      setArtists(nextArtists)
      setArtistForm(defaultArtistForm)
      setEditingArtistId(null)
      setError('')
    } catch (error_) {
      setError(error_.message || 'Có lỗi xảy ra khi lưu nghệ sĩ.')
    }
  }

  const handleSongFileUpload = async (file, customTitle) => {
    if (!file) {
      return
    }

    const token = localStorage.getItem('spotify_token')

    if (!token) {
      setScreen('login')
      return
    }

    if (!file.type.startsWith('audio/')) {
      setError('Chỉ hỗ trợ các file audio hợp lệ.')
      return
    }

    setSongUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const resolvedTitle = (customTitle || file.name || '').trim()
      if (resolvedTitle) {
        formData.append('title', resolvedTitle)
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data?.message || 'Không thể upload bài hát lên server.')
      }

      const uploadedObjectKey = data?.data?.objectKey || ''
      const uploadedDuration = Number(data?.data?.durationSeconds || 0)

      setSongForm((previous) => ({
        ...previous,
        title: previous.title || resolvedTitle || file.name.replace(/\.[^/.]+$/, ''),
        audioUrl: uploadedObjectKey ? `uploaded:${uploadedObjectKey}` : previous.audioUrl,
        durationSeconds: uploadedDuration > 0 ? String(uploadedDuration) : previous.durationSeconds,
      }))

      setSongUploadFile(file)
      await loadCatalog()
      setError('')
    } catch (error_) {
      setError(error_?.message || 'Có lỗi xảy ra khi upload bài hát.')
    } finally {
      setSongUploading(false)
    }
  }

  const handleSongCoverSelect = async (event) => {
    const selectedFile = event.target.files?.[0]

    if (!selectedFile) {
      setSongCoverFile(null)
      return
    }

    if (!selectedFile.type.startsWith('image/')) {
      setError('Chỉ hỗ trợ file ảnh cho bìa bài hát.')
      setSongCoverFile(null)
      event.target.value = ''
      return
    }

    const reader = new FileReader()

    reader.onload = () => {
      const dataUrl = String(reader.result || '')
      setSongForm((previous) => ({
        ...previous,
        coverUrl: dataUrl,
      }))
      setSongCoverFile(selectedFile)
      setError('')
    }

    reader.onerror = () => {
      setError('Không thể đọc file ảnh bìa.')
      setSongCoverFile(null)
    }

    reader.readAsDataURL(selectedFile)
  }

  const handleSongSubmit = async (event) => {
    event.preventDefault()

    const token = localStorage.getItem('spotify_token')

    if (!token) {
      setScreen('login')
      return
    }

    const trimmedTitle = songForm.title.trim()
    const trimmedAudioUrl = songForm.audioUrl.trim()
    const trimmedCoverUrl = songForm.coverUrl.trim()
    const durationSeconds = Number(songForm.durationSeconds)

    if (!trimmedTitle) {
      setError('Tên bài hát không được để trống.')
      return
    }

    if (!trimmedAudioUrl) {
      setError('URL audio hoặc file audio không được để trống.')
      return
    }

    if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
      setError('Thời lượng phải là số dương.')
      return
    }

    try {
      const endpoint = editingSongId ? `/api/songs/${editingSongId}` : '/api/songs'
      const method = editingSongId ? 'PATCH' : 'POST'
      const payload = {
        title: trimmedTitle,
        audioUrl: trimmedAudioUrl,
        coverUrl: trimmedCoverUrl || null,
        durationSeconds,
        artistIds: songForm.artistIds,
      }

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.message || 'Không thể lưu bài hát.')
      }

      const freshSong = data?.data || data
      const nextSongs = editingSongId
        ? songs.map((song) => (song.id === editingSongId ? { ...song, ...freshSong } : song))
        : [freshSong, ...songs]

      setSongs(nextSongs)
      setSongForm(defaultSongForm)
      setEditingSongId(null)
      setSongUploadFile(null)
      setSongCoverFile(null)
      setError('')
    } catch (error_) {
      setError(error_.message || 'Có lỗi xảy ra khi lưu bài hát.')
    }
  }

  const handleDeleteArtist = async (artistId) => {
    const token = localStorage.getItem('spotify_token')

    if (!token) {
      setScreen('login')
      return
    }

    const shouldDelete = window.confirm('Bạn có chắc muốn xóa nghệ sĩ này?')
    if (!shouldDelete) {
      return
    }

    try {
      const response = await fetch(`/api/artists/${artistId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.message || 'Không thể xóa nghệ sĩ.')
      }

      setArtists((previous) => previous.filter((artist) => artist.id !== artistId))
      setError('')
    } catch (error_) {
      setError(error_.message || 'Có lỗi xảy ra khi xóa nghệ sĩ.')
    }
  }

  const handleDeleteSong = async (songId) => {
    const token = localStorage.getItem('spotify_token')

    if (!token) {
      setScreen('login')
      return
    }

    const shouldDelete = window.confirm('Bạn có chắc muốn xóa bài hát này?')
    if (!shouldDelete) {
      return
    }

    try {
      const response = await fetch(`/api/songs/${songId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.message || 'Không thể xóa bài hát.')
      }

      setSongs((previous) => previous.filter((song) => song.id !== songId))
      setError('')
    } catch (error_) {
      setError(error_.message || 'Có lỗi xảy ra khi xóa bài hát.')
    }
  }

  const startEditArtist = (artist) => {
    setArtistForm({ name: artist.name || '' })
    setEditingArtistId(artist.id)
    setAdminView('artists')
  }

  const startEditSong = (song) => {
    setSongForm({
      title: song.title || '',
      audioUrl: song.audio_url || song.audioUrl || '',
      coverUrl: song.cover_url || song.coverUrl || '',
      durationSeconds: song.duration_seconds || song.durationSeconds || '',
      artistIds: Array.isArray(song.artists) ? song.artists.map((artist) => artist.id) : [],
    })
    setSongCoverFile(null)
    setEditingSongId(song.id)
    setAdminView('songs')
  }

  const handleArtistSelection = (artistId) => {
    setSongForm((previous) => {
      const exists = previous.artistIds.includes(artistId)
      return {
        ...previous,
        artistIds: exists
          ? previous.artistIds.filter((id) => id !== artistId)
          : [...previous.artistIds, artistId],
      }
    })
  }

  const adminCount = users.filter((user) => user.role === 'admin').length
  const listenerCount = users.filter((user) => user.role === 'listener').length
  const songCoverPreview = songForm.coverUrl
    ? `url(${songForm.coverUrl})`
    : 'linear-gradient(135deg, rgba(29, 185, 84, 0.52), rgba(12, 37, 25, 0.92))'

  return (
    <div className="home-page">
      <aside className="sidebar">
        <div className="brand-row">
          <SpotifyIcon />
          <span>Spotify</span>
        </div>

        <nav className="nav-menu" aria-label="Menu quản trị">
          <button type="button" className={`nav-link ${adminView === 'overview' ? 'active' : ''}`} onClick={() => setAdminView('overview')}>Tổng quan</button>
          <button type="button" className={`nav-link ${adminView === 'users' ? 'active' : ''}`} onClick={() => setAdminView('users')}>Người dùng</button>
          <button type="button" className={`nav-link ${adminView === 'artists' ? 'active' : ''}`} onClick={() => setAdminView('artists')}>Nghệ sĩ</button>
          <button type="button" className={`nav-link ${adminView === 'songs' ? 'active' : ''}`} onClick={() => setAdminView('songs')}>Bài hát</button>
          <button type="button" className={`nav-link ${adminView === 'settings' ? 'active' : ''}`} onClick={() => setAdminView('settings')}>Cài đặt</button>
        </nav>

      </aside>

      <main className="content-panel">
        <header className="topbar">
          <div>
            <p className="greeting">Quản trị</p>
            <h2>Trang quản lý</h2>
          </div>
          <div className="topbar-actions">
            <button type="button" className="logout-button" onClick={handleLogout}>Đăng xuất</button>
            <button type="button" className="profile-button">{(username || 'A').charAt(0).toUpperCase()}</button>
          </div>
        </header>

        <section className="admin-panel">
          {adminView === 'overview' ? (
            <>
              <div className="admin-summary-grid">
                <div className="admin-summary-card">
                  <span>Tổng người dùng</span>
                  <strong>{users.length}</strong>
                </div>
                <div className="admin-summary-card">
                  <span>Admin</span>
                  <strong>{adminCount}</strong>
                </div>
                <div className="admin-summary-card">
                  <span>Listener</span>
                  <strong>{listenerCount}</strong>
                </div>
              </div>

              <div className="admin-table-wrap">
                <div className="admin-table-header">
                  <h3>Hoạt động nhanh</h3>
                </div>
                <div className="admin-quick-actions">
                  <button type="button" className="primary-button" onClick={() => setAdminView('users')}>Quản lý người dùng</button>
                  <button type="button" className="primary-button" onClick={() => setAdminView('artists')}>Quản lý nghệ sĩ</button>
                  <button type="button" className="primary-button" onClick={() => setAdminView('songs')}>Quản lý bài hát</button>
                </div>
              </div>
            </>
          ) : null}

          {adminView === 'users' ? (
            <div className="admin-table-wrap">
              <div className="admin-table-header">
                <h3>Danh sách người dùng</h3>
              </div>

              {error ? <p className="form-error admin-error">{error}</p> : null}

              {loading ? (
                <div className="empty-state"><p>Đang tải dữ liệu...</p></div>
              ) : users.length === 0 ? (
                <div className="empty-state"><p>Không có người dùng nào.</p></div>
              ) : (
                <div className="admin-table">
                  {users.map((user) => (
                    <div key={user.id} className="admin-row">
                      <div className="admin-user-meta">
                        <div className="admin-avatar">{(user.username || 'U').charAt(0).toUpperCase()}</div>
                        <div>
                          <strong>{user.username || 'Người dùng'}</strong>
                          <small>{user.email || '—'}</small>
                        </div>
                      </div>

                      <span className={`admin-role-badge ${user.role === 'admin' ? 'admin' : 'listener'}`}>
                        {user.role === 'admin' ? 'Admin' : 'Listener'}
                      </span>

                      <div className="admin-actions">
                        {user.role === 'admin' ? (
                          <button type="button" className="logout-button small-button" onClick={() => handleRoleChange(user.id, 'listener')} disabled={actionLoadingId === user.id}>
                            {actionLoadingId === user.id ? '...' : 'Hạ quyền'}
                          </button>
                        ) : (
                          <button type="button" className="primary-button small-button" onClick={() => handleRoleChange(user.id, 'admin')} disabled={actionLoadingId === user.id}>
                            {actionLoadingId === user.id ? '...' : 'Nâng quyền'}
                          </button>
                        )}

                        <button type="button" className="playlist-delete-button small-button" onClick={() => handleDeleteUser(user.id)} disabled={actionLoadingId === user.id}>
                          {actionLoadingId === user.id ? '...' : 'Xóa'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}

          {adminView === 'artists' ? (
            <div className="admin-table-wrap">
              <div className="admin-table-header">
                <h3>{editingArtistId ? 'Cập nhật nghệ sĩ' : 'Thêm nghệ sĩ mới'}</h3>
              </div>

              {error ? <p className="form-error admin-error">{error}</p> : null}

              <form className="admin-form" onSubmit={handleArtistSubmit}>
                <label className="field-label">
                  <span>Tên nghệ sĩ</span>
                  <input
                    type="text"
                    value={artistForm.name}
                    onChange={(event) => setArtistForm({ ...artistForm, name: event.target.value })}
                    placeholder="Nhập tên nghệ sĩ"
                  />
                </label>

                <div className="admin-form-actions">
                  <button type="submit" className="primary-button">{editingArtistId ? 'Lưu thay đổi' : 'Thêm nghệ sĩ'}</button>
                  {editingArtistId ? (
                    <button type="button" className="logout-button" onClick={() => { setEditingArtistId(null); setArtistForm(defaultArtistForm) }}>
                      Hủy
                    </button>
                  ) : null}
                </div>
              </form>

              {loadingCatalog ? (
                <div className="empty-state"><p>Đang tải danh sách nghệ sĩ...</p></div>
              ) : (
                <div className="admin-table">
                  {artists.map((artist) => (
                    <div key={artist.id} className="admin-row admin-row-compact">
                      <div className="admin-user-meta">
                        <div className="admin-avatar">{(artist.name || 'A').charAt(0).toUpperCase()}</div>
                        <div>
                          <strong>{artist.name || 'Nghệ sĩ'}</strong>
                        </div>
                      </div>

                      <div className="admin-actions">
                        <button type="button" className="primary-button small-button" onClick={() => startEditArtist(artist)}>Sửa</button>
                        <button type="button" className="playlist-delete-button small-button" onClick={() => handleDeleteArtist(artist.id)}>Xóa</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}

          {adminView === 'songs' ? (
            <div className="admin-table-wrap">
              <div className="admin-table-header">
                <h3>{editingSongId ? 'Cập nhật bài hát' : 'Thêm bài hát mới'}</h3>
              </div>

              {error ? <p className="form-error admin-error">{error}</p> : null}

              <form className="admin-form song-form-shell" onSubmit={handleSongSubmit}>
                <div className="song-form-layout">
                  <div className="song-form-main">
                    <label className="field-label">
                      <span>File audio từ máy</span>
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={async (event) => {
                          const selectedFile = event.target.files?.[0]

                          if (!selectedFile) {
                            setSongUploadFile(null)
                            return
                          }

                          if (!songForm.title.trim()) {
                            const fileNameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, '')
                            setSongForm((previous) => ({ ...previous, title: fileNameWithoutExt }))
                          }

                          await handleSongFileUpload(selectedFile, songForm.title || selectedFile.name)
                        }}
                      />
                      {songUploadFile ? (
                        <small className="helper-text success-text">
                          Đã upload: {songUploadFile.name}
                        </small>
                      ) : (
                        <small className="helper-text">
                          Chỉ cần chọn file là backend sẽ xử lý phần audio và thời lượng cho bạn.
                        </small>
                      )}
                    </label>

                    <label className="field-label">
                      <span>Tên bài hát</span>
                      <input type="text" value={songForm.title} onChange={(event) => setSongForm({ ...songForm, title: event.target.value })} placeholder="Nhập tên bài hát nếu muốn đổi" />
                    </label>

                    <div className="admin-artist-picker">
                      <span>Chọn nghệ sĩ</span>
                      <div className="artist-picker-list">
                        {artists.map((artist) => (
                          <label
                            key={artist.id}
                            className={`artist-picker-item ${songForm.artistIds.includes(artist.id) ? 'selected' : ''}`}
                          >
                            <input
                              type="checkbox"
                              checked={songForm.artistIds.includes(artist.id)}
                              onChange={() => handleArtistSelection(artist.id)}
                            />
                            <span>{artist.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="song-form-side">
                    <div className="cover-upload-card">
                      <div className="cover-preview" style={{ backgroundImage: songCoverPreview }} />
                      <div className="cover-upload-info">
                        <span>Ảnh bìa</span>
                        <strong>{songCoverFile ? songCoverFile.name : 'Chưa có ảnh'}</strong>
                      </div>
                    </div>

                    <label className="field-label upload-field">
                      <span>Tải ảnh bìa</span>
                      <input type="file" accept="image/*" onChange={handleSongCoverSelect} />
                      {songCoverFile ? (
                        <small className="helper-text success-text">
                          Đã chọn ảnh bìa: {songCoverFile.name}
                        </small>
                      ) : songForm.coverUrl ? (
                        <small className="helper-text">
                          Ảnh bìa hiện có đã được giữ lại.
                        </small>
                      ) : (
                        <small className="helper-text">
                          Chọn ảnh bìa từ máy để lưu trực tiếp trong bài hát.
                        </small>
                      )}
                    </label>
                  </div>
                </div>

                <div className="admin-form-actions">
                  <button type="submit" className="primary-button" disabled={songUploading}>
                    {songUploading ? 'Đang upload...' : 'Hoàn tất'}
                  </button>
                  {editingSongId ? (
                    <button type="button" className="logout-button" onClick={() => { setEditingSongId(null); setSongForm(defaultSongForm); setSongUploadFile(null); setSongCoverFile(null) }}>
                      Hủy
                    </button>
                  ) : null}
                </div>
              </form>

              {loadingCatalog ? (
                <div className="empty-state"><p>Đang tải danh sách bài hát...</p></div>
              ) : (
                <div className="admin-table">
                  {songs.map((song) => (
                    <div key={song.id} className="admin-row admin-row-song">
                      <div className="admin-user-meta">
                        <div className="admin-avatar">{(song.title || 'S').charAt(0).toUpperCase()}</div>
                        <div>
                          <strong>{song.title || 'Bài hát'}</strong>
                          <small>{song.audio_url || song.audioUrl || '—'}</small>
                        </div>
                      </div>

                      <div className="admin-song-meta">
                        <span>{song.duration_seconds || song.durationSeconds || 0}s</span>
                        <small>{Array.isArray(song.artists) ? song.artists.map((artist) => artist.name).join(', ') : 'Không có nghệ sĩ'}</small>
                      </div>

                      <div className="admin-actions">
                        <button type="button" className="primary-button small-button" onClick={() => startEditSong(song)}>Sửa</button>
                        <button type="button" className="playlist-delete-button small-button" onClick={() => handleDeleteSong(song.id)}>Xóa</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}

          {adminView === 'settings' ? (
            <div className="admin-table-wrap">
              <div className="admin-table-header">
                <h3>Cài đặt hệ thống</h3>
              </div>
              <div className="admin-settings-list">
                <div className="admin-setting-item"><span>Chế độ bảo mật</span><strong>Admin mode</strong></div>
                <div className="admin-setting-item"><span>Quản lý quyền</span><strong>Đang hoạt động</strong></div>
                <div className="admin-setting-item"><span>Quản lý nghệ sĩ</span><strong>Đã bind backend</strong></div>
                <div className="admin-setting-item"><span>Quản lý bài hát</span><strong>Đã bind backend</strong></div>
              </div>
            </div>
          ) : null}
        </section>
      </main>
    </div>
  )
}

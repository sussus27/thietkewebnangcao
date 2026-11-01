import { useEffect, useRef, useState } from 'react'
import './App.css'
import { AdminPage } from './pages/AdminPage'
import { AuthPage } from './pages/AuthPage'
import { ArtistDetailPage } from './pages/ArtistDetailPage'
import { ArtistPage } from './pages/ArtistPage'
import { HomePage } from './pages/HomePage'
import { PlaylistDetailPage } from './pages/PlaylistDetailPage'
import { PlaylistPage } from './pages/PlaylistPage'
import { ProfilePage } from './pages/ProfilePage'
import { SearchPage } from './pages/SearchPage'

function decodeJwtRole(token) {
  if (!token) {
    return 'listener'
  }

  try {
    const payload = token.split('.')[1]
    if (!payload) {
      return 'listener'
    }

    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=')
    const decoded = JSON.parse(atob(padded))
    return decoded?.role || 'listener'
  } catch (error) {
    return 'listener'
  }
}

function App() {
  const [screen, setScreen] = useState(() => {
    const savedToken = localStorage.getItem('spotify_token')
    const savedScreen = localStorage.getItem('spotify_screen')
    const savedRole = localStorage.getItem('spotify_role') || decodeJwtRole(savedToken)
    const validScreens = ['home', 'search', 'playlist', 'playlist-detail', 'artist', 'artist-detail', 'profile', 'admin']

    if (savedToken && savedScreen && validScreens.includes(savedScreen)) {
      if (savedScreen === 'admin' && savedRole !== 'admin') {
        return 'home'
      }

      return savedScreen
    }

    if (savedToken) {
      return savedRole === 'admin' ? 'admin' : 'home'
    }

    return 'login'
  })

  const [username, setUsername] = useState(localStorage.getItem('spotify_username') || '')

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  const [signupName, setSignupName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [signupError, setSignupError] = useState('')
  const [signupLoading, setSignupLoading] = useState(false)

  const [searchQuery, setSearchQuery] = useState('')
  const [searchArtistId, setSearchArtistId] = useState('')
  const [searchOrder, setSearchOrder] = useState('desc')
  const [searchPage, setSearchPage] = useState(1)
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [searchPagination, setSearchPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  })

  const [currentTrack, setCurrentTrack] = useState(null)
  const [playQueue, setPlayQueue] = useState([])
  const [currentTrackIndex, setCurrentTrackIndex] = useState(-1)
  const [isShuffle, setIsShuffle] = useState(false)
  const [isRepeat, setIsRepeat] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef(null)

  const [playlists, setPlaylists] = useState([])
  const [playlistLoading, setPlaylistLoading] = useState(false)
  const [playlistError, setPlaylistError] = useState('')
  const [selectedPlaylist, setSelectedPlaylist] = useState(null)
  const [playlistDetail, setPlaylistDetail] = useState(null)
  const [playlistDetailLoading, setPlaylistDetailLoading] = useState(false)
  const [playlistDetailError, setPlaylistDetailError] = useState('')
  const [playlistFormOpen, setPlaylistFormOpen] = useState(false)
  const [playlistForm, setPlaylistForm] = useState({ name: '', description: '' })
  const [playlistSubmitting, setPlaylistSubmitting] = useState(false)
  const [playlistActionLoadingId, setPlaylistActionLoadingId] = useState(null)
  const [playlistSongActionLoadingId, setPlaylistSongActionLoadingId] = useState(null)

  const [homeSongs, setHomeSongs] = useState([])
  const [homePlaylists, setHomePlaylists] = useState([])
  const [homeLoading, setHomeLoading] = useState(false)
  const [homeError, setHomeError] = useState('')

  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [profileForm, setProfileForm] = useState({ username: '', email: '' })
  const [profileSaving, setProfileSaving] = useState(false)

  const [artists, setArtists] = useState([])
  const [artistLoading, setArtistLoading] = useState(false)
  const [artistError, setArtistError] = useState('')
  const [selectedArtist, setSelectedArtist] = useState(null)
  const [artistDetail, setArtistDetail] = useState(null)
  const [artistDetailLoading, setArtistDetailLoading] = useState(false)
  const [artistDetailError, setArtistDetailError] = useState('')

  useEffect(() => {
    if (localStorage.getItem('spotify_token')) {
      localStorage.setItem('spotify_screen', screen)
      return
    }

    localStorage.removeItem('spotify_screen')
  }, [screen])

  const handleLogout = () => {
    localStorage.removeItem('spotify_token')
    localStorage.removeItem('spotify_username')
    localStorage.removeItem('spotify_role')
    localStorage.removeItem('spotify_screen')
    setUsername('')
    setCurrentTrack(null)
    setPlayQueue([])
    setCurrentTrackIndex(-1)
    setIsPlaying(false)
    setProgress(0)
    setDuration(0)
    setLoginEmail('')
    setLoginPassword('')
    setLoginError('')
    setSignupName('')
    setSignupEmail('')
    setSignupPassword('')
    setSignupError('')
    setScreen('login')
  }

  const handleSearch = async (event, nextPage = 1) => {
    if (event) {
      event.preventDefault()
    }

    const trimmedQuery = searchQuery.trim()
    const params = new URLSearchParams()

    if (trimmedQuery) {
      params.set('q', trimmedQuery)
    }

    if (searchArtistId) {
      params.set('artistId', String(searchArtistId))
    }

    params.set('order', searchOrder)
    params.set('limit', '12')
    params.set('page', String(nextPage))

    setSearchLoading(true)
    setSearchError('')
    setSearchPage(nextPage)

    try {
      const response = await fetch(`/api/songs?${params.toString()}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.message || 'Không thể tải kết quả tìm kiếm.')
      }

      const nextResults = Array.isArray(data?.data) ? data.data : []
      const nextPagination = data?.pagination || {
        page: nextPage,
        limit: 12,
        total: 0,
        totalPages: 0,
      }

      setSearchResults(nextResults)
      setSearchPagination(nextPagination)
    } catch (error_) {
      setSearchError(error_.message || 'Có lỗi xảy ra khi tìm kiếm.')
      setSearchResults([])
      setSearchPagination({ page: nextPage, limit: 12, total: 0, totalPages: 0 })
    } finally {
      setSearchLoading(false)
    }
  }

  const fetchPlaylists = async () => {
    const token = localStorage.getItem('spotify_token')

    if (!token) {
      setScreen('login')
      return
    }

    setPlaylistLoading(true)
    setPlaylistError('')

    try {
      const response = await fetch('/api/playlists', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.message || 'Không thể tải playlist.')
      }

      const nextPlaylists = Array.isArray(data?.data) ? data.data : []
      setPlaylists(nextPlaylists)
    } catch (error_) {
      setPlaylistError(error_.message || 'Có lỗi xảy ra khi tải playlist.')
      setPlaylists([])
    } finally {
      setPlaylistLoading(false)
    }
  }

  const fetchArtists = async () => {
    setArtistLoading(true)
    setArtistError('')

    try {
      const response = await fetch('/api/artists')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.message || 'Không thể tải danh sách nghệ sĩ.')
      }

      const nextArtists = Array.isArray(data?.data) ? data.data : []
      setArtists(nextArtists)
    } catch (error_) {
      setArtistError(error_.message || 'Có lỗi xảy ra khi tải nghệ sĩ.')
      setArtists([])
    } finally {
      setArtistLoading(false)
    }
  }

  const handleOpenArtistDetail = async (artist) => {
    setSelectedArtist(artist)
    setArtistDetail(null)
    setArtistDetailError('')
    setArtistDetailLoading(true)
    setScreen('artist-detail')

    try {
      const response = await fetch(`/api/artists/${artist.id}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.message || 'Không thể tải chi tiết nghệ sĩ.')
      }

      const nextArtistDetail = data?.data || {}
      setArtistDetail(nextArtistDetail)
    } catch (error_) {
      setArtistDetailError(error_.message || 'Có lỗi xảy ra khi tải chi tiết nghệ sĩ.')
      setArtistDetail(null)
    } finally {
      setArtistDetailLoading(false)
    }
  }

  const handleCreatePlaylist = async (event) => {
    event.preventDefault()

    const token = localStorage.getItem('spotify_token')
    const trimmedName = playlistForm.name.trim()
    const trimmedDescription = playlistForm.description.trim()

    if (!token) {
      setScreen('login')
      return
    }

    if (!trimmedName) {
      setPlaylistError('Vui lòng nhập tên playlist.')
      return
    }

    setPlaylistSubmitting(true)
    setPlaylistError('')

    try {
      const response = await fetch('/api/playlists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: trimmedName,
          description: trimmedDescription || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.message || 'Không thể tạo playlist.')
      }

      const createdPlaylist = data?.data || null
      setPlaylistForm({ name: '', description: '' })
      setPlaylistFormOpen(false)

      if (createdPlaylist?.id) {
        await handleOpenPlaylistDetail(createdPlaylist)
      } else {
        await fetchPlaylists()
      }
    } catch (error_) {
      setPlaylistError(error_.message || 'Có lỗi xảy ra khi tạo playlist.')
    } finally {
      setPlaylistSubmitting(false)
    }
  }

  const handleDeletePlaylist = async (playlistId) => {
    const token = localStorage.getItem('spotify_token')

    if (!token) {
      setScreen('login')
      return
    }

    setPlaylistActionLoadingId(playlistId)
    setPlaylistError('')

    try {
      const response = await fetch(`/api/playlists/${playlistId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.message || 'Không thể xóa playlist.')
      }

      if (selectedPlaylist?.id === playlistId) {
        setSelectedPlaylist(null)
        setPlaylistDetail(null)
        setPlaylistDetailError('')
      }

      setScreen('playlist')
      await fetchPlaylists()
    } catch (error_) {
      setPlaylistError(error_.message || 'Có lỗi xảy ra khi xóa playlist.')
    } finally {
      setPlaylistActionLoadingId(null)
    }
  }

  const handleDeleteSongFromPlaylist = async (songId) => {
    if (!selectedPlaylist?.id) return

    const token = localStorage.getItem('spotify_token')

    if (!token) {
      setScreen('login')
      return
    }

    setPlaylistSongActionLoadingId(songId)
    setPlaylistDetailError('')

    try {
      const response = await fetch(`/api/playlists/${selectedPlaylist.id}/songs/${songId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.message || 'Không thể xóa bài hát khỏi playlist.')
      }

      const nextPlaylistDetail = data?.data || null
      setPlaylistDetail(nextPlaylistDetail)
      await fetchPlaylists()
    } catch (error_) {
      setPlaylistDetailError(error_.message || 'Có lỗi xảy ra khi xóa bài hát.')
    } finally {
      setPlaylistSongActionLoadingId(null)
    }
  }

  const handleOpenPlaylistDetail = async (playlist) => {
    const token = localStorage.getItem('spotify_token')

    if (!token) {
      setScreen('login')
      return
    }

    setSelectedPlaylist(playlist)
    setPlaylistDetail(null)
    setPlaylistDetailError('')
    setPlaylistDetailLoading(true)
    setScreen('playlist-detail')

    try {
      const response = await fetch(`/api/playlists/${playlist.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.message || 'Không thể tải chi tiết playlist.')
      }

      const nextPlaylistDetail = data?.data || {}
      setPlaylistDetail(nextPlaylistDetail)
    } catch (error_) {
      setPlaylistDetailError(error_.message || 'Có lỗi xảy ra khi tải playlist.')
      setPlaylistDetail(null)
    } finally {
      setPlaylistDetailLoading(false)
    }
  }

  const handlePlayTrack = (song, queue = []) => {
    const nextQueue = Array.isArray(queue) ? queue : []
    setPlayQueue(nextQueue)
    const nextIndex = nextQueue.findIndex((item) => item.id === song.id)
    setCurrentTrackIndex(nextIndex >= 0 ? nextIndex : -1)
    setCurrentTrack(song)
    setProgress(0)
    setIsPlaying(true)
  }

  const handleMoveTrack = (direction) => {
    if (!playQueue.length) return

    let nextIndex = currentTrackIndex
    if (nextIndex < 0) {
      nextIndex = 0
    }

    if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * playQueue.length)
      nextIndex = randomIndex
    } else {
      nextIndex = (nextIndex + direction + playQueue.length) % playQueue.length
    }

    const nextTrack = playQueue[nextIndex]

    if (!nextTrack) return

    setCurrentTrackIndex(nextIndex)
    setCurrentTrack(nextTrack)
    setProgress(0)
    setIsPlaying(true)
  }

  const handleNextTrack = () => handleMoveTrack(1)
  const handlePreviousTrack = () => handleMoveTrack(-1)

  const handleTrackEnd = () => {
    if (isRepeat) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0
        audioRef.current.play().catch(() => setIsPlaying(false))
      }
      setProgress(0)
      setIsPlaying(true)
      return
    }

    if (playQueue.length > 1) {
      handleNextTrack()
      return
    }

    setIsPlaying(false)
    setProgress(0)
  }

  const handleTogglePlayback = () => {
    if (!currentTrack) return
    setIsPlaying((previous) => !previous)
  }

  const handleToggleShuffle = () => {
    setIsShuffle((previous) => !previous)
  }

  const handleToggleRepeat = () => {
    setIsRepeat((previous) => {
      const nextValue = !previous
      if (audioRef.current) {
        audioRef.current.loop = nextValue
      }
      return nextValue
    })
  }

  const handleSeek = (nextProgress) => {
    if (!audioRef.current) return
    audioRef.current.currentTime = nextProgress
    setProgress(nextProgress)
  }

  useEffect(() => {
    if (!audioRef.current) return

    const audio = audioRef.current

    if (!currentTrack) {
      audio.pause()
      audio.src = ''
      setIsPlaying(false)
      setProgress(0)
      return
    }

    const nextSrc = `/api/stream/${currentTrack.id}`
    if (audio.src !== window.location.origin + nextSrc) {
      audio.src = nextSrc
      audio.load()
      setProgress(0)
    }
  }, [currentTrack])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false))
    } else {
      audio.pause()
    }
  }, [isPlaying])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleLoaded = () => {
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0)
    }

    const handleTime = () => {
      setProgress(audio.currentTime || 0)
    }

    const handleEnded = () => {
      handleTrackEnd()
    }

    audio.loop = isRepeat
    audio.addEventListener('loadedmetadata', handleLoaded)
    audio.addEventListener('timeupdate', handleTime)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoaded)
      audio.removeEventListener('timeupdate', handleTime)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [isRepeat])

  useEffect(() => {
    if (screen !== 'home') return

    const loadHomeData = async () => {
      const token = localStorage.getItem('spotify_token')

      if (!token) {
        setScreen('login')
        return
      }

      setHomeLoading(true)
      setHomeError('')

      try {
        const [userResponse, songsResponse, playlistsResponse] = await Promise.all([
          fetch('/api/users/me', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch('/api/songs?limit=6'),
          fetch('/api/playlists?limit=4', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ])

        const userData = await userResponse.json()
        const songsData = await songsResponse.json()
        const playlistsData = await playlistsResponse.json()

        if (!userResponse.ok) {
          throw new Error(userData?.message || 'Không thể tải thông tin người dùng.')
        }

        if (!songsResponse.ok) {
          throw new Error(songsData?.message || 'Không thể tải danh sách bài hát.')
        }

        if (!playlistsResponse.ok) {
          throw new Error(playlistsData?.message || 'Không thể tải danh sách playlist.')
        }

        const nextUser = userData || {}
        const nextSongs = Array.isArray(songsData?.data) ? songsData.data : []
        const nextPlaylists = Array.isArray(playlistsData?.data) ? playlistsData.data : []

        setUsername(nextUser.username || localStorage.getItem('spotify_username') || '')
        if (nextUser.username) {
          localStorage.setItem('spotify_username', nextUser.username)
        }
        setHomeSongs(nextSongs)
        setHomePlaylists(nextPlaylists)
      } catch (error_) {
        setHomeError(error_.message || 'Có lỗi xảy ra khi tải trang chủ.')
        setHomeSongs([])
        setHomePlaylists([])
      } finally {
        setHomeLoading(false)
      }
    }

    loadHomeData()
  }, [screen])

  useEffect(() => {
    if (screen !== 'playlist') return
    fetchPlaylists()
  }, [screen])

  useEffect(() => {
    if (screen === 'search' || screen === 'artist') {
      fetchArtists()
    }
  }, [screen])

  useEffect(() => {
    if (screen !== 'profile') return

    const loadProfile = async () => {
      const token = localStorage.getItem('spotify_token')

      if (!token) {
        setScreen('login')
        return
      }

      setProfileLoading(true)
      setProfileError('')

      try {
        const response = await fetch('/api/users/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data?.message || 'Không thể tải hồ sơ người dùng.')
        }

        const nextProfile = data || {}
        setProfile(nextProfile)
        setProfileForm({
          username: nextProfile.username || '',
          email: nextProfile.email || '',
        })
      } catch (error_) {
        setProfileError(error_.message || 'Có lỗi xảy ra khi tải hồ sơ.')
      } finally {
        setProfileLoading(false)
      }
    }

    loadProfile()
  }, [screen])

  const isValidEmail = (value) => {
    const atIndex = value.indexOf('@')
    const dotIndex = value.lastIndexOf('.')
    return atIndex > 0 && dotIndex > atIndex + 1 && dotIndex < value.length - 1
  }

  const handleLogin = async (event, overrideCredentials) => {
    event?.preventDefault?.()

    const trimmedEmail = (overrideCredentials?.email ?? loginEmail).trim()
    const trimmedPassword = (overrideCredentials?.password ?? loginPassword).trim()

    if (!trimmedEmail) {
      setLoginError('Vui lòng nhập email.')
      return
    }

    if (!isValidEmail(trimmedEmail)) {
      setLoginError('Email không hợp lệ.')
      return
    }

    if (!trimmedPassword) {
      setLoginError('Vui lòng nhập mật khẩu.')
      return
    }

    setLoginLoading(true)
    setLoginError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: trimmedEmail,
          password: trimmedPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.message || 'Đăng nhập thất bại')
      }

      const nextUsername = data.username || trimmedEmail.split('@')[0]
      const role = decodeJwtRole(data.token)
      setUsername(nextUsername)
      localStorage.setItem('spotify_username', nextUsername)
      localStorage.setItem('spotify_role', role)
      if (data.token) {
        localStorage.setItem('spotify_token', data.token)
      }

      const nextScreen = role === 'admin' ? 'admin' : 'home'
      localStorage.setItem('spotify_screen', nextScreen)
      setScreen(nextScreen)
    } catch (error_) {
      setLoginError(error_.message || 'Có lỗi xảy ra khi đăng nhập.')
    } finally {
      setLoginLoading(false)
    }
  }

  const handleProfileSave = async (event) => {
    event.preventDefault()

    const token = localStorage.getItem('spotify_token')

    if (!token) {
      setScreen('login')
      return
    }

    const trimmedUsername = profileForm.username.trim()
    const trimmedEmail = profileForm.email.trim()

    if (!trimmedUsername) {
      setProfileError('Vui lòng nhập tên người dùng.')
      return
    }

    if (trimmedUsername.length < 3 || trimmedUsername.length > 100) {
      setProfileError('Tên người dùng phải có từ 3 đến 100 ký tự.')
      return
    }

    if (!trimmedEmail || !isValidEmail(trimmedEmail)) {
      setProfileError('Email không hợp lệ.')
      return
    }

    setProfileSaving(true)
    setProfileError('')

    try {
      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: trimmedUsername,
          email: trimmedEmail,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.message || 'Không thể cập nhật hồ sơ.')
      }

      const nextProfile = data || {}
      setProfile(nextProfile)
      setUsername(nextProfile.username || trimmedUsername)
      localStorage.setItem('spotify_username', nextProfile.username || trimmedUsername)
      setProfileForm({
        username: nextProfile.username || trimmedUsername,
        email: nextProfile.email || trimmedEmail,
      })
    } catch (error_) {
      setProfileError(error_.message || 'Có lỗi xảy ra khi cập nhật hồ sơ.')
    } finally {
      setProfileSaving(false)
    }
  }

  const handleSignup = async (event) => {
    event.preventDefault()

    const trimmedName = signupName.trim()
    const trimmedEmail = signupEmail.trim()
    const trimmedPassword = signupPassword.trim()

    if (!trimmedName) {
      setSignupError('Vui lòng nhập tên người dùng.')
      return
    }

    if (trimmedName.length < 3 || trimmedName.length > 100) {
      setSignupError('Tên người dùng phải có từ 3 đến 100 ký tự.')
      return
    }

    if (!trimmedEmail) {
      setSignupError('Vui lòng nhập email.')
      return
    }

    if (!isValidEmail(trimmedEmail)) {
      setSignupError('Email không hợp lệ.')
      return
    }

    if (!trimmedPassword) {
      setSignupError('Vui lòng nhập mật khẩu.')
      return
    }

    if (trimmedPassword.length < 8 || trimmedPassword.length > 72) {
      setSignupError('Mật khẩu phải có từ 8 đến 72 ký tự.')
      return
    }

    setSignupLoading(true)
    setSignupError('')

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: trimmedName,
          email: trimmedEmail,
          password: trimmedPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.message || 'Đăng ký thất bại')
      }

      setUsername(trimmedName)
      localStorage.setItem('spotify_username', trimmedName)
      const role = decodeJwtRole(data.token)
      localStorage.setItem('spotify_role', role)
      if (data.token) {
        localStorage.setItem('spotify_token', data.token)
      }
      localStorage.setItem('spotify_screen', 'home')
      setScreen('home')
    } catch (error_) {
      setSignupError(error_.message || 'Có lỗi xảy ra khi đăng ký.')
    } finally {
      setSignupLoading(false)
    }
  }

  if (screen === 'login' || screen === 'signup') {
    return (
      <AuthPage
        screen={screen}
        loginEmail={loginEmail}
        setLoginEmail={setLoginEmail}
        loginPassword={loginPassword}
        setLoginPassword={setLoginPassword}
        loginError={loginError}
        loginLoading={loginLoading}
        signupName={signupName}
        setSignupName={setSignupName}
        signupEmail={signupEmail}
        setSignupEmail={setSignupEmail}
        signupPassword={signupPassword}
        setSignupPassword={setSignupPassword}
        signupError={signupError}
        signupLoading={signupLoading}
        handleLogin={handleLogin}
        handleSignup={handleSignup}
        setScreen={setScreen}
        setLoginError={setLoginError}
        setSignupError={setSignupError}
      />
    )
  }

  if (screen === 'home') {
    return (
      <HomePage
        username={username}
        setScreen={setScreen}
        handleLogout={handleLogout}
        homeLoading={homeLoading}
        homeError={homeError}
        homeSongs={homeSongs}
        homePlaylists={homePlaylists}
        handlePlayTrack={handlePlayTrack}
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        progress={progress}
        duration={duration}
        isShuffle={isShuffle}
        isRepeat={isRepeat}
        handleTogglePlayback={handleTogglePlayback}
        handleSeek={handleSeek}
        handlePreviousTrack={handlePreviousTrack}
        handleNextTrack={handleNextTrack}
        handleToggleShuffle={handleToggleShuffle}
        handleToggleRepeat={handleToggleRepeat}
        audioRef={audioRef}
        setDuration={setDuration}
        setProgress={setProgress}
        handleTrackEnd={handleTrackEnd}
      />
    )
  }

  if (screen === 'admin') {
    return (
      <AdminPage
        username={username}
        setScreen={setScreen}
        handleLogout={handleLogout}
      />
    )
  }

  if (screen === 'search') {
    return (
      <SearchPage
        username={username}
        setScreen={setScreen}
        handleLogout={handleLogout}
        artists={artists}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchArtistId={searchArtistId}
        setSearchArtistId={setSearchArtistId}
        searchOrder={searchOrder}
        setSearchOrder={setSearchOrder}
        searchPage={searchPage}
        setSearchPage={setSearchPage}
        searchResults={searchResults}
        searchLoading={searchLoading}
        searchError={searchError}
        searchPagination={searchPagination}
        handleSearch={handleSearch}
        handlePlayTrack={handlePlayTrack}
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        progress={progress}
        duration={duration}
        isShuffle={isShuffle}
        isRepeat={isRepeat}
        handleTogglePlayback={handleTogglePlayback}
        handleSeek={handleSeek}
        handlePreviousTrack={handlePreviousTrack}
        handleNextTrack={handleNextTrack}
        handleToggleShuffle={handleToggleShuffle}
        handleToggleRepeat={handleToggleRepeat}
        audioRef={audioRef}
        setDuration={setDuration}
        setProgress={setProgress}
        handleTrackEnd={handleTrackEnd}
      />
    )
  }

  if (screen === 'playlist') {
    return (
      <PlaylistPage
        username={username}
        setScreen={setScreen}
        handleLogout={handleLogout}
        playlists={playlists}
        playlistLoading={playlistLoading}
        playlistError={playlistError}
        playlistFormOpen={playlistFormOpen}
        setPlaylistFormOpen={setPlaylistFormOpen}
        playlistForm={playlistForm}
        setPlaylistForm={setPlaylistForm}
        playlistSubmitting={playlistSubmitting}
        handleCreatePlaylist={handleCreatePlaylist}
        handleOpenPlaylistDetail={handleOpenPlaylistDetail}
        handleDeletePlaylist={handleDeletePlaylist}
        playlistActionLoadingId={playlistActionLoadingId}
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        progress={progress}
        duration={duration}
        isShuffle={isShuffle}
        isRepeat={isRepeat}
        handleTogglePlayback={handleTogglePlayback}
        handleSeek={handleSeek}
        handlePreviousTrack={handlePreviousTrack}
        handleNextTrack={handleNextTrack}
        handleToggleShuffle={handleToggleShuffle}
        handleToggleRepeat={handleToggleRepeat}
        audioRef={audioRef}
        setDuration={setDuration}
        setProgress={setProgress}
        handleTrackEnd={handleTrackEnd}
      />
    )
  }

  if (screen === 'playlist-detail') {
    return (
      <PlaylistDetailPage
        username={username}
        setScreen={setScreen}
        handleLogout={handleLogout}
        selectedPlaylist={selectedPlaylist}
        playlistDetail={playlistDetail}
        playlistDetailError={playlistDetailError}
        playlistDetailLoading={playlistDetailLoading}
        detailSongs={Array.isArray(playlistDetail?.songs) ? playlistDetail.songs : []}
        handleDeletePlaylist={handleDeletePlaylist}
        handleDeleteSongFromPlaylist={handleDeleteSongFromPlaylist}
        playlistActionLoadingId={playlistActionLoadingId}
        playlistSongActionLoadingId={playlistSongActionLoadingId}
        handlePlayTrack={handlePlayTrack}
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        progress={progress}
        duration={duration}
        isShuffle={isShuffle}
        isRepeat={isRepeat}
        handleTogglePlayback={handleTogglePlayback}
        handleSeek={handleSeek}
        handlePreviousTrack={handlePreviousTrack}
        handleNextTrack={handleNextTrack}
        handleToggleShuffle={handleToggleShuffle}
        handleToggleRepeat={handleToggleRepeat}
        audioRef={audioRef}
        setDuration={setDuration}
        setProgress={setProgress}
        handleTrackEnd={handleTrackEnd}
      />
    )
  }

  if (screen === 'artist') {
    return (
      <ArtistPage
        username={username}
        setScreen={setScreen}
        handleLogout={handleLogout}
        artists={artists}
        artistLoading={artistLoading}
        artistError={artistError}
        handleOpenArtistDetail={handleOpenArtistDetail}
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        progress={progress}
        duration={duration}
        isShuffle={isShuffle}
        isRepeat={isRepeat}
        handleTogglePlayback={handleTogglePlayback}
        handleSeek={handleSeek}
        handlePreviousTrack={handlePreviousTrack}
        handleNextTrack={handleNextTrack}
        handleToggleShuffle={handleToggleShuffle}
        handleToggleRepeat={handleToggleRepeat}
        audioRef={audioRef}
        setDuration={setDuration}
        setProgress={setProgress}
        handleTrackEnd={handleTrackEnd}
      />
    )
  }

  if (screen === 'artist-detail') {
    return (
      <ArtistDetailPage
        username={username}
        setScreen={setScreen}
        handleLogout={handleLogout}
        selectedArtist={selectedArtist}
        artistDetail={artistDetail}
        artistDetailError={artistDetailError}
        artistDetailLoading={artistDetailLoading}
        handlePlayTrack={handlePlayTrack}
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        progress={progress}
        duration={duration}
        isShuffle={isShuffle}
        isRepeat={isRepeat}
        handleTogglePlayback={handleTogglePlayback}
        handleSeek={handleSeek}
        handlePreviousTrack={handlePreviousTrack}
        handleNextTrack={handleNextTrack}
        handleToggleShuffle={handleToggleShuffle}
        handleToggleRepeat={handleToggleRepeat}
        audioRef={audioRef}
        setDuration={setDuration}
        setProgress={setProgress}
        handleTrackEnd={handleTrackEnd}
      />
    )
  }

  return (
    <ProfilePage
      username={username}
      setScreen={setScreen}
      handleLogout={handleLogout}
      profile={profile}
      profileLoading={profileLoading}
      profileError={profileError}
      profileForm={profileForm}
      setProfileForm={setProfileForm}
      profileSaving={profileSaving}
      handleProfileSave={handleProfileSave}
      currentTrack={currentTrack}
      isPlaying={isPlaying}
      progress={progress}
      duration={duration}
      isShuffle={isShuffle}
      isRepeat={isRepeat}
      handleTogglePlayback={handleTogglePlayback}
      handleSeek={handleSeek}
      handlePreviousTrack={handlePreviousTrack}
      handleNextTrack={handleNextTrack}
      handleToggleShuffle={handleToggleShuffle}
      handleToggleRepeat={handleToggleRepeat}
      audioRef={audioRef}
      setDuration={setDuration}
      setProgress={setProgress}
      handleTrackEnd={handleTrackEnd}
    />
  )
}

export default App

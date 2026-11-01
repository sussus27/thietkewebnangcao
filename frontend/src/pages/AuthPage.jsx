export function AuthPage({
  screen,
  loginEmail,
  setLoginEmail,
  loginPassword,
  setLoginPassword,
  loginError,
  loginLoading,
  signupName,
  setSignupName,
  signupEmail,
  setSignupEmail,
  signupPassword,
  setSignupPassword,
  signupError,
  signupLoading,
  handleLogin,
  handleSignup,
  setScreen,
  setLoginError,
  setSignupError,
}) {
  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="spotify-header">
          <svg className="spotify-icon" viewBox="0 0 24 24" aria-label="Spotify logo" role="img">
            <circle cx="12" cy="12" r="12" fill="#1db954" />
            <path
              d="M17.66 15.77c-.23-.14-.52-.13-.74.03-1.75 1.1-4.62 1.44-7.72 1.05-1.1-.14-1.94-.43-2.51-.73-.26-.14-.58-.05-.73.22-.14.27-.05.58.22.73.69.33 1.62.62 2.9.8 3.5.46 6.79-.04 9.05-1.44.23-.14.3-.44.18-.7-.12-.22-.36-.33-.65-.16Zm1.62-3.17c-.2-.15-.52-.12-.73.06-2.3 1.48-5.89 1.9-9.16 1.12-1.14-.28-2.15-.76-2.86-1.17-.31-.18-.7-.07-.89.25-.18.31-.06.71.25.89.85.48 2.02.9 3.4 1.23 3.96.9 8.06.3 10.93-1.53.25-.15.33-.47.13-.75-.13-.2-.43-.3-.7-.1Zm.35-3.39c-2.76-1.62-7.37-1.75-10.84-1.02-1.26.26-2.54.68-3.59 1.12-.35.17-.53.6-.36.97.17.37.6.54.96.37.9-.39 2.02-.72 3.31-.97 3.53-.71 7.8-.55 10.84 1.06.34.2.79.1 1-.24.21-.35.14-.8-.19-1.08Z"
              fill="#121212"
            />
          </svg>
        </div>

        <h1>{screen === 'login' ? 'Đăng nhập' : 'Đăng ký để bắt đầu nghe'}</h1>

        {screen === 'login' ? (
          <form className="signup-form" onSubmit={handleLogin} noValidate>
            <label className="field-label" htmlFor="email-input">
              <input
                id="email-input"
                type="email"
                value={loginEmail}
                onChange={(event) => {
                  setLoginEmail(event.target.value)
                  if (loginError) setLoginError('')
                }}
                placeholder="name@domain.com"
                aria-label="Email"
              />
            </label>

            <label className="field-label" htmlFor="password-input">
              <input
                id="password-input"
                type="password"
                value={loginPassword}
                onChange={(event) => {
                  setLoginPassword(event.target.value)
                  if (loginError) setLoginError('')
                }}
                placeholder="Mật khẩu"
                aria-label="Mật khẩu"
              />
            </label>

            {loginError ? <p className="form-error">{loginError}</p> : null}

            <button type="submit" className="primary-button" disabled={loginLoading}>
              {loginLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>

            <button
              type="button"
              className="secondary-link admin-login-link"
              onClick={() => handleLogin(null, { email: 'admin@example.com', password: 'admin123456' })}
            >
              Đăng nhập bằng tài khoản admin
            </button>

            <button type="button" className="secondary-link" onClick={() => { setScreen('signup'); setLoginError('') }}>
              Chưa có tài khoản? Đăng ký
            </button>
          </form>
        ) : (
          <form className="signup-form" onSubmit={handleSignup} noValidate>
            <label className="field-label" htmlFor="signup-name-input">
              <input
                id="signup-name-input"
                type="text"
                value={signupName}
                onChange={(event) => {
                  setSignupName(event.target.value)
                  if (signupError) setSignupError('')
                }}
                placeholder="Tên người dùng"
                aria-label="Tên người dùng"
              />
            </label>

            <label className="field-label" htmlFor="signup-email-input">
              <input
                id="signup-email-input"
                type="email"
                value={signupEmail}
                onChange={(event) => {
                  setSignupEmail(event.target.value)
                  if (signupError) setSignupError('')
                }}
                placeholder="name@domain.com"
                aria-label="Email"
              />
            </label>

            <label className="field-label" htmlFor="signup-password-input">
              <input
                id="signup-password-input"
                type="password"
                value={signupPassword}
                onChange={(event) => {
                  setSignupPassword(event.target.value)
                  if (signupError) setSignupError('')
                }}
                placeholder="Mật khẩu"
                aria-label="Mật khẩu"
              />
            </label>

            {signupError ? <p className="form-error">{signupError}</p> : null}

            <button type="submit" className="primary-button" disabled={signupLoading}>
              {signupLoading ? 'Đang đăng ký...' : 'Tiếp theo'}
            </button>

            <button type="button" className="secondary-link" onClick={() => { setScreen('login'); setSignupError('') }}>
              Đã có tài khoản? Đăng nhập
            </button>
          </form>
        )}
      </div>
    </main>
  )
}

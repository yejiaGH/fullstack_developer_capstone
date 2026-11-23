import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const login = async (event) => {
    event.preventDefault();
    setError('');
    setBusy(true);

    const loginUrl = window.location.origin + '/djangoapp/login';

    try {
      const res = await fetch(loginUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: userName,
          password: password
        })
      });

      const json = await res.json();

      if (json.status === 'Authenticated') {
        sessionStorage.setItem('username', json.userName);
        navigate('/dealers');
      } else {
        setError(json.error || 'The user could not be logged in.');
      }
    } catch (err) {
      setError('The user could not be logged in.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">Login</h1>
        <form className="login-form" onSubmit={login}>
          <label className="login-label" htmlFor="userName">
            Username
          </label>
          <input
            className="login-input"
            id="userName"
            name="userName"
            type="text"
            placeholder="Username"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            required
          />

          <label className="login-label" htmlFor="password">
            Password
          </label>
          <input
            className="login-input"
            id="password"
            name="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <p className="login-error" role="alert">
              {error}
            </p>
          )}

          <button className="login-button" type="submit" disabled={busy}>
            {busy ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="login-link">
          No account yet? <a href="/register">Register</a>
        </p>
      </div>
    </div>
  );
}

export default Login;

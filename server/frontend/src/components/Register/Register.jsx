import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';

function Register() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setlastName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const register = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);

    const registerUrl = window.location.origin + '/djangoapp/register';

    try {
      const res = await fetch(registerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: userName,
          password: password,
          firstName: firstName,
          lastName: lastName,
          email: email
        })
      });

      const json = await res.json();

      if (json.status) {
        sessionStorage.setItem('username', json.userName);
        navigate('/dealers');
      } else if (json.error === 'Already Registered') {
        setError('The user with same username is already registered');
      } else {
        setError(json.error || 'The user could not be registered.');
      }
    } catch (err) {
      setError('The user could not be registered.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <h1 className="register-title">Register</h1>
        <form className="register-form" onSubmit={register}>
          <label className="register-label" htmlFor="userName">
            Username
          </label>
          <input
            className="register-input"
            id="userName"
            name="userName"
            type="text"
            placeholder="Username"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            required
          />

          <label className="register-label" htmlFor="firstName">
            First Name
          </label>
          <input
            className="register-input"
            id="firstName"
            name="firstName"
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />

          <label className="register-label" htmlFor="lastName">
            Last Name
          </label>
          <input
            className="register-input"
            id="lastName"
            name="lastName"
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setlastName(e.target.value)}
            required
          />

          <label className="register-label" htmlFor="email">
            Email
          </label>
          <input
            className="register-input"
            id="email"
            name="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label className="register-label" htmlFor="password">
            Password
          </label>
          <input
            className="register-input"
            id="password"
            name="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <p className="register-error" role="alert">
              {error}
            </p>
          )}

          <button className="register-button" type="submit" disabled={busy}>
            {busy ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p className="register-link">
          Already have an account? <a href="/login">Login</a>
        </p>
      </div>
    </div>
  );
}

export default Register;

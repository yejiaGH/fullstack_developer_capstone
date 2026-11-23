import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Dealers.css';

function Dealers() {
  const [dealersList, setDealersList] = useState([]);
  const [originalDealers, setOriginalDealers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [states, setStates] = useState([]);
  const [error, setError] = useState('');
  const userName = sessionStorage.getItem('username');

  const getDealers = async () => {
    try {
      const res = await fetch('/djangoapp/get_dealers');
      const json = await res.json();
      const allDealers = json.dealers || [];
      setDealersList(allDealers);
      setOriginalDealers(allDealers);
      const uniqueStates = [...new Set(allDealers.map((d) => d.state))];
      setStates(uniqueStates.sort());
    } catch (err) {
      setError('Could not load the dealerships. Is the backend running?');
    }
  };

  useEffect(() => {
    getDealers();
  }, []);

  // Optional enhancement: a free text search over the state column.
  const handleInputChange = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    const filtered = originalDealers.filter((dealer) =>
      dealer.state.toLowerCase().includes(query.toLowerCase())
    );
    setDealersList(filtered);
  };

  const handleLostFocus = () => {
    if (!searchQuery) {
      setDealersList(originalDealers);
    }
  };

  const filterByState = async (event) => {
    const state = event.target.value;
    if (state === 'All') {
      setDealersList(originalDealers);
      return;
    }
    try {
      const res = await fetch('/djangoapp/get_dealers/' + state);
      const json = await res.json();
      setDealersList(json.dealers || []);
    } catch (err) {
      setError('Could not filter the dealerships.');
    }
  };

  const logout = async () => {
    const logoutUrl = window.location.origin + '/djangoapp/logout';
    const res = await fetch(logoutUrl, { method: 'GET' });
    const json = await res.json();
    if (json) {
      const username = sessionStorage.getItem('username');
      sessionStorage.removeItem('username');
      alert('Logging out ' + username + '...');
      window.location.href = window.location.origin;
      window.location.reload();
    } else {
      alert('The user could not be logged out.');
    }
  };

  return (
    <div className="dealers-page">
      <nav className="dealers-nav">
        <a className="nav-brand" href="/">
          Best Cars Dealership
        </a>
        <ul className="nav-links">
          <li>
            <a href="/about/">About Us</a>
          </li>
          <li>
            <a href="/contact/">Contact Us</a>
          </li>
          {userName ? (
            <>
              <li className="nav-user">Hello, {userName}</li>
              <li>
                <button className="nav-button" type="button" onClick={logout}>
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <a href="/login/">Login</a>
              </li>
              <li>
                <a href="/register/">Register</a>
              </li>
            </>
          )}
        </ul>
      </nav>

      <div className="dealers-panel">
        <h1 className="dealers-title">Dealerships</h1>
        {error && (
          <p className="dealers-error" role="alert">
            {error}
          </p>
        )}

        <div className="dealers-filters">
          <label htmlFor="state-select">Filter by state</label>
          <select
            id="state-select"
            defaultValue="All"
            onChange={filterByState}
          >
            <option value="All">-- All --</option>
            {states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>

          <label htmlFor="state-search">Search states</label>
          <input
            id="state-search"
            type="text"
            placeholder="Search states..."
            onChange={handleInputChange}
            onBlur={handleLostFocus}
            value={searchQuery}
          />
        </div>

        <table className="dealers-table">
          <thead>
            <tr>
              <th>Id</th>
              <th>Dealership</th>
              <th>State</th>
              <th>Reviews</th>
            </tr>
          </thead>
          <tbody>
            {dealersList.map((dealer) => (
              <tr key={dealer.id}>
                <td>{dealer.id}</td>
                <td>
                  <Link to={'/dealer/' + dealer.id}>{dealer.name}</Link>
                </td>
                <td>{dealer.state}</td>
                <td>
                  <Link
                    className="review_link"
                    to={'/dealer/' + dealer.id}
                  >
                    <span className="review_icon">&#9733;</span>
                  </Link>
                  {userName && (
                    <Link
                      className="review_link"
                      to={'/postreview/' + dealer.id}
                    >
                      <span className="review_icon">&#9998;</span>
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dealers;

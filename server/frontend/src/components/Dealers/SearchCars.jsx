import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import './SearchCars.css';

const MILEAGE_BUCKETS = [0, 50000, 100000, 150000, 200000];
const PRICE_BUCKETS = [0, 20000, 40000, 60000, 80000];

function SearchCars() {
  const { id } = useParams();
  const [cars, setCars] = useState([]);
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [years, setYears] = useState([]);
  const [dealer, setDealer] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const dealerUrl = `/djangoapp/get_inventory/${id}`;
  const fetchUrl = `/djangoapp/dealer/${id}`;

  const fetchCars = useCallback(async () => {
    try {
      const res = await fetch(dealerUrl);
      const json = await res.json();
      const allCars = json.cars || [];
      setCars(allCars);
      setMakes([...new Set(allCars.map((car) => car.make))].sort());
      setModels([...new Set(allCars.map((car) => car.model))].sort());
      setYears([...new Set(allCars.map((car) => car.year))].sort((a, b) => b - a));
    } catch (err) {
      setError('Could not load the inventory.');
    }
  }, [dealerUrl]);

  const fetchDealer = useCallback(async () => {
    try {
      const res = await fetch(fetchUrl);
      const json = await res.json();
      const found = json.dealer;
      setDealer(Array.isArray(found) ? found[0] : found);
    } catch (err) {
      setError('Could not load this dealership.');
    }
  }, [fetchUrl]);

  useEffect(() => {
    fetchCars();
    fetchDealer();
  }, [fetchCars, fetchDealer]);

  const applyFilter = async () => {
    setMessage('');
    const make = document.getElementById('make').value;
    const model = document.getElementById('model').value;
    const year = document.getElementById('year').value;
    const mileageIdx = document.getElementById('mileage').selectedIndex;
    const priceIdx = document.getElementById('price').selectedIndex;

    let url = dealerUrl;
    if (make) {
      url = dealerUrl + '?make=' + encodeURIComponent(make);
    } else if (model) {
      url = dealerUrl + '?model=' + encodeURIComponent(model);
    } else if (year) {
      url = dealerUrl + '?year=' + encodeURIComponent(year);
    } else if (mileageIdx !== 0) {
      const currmileage = parseInt(
        document.getElementById('mileage').value,
        10
      );
      url = dealerUrl + '?mileage=' + currmileage;
    } else if (priceIdx !== 0) {
      const currprice = parseInt(document.getElementById('price').value, 10);
      url = dealerUrl + '?price=' + currprice;
    }

    try {
      const res = await fetch(url);
      const json = await res.json();
      let filtered = json.cars || [];

      // Refine the result in the browser for every selected condition.
      if (make) {
        filtered = filtered.filter((car) => car.make === make);
      }
      if (model) {
        filtered = filtered.filter((car) => car.model === model);
      }
      if (year) {
        filtered = filtered.filter((car) => car.year >= parseInt(year, 10));
      }
      if (mileageIdx !== 0) {
        const currmileage = parseInt(
          document.getElementById('mileage').value,
          10
        );
        if (currmileage === 50000) {
          filtered = filtered.filter((car) => car.mileage <= currmileage);
        } else if (currmileage === 100000) {
          filtered = filtered.filter(
            (car) => car.mileage <= currmileage && car.mileage > 50000
          );
        } else if (currmileage === 150000) {
          filtered = filtered.filter(
            (car) => car.mileage <= currmileage && car.mileage > 100000
          );
        } else if (currmileage === 200000) {
          filtered = filtered.filter(
            (car) => car.mileage <= currmileage && car.mileage > 150000
          );
        } else {
          filtered = filtered.filter((car) => car.mileage > 200000);
        }
      }
      if (priceIdx !== 0) {
        const currprice = parseInt(document.getElementById('price').value, 10);
        if (currprice === 20000) {
          filtered = filtered.filter((car) => car.price <= currprice);
        } else if (currprice === 40000) {
          filtered = filtered.filter(
            (car) => car.price <= currprice && car.price > 20000
          );
        } else if (currprice === 60000) {
          filtered = filtered.filter(
            (car) => car.price <= currprice && car.price > 40000
          );
        } else if (currprice === 80000) {
          filtered = filtered.filter(
            (car) => car.price <= currprice && car.price > 60000
          );
        } else {
          filtered = filtered.filter((car) => car.price > 80000);
        }
      }

      setCars(filtered);
      if (filtered.length === 0) {
        setMessage('No cars found matching the selected criteria.');
      }
    } catch (err) {
      setError('Could not load the inventory.');
    }
  };

  const reset = async () => {
    document.getElementById('make').selectedIndex = 0;
    document.getElementById('model').selectedIndex = 0;
    document.getElementById('year').selectedIndex = 0;
    document.getElementById('mileage').selectedIndex = 0;
    document.getElementById('price').selectedIndex = 0;
    setMessage('');
    await fetchCars();
  };

  return (
    <div className="searchcars-page">
      <nav className="dealers-nav">
        <a className="nav-brand" href="/">
          Best Cars Dealership
        </a>
        <ul className="nav-links">
          <li>
            <Link to={'/dealer/' + id}>Back to reviews</Link>
          </li>
        </ul>
      </nav>

      <div className="searchcars-panel">
        <h1 className="searchcars-title">
          {dealer ? dealer.name : 'Inventory'} - Search Cars
        </h1>

        {error && (
          <p className="dealers-error" role="alert">
            {error}
          </p>
        )}

        <div className="searchcars-filters">
          <label htmlFor="make">Make</label>
          <select
            id="make"
            defaultValue=""
            onChange={applyFilter}
          >
            <option value="">-- All --</option>
            {makes.map((make) => (
              <option key={make} value={make}>
                {make}
              </option>
            ))}
          </select>

          <label htmlFor="model">Model</label>
          <select
            id="model"
            defaultValue=""
            onChange={applyFilter}
          >
            <option value="">-- All --</option>
            {models.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>

          <label htmlFor="year">Year</label>
          <select
            id="year"
            defaultValue=""
            onChange={applyFilter}
          >
            <option value="">-- All --</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year} or newer
              </option>
            ))}
          </select>

          <label htmlFor="mileage">Mileage</label>
          <select
            id="mileage"
            defaultValue=""
            onChange={applyFilter}
          >
            <option value="">-- All --</option>
            {MILEAGE_BUCKETS.slice(1).map((value) => (
              <option key={value} value={value}>
                Under {value}
              </option>
            ))}
          </select>

          <label htmlFor="price">Price</label>
          <select
            id="price"
            defaultValue=""
            onChange={applyFilter}
          >
            <option value="">-- All --</option>
            {PRICE_BUCKETS.slice(1).map((value) => (
              <option key={value} value={value}>
                {value} to {value + 20000}
              </option>
            ))}
          </select>

          <button className="searchcars-reset" type="button" onClick={reset}>
            Reset
          </button>
        </div>

        {message && <p className="searchcars-message">{message}</p>}

        <table className="searchcars-table">
          <thead>
            <tr>
              <th>Make</th>
              <th>Model</th>
              <th>Body Type</th>
              <th>Year</th>
              <th>Mileage</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {cars.map((car, index) => (
              <tr key={car.dealer_id + '-' + index}>
                <td>{car.make}</td>
                <td>{car.model}</td>
                <td>{car.bodyType}</td>
                <td>{car.year}</td>
                <td>{car.mileage}</td>
                <td>{car.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SearchCars;

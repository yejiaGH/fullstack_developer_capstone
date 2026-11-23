import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './PostReview.css';

function PostReview() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [review, setReview] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [carMake, setCarMake] = useState('');
  const [carModel, setCarModel] = useState('');
  const [carYear, setCarYear] = useState('');
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [userName] = useState(sessionStorage.getItem('username') || '');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchCars = async () => {
    try {
      const res = await fetch('/djangoapp/get_cars');
      const json = await res.json();
      const carModels = json.CarModels || [];
      setMakes([...new Set(carModels.map((car) => car.CarMake))]);
      setModels([...new Set(carModels.map((car) => car.CarModel))]);
    } catch (err) {
      setError('Could not load the car makes and models.');
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  const submitReview = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    const addReviewUrl = window.location.origin + '/djangoapp/add_review';

    try {
      const res = await fetch(addReviewUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userName,
          review: review,
          purchase_date: purchaseDate,
          car_make: carMake,
          car_model: carModel,
          car_year: carYear,
          dealer_id: id
        })
      });

      const json = await res.json();

      if (json.status === 200) {
        setMessage('Your review has been submitted.');
        navigate('/dealer/' + id);
      } else if (json.status === 403) {
        setError('Please log in before you post a review.');
      } else {
        setError(json.message || 'The review could not be submitted.');
      }
    } catch (err) {
      setError('The review could not be submitted.');
    }
  };

  return (
    <div className="postreview-page">
      <nav className="dealers-nav">
        <a className="nav-brand" href="/">
          Best Cars Dealership
        </a>
        <ul className="nav-links">
          <li>
            <a href="/dealers">View Dealerships</a>
          </li>
          {userName && <li className="nav-user">Hello, {userName}</li>}
        </ul>
      </nav>

      <div className="postreview-panel">
        <h1 className="postreview-title">Post Review</h1>

        {error && (
          <p className="dealers-error" role="alert">
            {error}
          </p>
        )}
        {message && <p className="postreview-message">{message}</p>}

        <form className="postreview-form" onSubmit={submitReview}>
          <label className="postreview-label" htmlFor="review">
            Review
          </label>
          <textarea
            className="postreview-textarea"
            id="review"
            name="review"
            rows="5"
            placeholder="Tell us about your experience"
            value={review}
            onChange={(e) => setReview(e.target.value)}
            required
          />

          <label className="postreview-label" htmlFor="purchase_date">
            Purchase Date
          </label>
          <input
            className="postreview-input"
            id="purchase_date"
            name="purchase_date"
            type="text"
            placeholder="YYYY-MM-DD"
            pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}"
            title="Write the date as YYYY-MM-DD, for example 2024-06-02"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            required
          />

          <label className="postreview-label" htmlFor="car_make">
            Car Make
          </label>
          <select
            className="postreview-select"
            id="car_make"
            name="car_make"
            value={carMake}
            onChange={(e) => setCarMake(e.target.value)}
            required
          >
            <option value="">-- Select a make --</option>
            {makes.map((make) => (
              <option key={make} value={make}>
                {make}
              </option>
            ))}
          </select>

          <label className="postreview-label" htmlFor="car_model">
            Car Model
          </label>
          <select
            className="postreview-select"
            id="car_model"
            name="car_model"
            value={carModel}
            onChange={(e) => setCarModel(e.target.value)}
            required
          >
            <option value="">-- Select a model --</option>
            {models.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>

          <label className="postreview-label" htmlFor="car_year">
            Car Year
          </label>
          <input
            className="postreview-input"
            id="car_year"
            name="car_year"
            type="number"
            min="2015"
            max="2023"
            placeholder="2023"
            value={carYear}
            onChange={(e) => setCarYear(e.target.value)}
            required
          />

          <button className="postreview-button" type="submit">
            Post Review
          </button>
        </form>
      </div>
    </div>
  );
}

export default PostReview;

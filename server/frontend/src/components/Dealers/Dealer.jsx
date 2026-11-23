import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import './Dealer.css';

function Dealer() {
  const { id } = useParams();
  const [dealer, setDealer] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState('');
  const userName = sessionStorage.getItem('username');

  const fetchDealer = async () => {
    try {
      const res = await fetch('/djangoapp/dealer/' + id);
      const json = await res.json();
      const found = json.dealer;
      setDealer(Array.isArray(found) ? found[0] : found);
    } catch (err) {
      setError('Could not load this dealership.');
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await fetch('/djangoapp/reviews/dealer/' + id);
      const json = await res.json();
      setReviews(json.reviews || []);
    } catch (err) {
      setError('Could not load the reviews.');
    }
  };

  useEffect(() => {
    fetchDealer();
    fetchReviews();
  }, [id]);

  return (
    <div className="dealer-page">
      <nav className="dealers-nav">
        <a className="nav-brand" href="/">
          Best Cars Dealership
        </a>
        <ul className="nav-links">
          <li>
            <Link to="/dealers">View Dealerships</Link>
          </li>
          {userName && (
            <li className="nav-user">Hello, {userName}</li>
          )}
        </ul>
      </nav>

      <div className="dealer-panel">
        {error && (
          <p className="dealers-error" role="alert">
            {error}
          </p>
        )}
        <h1 className="dealer-title">
          {dealer ? dealer.name : 'Dealership'} {dealer ? '(' + dealer.state + ')' : ''}
        </h1>

        <div className="dealer-links">
          <Link to={'/searchcars/' + id}>SearchCars</Link>
          {userName && (
            <Link to={'/postreview/' + id}>Post Review</Link>
          )}
        </div>

        <h2 className="dealer-subtitle">Reviews</h2>
        <div className="review_panel">
          {reviews.length === 0 && <p>No reviews yet.</p>}
          {reviews.map((review) => (
            <div className="review" key={review.id}>
              <div className="reviewer">{review.name}</div>
              <div className="review_text">{review.review}</div>
              <div className="review_meta">
                <span className="review_car">
                  {review.car_make} {review.car_model} ({review.car_year})
                </span>
                <span className="review_date">
                  Purchased on {review.purchase_date}
                </span>
                {review.sentiment && (
                  <span
                    className={
                      'review_sentiment ' +
                      (review.sentiment === 'positive'
                        ? 'is-positive'
                        : review.sentiment === 'negative'
                          ? 'is-negative'
                          : 'is-neutral')
                    }
                  >
                    {review.sentiment}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dealer;

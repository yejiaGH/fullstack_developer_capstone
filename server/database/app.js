/*jshint esversion: 8 */
/**
 * Express-Mongo backend of the Best Cars Dealership application.
 *
 * It exposes the dealerships and the reviews that the Django proxy
 * services read.  The service is meant to run inside a Docker
 * container, see Dockerfile and docker-compose.yml next to this file.
 */
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const Reviews = require('./review.js');
const Dealerships = require('./dealership.js');

const app = express();
const port = process.env.PORT || 3030;
const mongoUrl = process.env.MONGO_URL || 'mongodb://mongo:27017';

app.use(cors());
app.use(express.json());

// Serve the seeded JSON so it can be inspected from the browser.
app.use('/data', express.static(path.join(__dirname, 'data')));

app.get('/', function (req, res) {
  res.json({
    message: 'Welcome to the Mongoose API',
    endpoints: [
      '/fetchReviews',
      '/fetchReviews/dealer/:id',
      '/fetchDealers',
      '/fetchDealers/:state',
      '/fetchDealer/:id',
      '/insert_review'
    ]
  });
});

app.get('/fetchReviews', function (req, res) {
  Reviews.find({})
    .then(function (result) {
      res.json(result);
    })
    .catch(function () {
      res.status(500).json({ error: 'Error fetching reviews' });
    });
});

app.get('/fetchReviews/dealer/:id', function (req, res) {
  const id = parseInt(req.params.id, 10);
  Reviews.find({ dealer_id: id })
    .then(function (result) {
      res.json(result);
    })
    .catch(function () {
      res.status(500).json({ error: 'Error fetching reviews' });
    });
});

app.get('/fetchDealers', function (req, res) {
  Dealerships.find({})
    .then(function (result) {
      res.json(result);
    })
    .catch(function () {
      res.status(500).json({ error: 'Error fetching dealers' });
    });
});

app.get('/fetchDealers/:state', function (req, res) {
  const state = req.params.state;
  Dealerships.find({ state: state })
    .then(function (result) {
      res.json(result);
    })
    .catch(function () {
      res.status(500).json({ error: 'Error fetching dealers by state' });
    });
});

app.get('/fetchDealer/:id', function (req, res) {
  const id = parseInt(req.params.id, 10);
  Dealerships.find({ id: id })
    .then(function (result) {
      res.json(result);
    })
    .catch(function () {
      res.status(500).json({ error: 'Error fetching dealer by ID' });
    });
});

app.post('/insert_review', function (req, res) {
  const body = req.body || {};
  const dealerId = parseInt(body.dealer_id, 10);

  Dealerships.find({ id: dealerId })
    .then(function (dealers) {
      if (!dealers.length) {
        res.status(400).json({ error: 'Unknown dealership' });
        return null;
      }
      return Reviews.countDocuments({}).then(function (count) {
        const review = new Reviews({
          id: count + 1,
          dealer_id: dealerId,
          name: body.name || 'Anonymous',
          review: body.review || '',
          purchase_date: body.purchase_date || '',
          car_make: body.car_make || '',
          car_model: body.car_model || '',
          car_year: parseInt(body.car_year, 10) || 2023
        });
        return review.save();
      });
    })
    .then(function (saved) {
      if (!saved) {
        return;
      }
      res.json({
        status: 201,
        message: 'Review inserted',
        id: saved.id
      });
    })
    .catch(function () {
      res.status(500).json({ error: 'Error inserting review' });
    });
});

/**
 * Load the seed documents into MongoDB.  Existing collections are
 * emptied first so that a restarted container always starts from a
 * known state.
 */
function seed(collection, model, fileName) {
  const raw = fs.readFileSync(path.join(__dirname, 'data', fileName), 'utf8');
  const documents = JSON.parse(raw);
  return model.deleteMany({}).then(function () {
    return model.insertMany(documents);
  });
}

mongoose
  .connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(function () {
    console.log('Connected to MongoDB at ' + mongoUrl);
    return seed(Dealerships, Dealerships, 'dealerships.json');
  })
  .then(function () {
    return seed(Reviews, Reviews, 'reviews.json');
  })
  .then(function () {
    console.log('Seed data loaded');
    app.listen(port, function () {
      console.log('Server listening on port ' + port);
    });
  })
  .catch(function (err) {
    console.error('Failed to start the server', err);
    process.exit(1);
  });

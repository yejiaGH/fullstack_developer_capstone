/*jshint esversion: 8 */
/**
 * Cars inventory microservice.
 *
 * It answers questions about the cars each dealership stocks and is
 * reached from Django through the ``get_inventory`` proxy view.
 */
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const Cars = require('./inventory.js');

const app = express();
const port = process.env.PORT || 3050;
const mongoUrl = process.env.MONGO_URL || 'mongodb://mongo:27017';

app.use(cors());
app.use(express.json());

app.get('/', function (req, res) {
  res.json({
    message: 'Welcome to the Mongoose API',
    endpoints: [
      '/cars/:id',
      '/carsbymake/:id/:make',
      '/carsbymodel/:id/:model',
      '/carsbymaxmileage/:id/:mileage',
      '/carsbyprice/:id/:price',
      '/carsbyyear/:id/:year'
    ]
  });
});

app.get('/cars/:id', async function (req, res) {
  try {
    const documents = await Cars.find({ dealer_id: req.params.id });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching dealers by ID' });
  }
});

app.get('/carsbymake/:id/:make', async function (req, res) {
  try {
    const documents = await Cars.find({
      dealer_id: req.params.id,
      make: req.params.make
    });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching dealers by ID' });
  }
});

app.get('/carsbymodel/:id/:model', async function (req, res) {
  try {
    const documents = await Cars.find({
      dealer_id: req.params.id,
      model: req.params.model
    });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching dealers by ID' });
  }
});

app.get('/carsbymaxmileage/:id/:mileage', async function (req, res) {
  try {
    const mileage = parseInt(req.params.mileage, 10);
    let condition = {};
    if (mileage === 50000) {
      condition = { $lte: mileage };
    } else if (mileage === 100000) {
      condition = { $lte: mileage, $gt: 50000 };
    } else if (mileage === 150000) {
      condition = { $lte: mileage, $gt: 100000 };
    } else if (mileage === 200000) {
      condition = { $lte: mileage, $gt: 150000 };
    } else {
      condition = { $gt: 200000 };
    }
    const documents = await Cars.find({
      dealer_id: req.params.id,
      mileage: condition
    });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching dealers by ID' });
  }
});

app.get('/carsbyprice/:id/:price', async function (req, res) {
  try {
    const price = parseInt(req.params.price, 10);
    let condition = {};
    if (price === 20000) {
      condition = { $lte: price };
    } else if (price === 40000) {
      condition = { $lte: price, $gt: 20000 };
    } else if (price === 60000) {
      condition = { $lte: price, $gt: 40000 };
    } else if (price === 80000) {
      condition = { $lte: price, $gt: 60000 };
    } else {
      condition = { $gt: 80000 };
    }
    const documents = await Cars.find({
      dealer_id: req.params.id,
      price: condition
    });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching dealers by ID' });
  }
});

app.get('/carsbyyear/:id/:year', async function (req, res) {
  try {
    const year = parseInt(req.params.year, 10);
    const documents = await Cars.find({
      dealer_id: req.params.id,
      year: { $gte: year }
    });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching dealers by ID' });
  }
});

/**
 * Load the seed documents into MongoDB, emptying the collection
 * first so a restarted container always starts from a known state.
 */
function seed() {
  const raw = fs.readFileSync(
    path.join(__dirname, 'data', 'car_records.json'), 'utf8'
  );
  const documents = JSON.parse(raw);
  return Cars.deleteMany({}).then(function () {
    return Cars.insertMany(documents);
  });
}

mongoose
  .connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(function () {
    console.log('Connected to MongoDB at ' + mongoUrl);
    return seed();
  })
  .then(function () {
    console.log('Car records loaded');
    app.listen(port, function () {
      console.log('Server listening on port ' + port);
    });
  })
  .catch(function (err) {
    console.error('Failed to start the server', err);
    process.exit(1);
  });

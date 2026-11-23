# Best Cars Dealership — IBM Cloud Native Full Stack Development Capstone

A full stack car dealership application built as the capstone project of the
IBM *Cloud Native Full Stack Development* specialization.  The application
consists of a Django front door that serves a React single page application
and proxies three Node.js / Flask microservices.

```
                      ┌──────────────────────────────┐
   Browser ──────────▶  Django  (port 8000)          │
                      │  • React SPA (built by npm)  │
                      │  • auth, admin, proxy views  │
                      └───┬──────────┬──────────┬────┘
                          │          │          │
              ┌───────────▼──┐  ┌────▼─────┐  ┌─▼──────────────┐
              │ Express +    │  │ Flask    │  │ Express        │
              │ Mongoose     │  │ NLTK     │  │ inventory      │
              │ 3030         │  │ 5050     │  │ 3050           │
              └───────┬──────┘  └──────────┘  └────────────────┘
                      │
                 ┌────▼─────┐
                 │ MongoDB  │
                 │  27017   │
                 └──────────┘
```

| Component | Technology | Port | Purpose |
|---|---|---|---|
| `server/djangoproj`, `server/djangoapp` | Django 5 | 8000 | Pages, authentication, admin, REST proxy |
| `server/frontend` | React 18 | — | Single page application |
| `server/database` | Express + Mongoose 8 | 3030 | Dealerships and reviews |
| `server/djangoapp/microservices/sentiment_analyzer.py` | Flask + NLTK | 5050 | Sentiment classification of reviews |
| `server/carsInventory` | Express | 3050 | Car make / model inventory |
| MongoDB | MongoDB 6.0 | 27017 | Persistent storage |

## Repository layout

```
server/
├── djangoproj/          Django project (settings, urls, wsgi)
├── djangoapp/           Django application (models, views, REST proxy)
│   └── microservices/   Flask sentiment analyzer
├── frontend/            React application (CRA)
├── database/            Express + Mongoose dealership API
├── carsInventory/       Express inventory API
├── k8s/                 Kubernetes manifests for the five workloads
├── kind-cluster.yaml    kind cluster definition with the NodePort mapping
├── deployment.yaml      Deployment + Service for the Django front door
├── Dockerfile           Multi stage build of the Django + React image
└── docs/
    ├── curl/            Captured cURL transcripts of every API endpoint
    └── tools/           Screenshot helpers used to produce docs/screenshots
docs/screenshots/        Screenshots of the running application
```

## Environment variables

| Variable | Used by | Default | Meaning |
|---|---|---|---|
| `backend_url` | Django | `http://localhost:3030` | Express / Mongoose backend |
| `sentiment_analyzer_url` | Django | `http://localhost:5050/` | Flask sentiment analyzer (must end with `/`) |
| `searchcars_url` | Django | `http://localhost:3050` | Cars inventory service |
| `MONGO_URL` | Express backend | `mongodb://localhost:27017` | MongoDB connection string |
| `PORT` | Express backend / Flask / inventory | `3030` / `5000` / `3050` | Listening port |
| `SECRET_KEY` | Django | development default | Django secret key |
| `DEBUG` | Django | `False` | Django debug mode |

A copy of the local configuration lives in `server/.env.example`.

## Running the application locally

### 1. Backend microservices

```bash
# MongoDB
docker run -d --name mongodb -p 27017:27017 mongo:6.0

# Dealership and review API
cd server/database && npm install && npm start          # port 3030

# Cars inventory API
cd server/carsInventory && npm install && npm start     # port 3050

# Sentiment analyzer (needs the NLTK corpora)
cd server/djangoapp/microservices
pip install -r requirements.txt
python sentiment_analyzer.py                             # port 5050
```

### 2. Django front door and React application

```bash
cd server
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
cp .env.example djangoapp/.env

# Create the local car inventory tables
.venv/bin/python manage.py migrate
.venv/bin/python manage.py populate

# Build the React bundle into frontend/build
cd frontend && npm install && npm run build && cd ..

# Start the application
.venv/bin/python manage.py runserver 0.0.0.0:8000
```

The site is then served on <http://localhost:8000>.

## Building the container images

```bash
cd server
docker build -t dealership:latest .              # Django + React, multi stage
docker build -t dealership-backend:latest database/
docker build -t carsinventory:latest carsInventory/
docker build -t sentiment-analyzer:latest djangoapp/microservices/
```

The `dealership` image builds the React bundle in a `node:18-alpine` stage and
copies the result into a `python:3.12` image, so the resulting image is
self contained.  `collectstatic` runs in the entry point and WhiteNoise serves
the collected assets, because gunicorn does not serve static files on its own.

## Deploying to Kubernetes

A [kind](https://kind.sigs.k8s.io/) cluster is used for the local deployment,
because the Docker Desktop cluster cannot pull images into its nodes.

```bash
# 1. Create the cluster and import the locally built images
kind create cluster --name capstone \
  --image kindest/node:v1.31.2 --config server/kind-cluster.yaml

kind load docker-image dealership:latest --name capstone
kind load docker-image dealership-backend:latest --name capstone
kind load docker-image carsinventory:latest --name capstone
kind load docker-image sentiment-analyzer:latest --name capstone
kind load docker-image mongo:6.0 --name capstone

# 2. Roll out the workloads
kubectl --context kind-capstone apply -f server/k8s/
kubectl --context kind-capstone apply -f server/deployment.yaml

# 3. Check that everything came up
kubectl --context kind-capstone get pods
```

The application is exposed with a `NodePort` service on
**<http://localhost:30880>**, which is the address the `kind-cluster.yaml`
file maps to the host.

## Documentation

* `docs/screenshots/` – screenshots of every page of the application, the
  Django admin, the Kubernetes deployment and the GitHub repository.
* `server/docs/curl/` – the exact cURL commands and their responses for
  every REST endpoint (login, logout, dealerships, dealers by state, reviews,
  car makes and the sentiment analyzer).
* `server/docs/tools/shot.sh` – helper that captures the browser panel of the
  application window, including the address bar, and stores it under
  `docs/screenshots`.

## Continuous integration

`.github/workflows` runs `flake8` over every Python file and `jshint` over the
JavaScript sources of the inventory service on every push.

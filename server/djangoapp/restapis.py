"""Proxy services that talk to the external microservices.

The browser only ever talks to Django.  When a request needs data that
lives in MongoDB, the views call the helpers in this module, which in
turn call the Express-Mongo backend.  The emotion analysis is done by
a separate Flask microservice deployed on IBM Cloud Code Engine.

Every external address is read from the ``djangoapp/.env`` file (or from
the process environment, which takes precedence) so that the same code
runs locally, in Docker and on Kubernetes without edits.
"""
import os
import requests

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


def _load_dotenv(path):
    """Read ``key=value`` pairs from a .env file into os.environ."""
    if not os.path.exists(path):
        return
    with open(path, 'r', encoding='utf-8') as handle:
        for raw_line in handle:
            line = raw_line.strip()
            if not line or line.startswith('#') or '=' not in line:
                continue
            key, _, value = line.partition('=')
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            # The process environment wins over the file.
            os.environ.setdefault(key, value)


_load_dotenv(os.path.join(BASE_DIR, '.env'))


def _base_url(name, default):
    """Read a base URL from the environment, trimming trailing slashes."""
    return os.environ.get(name, default).rstrip('/')


backend_url = _base_url('backend_url', 'http://localhost:3030')
sentiment_analyzer_url = _base_url(
    'sentiment_analyzer_url', 'http://localhost:5050/'
)
searchcars_url = _base_url('searchcars_url', 'http://localhost:3050')

# Fail fast instead of hanging a request when a service is unreachable.
REQUEST_TIMEOUT = float(os.environ.get('BACKEND_TIMEOUT', '10'))


def get_request(endpoint, **kwargs):
    """GET a JSON document from the Express-Mongo backend.

    ``endpoint`` is the path on the backend, for example
    ``/fetchDealers``.  Extra keyword arguments are appended to the
    URL as a query string.
    """
    params = ''
    if kwargs:
        for key, value in kwargs.items():
            params = params + key + "=" + str(value) + "&"

    request_url = backend_url + endpoint + "?" + params

    print("GET from {} ".format(request_url))
    try:
        response = requests.get(request_url, timeout=REQUEST_TIMEOUT)
        return response.json()
    except Exception as err:
        print(f"Unexpected {err=}, {type(err)=}")
        print("Network exception occurred")
        return None


def post_review(data_dict):
    """POST a new review to the Express-Mongo backend."""
    request_url = backend_url + "/insert_review"
    try:
        response = requests.post(
            request_url, json=data_dict, timeout=REQUEST_TIMEOUT
        )
        print(response.json())
        return response.json()
    except Exception as err:
        print(f"Unexpected {err=}, {type(err)=}")
        print("Network exception occurred")
        return None


def analyze_review_sentiments(text):
    """Ask the sentiment analyzer microservice about one review body."""
    request_url = sentiment_analyzer_url + "/analyze/" + text
    try:
        response = requests.get(request_url, timeout=REQUEST_TIMEOUT)
        return response.json()
    except Exception as err:
        print(f"Unexpected {err=}, {type(err)=}")
        print("Network exception occurred")
        return {"sentiment": "unknown"}


def searchcars_request(endpoint, **kwargs):
    """GET a document from the cars inventory microservice."""
    params = ''
    if kwargs:
        for key, value in kwargs.items():
            params = params + key + "=" + str(value) + "&"

    request_url = searchcars_url + endpoint + "?" + params

    print("GET from {} ".format(request_url))
    try:
        response = requests.get(request_url, timeout=REQUEST_TIMEOUT)
        return response.json()
    except Exception as err:
        print(f"Unexpected {err=}, {type(err)=}")
        print("Network exception occurred")
        return None
    finally:
        print("GET request call complete!")

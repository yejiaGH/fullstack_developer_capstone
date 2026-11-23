"""Views for the Best Cars Dealership application.

Three groups live here:

* user management  - login, logout and registration
* car inventory    - the local CarMake / CarModel tables
* proxy services  - views that forward the request to the external
                    Express-Mongo backend and the sentiment analyzer
"""
import json
import logging

from django.contrib.auth import login, logout
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt

from .models import CarMake, CarModel
from .populate import initiate
from .restapis import (
    analyze_review_sentiments,
    get_request,
    post_review,
    searchcars_request,
)

logger = logging.getLogger(__name__)


def home(request):
    """Serve the static home page that hosts the React application."""
    return render(request, 'Home.html')


@csrf_exempt
def login_user(request):
    """Authenticate a user and start a session for them."""
    data = json.loads(request.body)
    username = data['userName']
    password = data['password']

    user = User.objects.filter(username=username).first()
    if user is None or not user.check_password(password):
        logger.warning("Failed login attempt for %s", username)
        return JsonResponse({
            "userName": "",
            "status": "Failed",
            "error": "Invalid username or password",
        })

    login(request, user)
    return JsonResponse({"userName": username, "status": "Authenticated"})


@csrf_exempt
def logout_user(request):
    """Terminate the session and tell the front end to forget the user."""
    logout(request)
    data = {"userName": ""}
    return JsonResponse(data)


@csrf_exempt
def registration(request):
    """Create a new user and log them straight in."""
    data = json.loads(request.body)
    username = data['userName']
    password = data['password']
    first_name = data['firstName']
    last_name = data['lastName']
    email = data['email']

    username_exist = False
    email_exist = False

    try:
        User.objects.get(username=username)
        username_exist = True
    except User.DoesNotExist:
        logger.debug("{} is new user".format(username))

    try:
        User.objects.get(email=email)
        email_exist = True
    except User.DoesNotExist:
        logger.debug("{} is new email".format(email))

    if not username_exist and not email_exist:
        user = User.objects.create_user(
            username=username,
            first_name=first_name,
            last_name=last_name,
            password=password,
            email=email,
        )
        login(request, user)
        data = {"userName": username, "status": "Authenticated"}
        return JsonResponse(data)
    elif username_exist:
        data = {"userName": username, "error": "Already Registered"}
        return JsonResponse(data)
    else:
        data = {"email": email, "error": "Email already exists"}
        return JsonResponse(data)


def get_cars(request):
    """Return every car model together with the make it belongs to."""
    count = CarMake.objects.filter().count()
    print(count)
    if count == 0:
        initiate()
    car_models = CarModel.objects.select_related('car_make')
    cars = []
    for car_model in car_models:
        cars.append({
            "CarModel": car_model.name,
            "CarMake": car_model.car_make.name,
        })
    return JsonResponse({"CarModels": cars})


def get_dealerships(request, state="All"):
    """Proxy service: list all dealerships, optionally filtered by state."""
    if state == "All":
        endpoint = "/fetchDealers"
    else:
        endpoint = "/fetchDealers/" + state
    dealerships = get_request(endpoint)
    return JsonResponse({"status": 200, "dealers": dealerships})


def get_dealer_details(request, dealer_id):
    """Proxy service: return one dealership by its identifier."""
    if dealer_id:
        endpoint = "/fetchDealer/" + str(dealer_id)
        dealership = get_request(endpoint)
        return JsonResponse({"status": 200, "dealer": dealership})
    else:
        return JsonResponse({"status": 400, "message": "Bad Request"})


def get_dealer_reviews(request, dealer_id):
    """Proxy service: reviews of one dealership, each with its sentiment."""
    if dealer_id:
        endpoint = "/fetchReviews/dealer/" + str(dealer_id)
        reviews = get_request(endpoint)
        if reviews is None:
            reviews = []
        for review_detail in reviews:
            response = analyze_review_sentiments(review_detail['review'])
            print(response)
            review_detail['sentiment'] = response['sentiment']
        return JsonResponse({"status": 200, "reviews": reviews})
    else:
        return JsonResponse({"status": 400, "message": "Bad Request"})


@csrf_exempt
def add_review(request):
    """Proxy service: store a new review. Logged in users only."""
    if request.user.is_anonymous is False:
        data = json.loads(request.body)
        try:
            post_review(data)
            return JsonResponse({"status": 200})
        except Exception as err:
            print(f"Unexpected {err=}, {type(err)=}")
            return JsonResponse({
                "status": 401,
                "message": "Error in posting review",
            })
    else:
        return JsonResponse({"status": 403, "message": "Unauthorized"})


def get_inventory(request, dealer_id):
    """Proxy service: the cars stocked by one dealership."""
    data = request.GET
    if dealer_id:
        if 'year' in data:
            endpoint = "/carsbyyear/" + str(dealer_id) + "/" + data['year']
        elif 'make' in data:
            endpoint = "/carsbymake/" + str(dealer_id) + "/" + data['make']
        elif 'model' in data:
            endpoint = "/carsbymodel/" + str(dealer_id) + "/" + data['model']
        elif 'mileage' in data:
            endpoint = (
                "/carsbymaxmileage/" + str(dealer_id) + "/" + data['mileage']
            )
        elif 'price' in data:
            endpoint = "/carsbyprice/" + str(dealer_id) + "/" + data['price']
        else:
            endpoint = "/cars/" + str(dealer_id)

        cars = searchcars_request(endpoint)
        return JsonResponse({"status": 200, "cars": cars})
    else:
        return JsonResponse({"status": 400, "message": "Bad Request"})

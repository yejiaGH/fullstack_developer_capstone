"""Seed data for the CarMake and CarModel tables.

``initiate()`` is called from the ``get_cars`` view the first time the
table is empty, so a fresh checkout returns a usable car list.
"""
from .models import CarMake, CarModel

CAR_MAKE_DATA = [
    {"name": "NISSAN", "description": "Great cars. Japanese technology"},
    {"name": "Mercedes", "description": "Great cars. German technology"},
    {"name": "Audi", "description": "Great cars. German technology"},
    {"name": "Kia", "description": "Great cars. Korean technology"},
    {"name": "Toyota", "description": "Great cars. Japanese technology"},
]

CAR_MODEL_DATA = [
    {"name": "Pathfinder", "type": "SUV", "year": 2023, "make": 0},
    {"name": "Qashqai", "type": "SUV", "year": 2023, "make": 0},
    {"name": "XTRAIL", "type": "SUV", "year": 2023, "make": 0},
    {"name": "A-Class", "type": "SUV", "year": 2023, "make": 1},
    {"name": "C-Class", "type": "SUV", "year": 2023, "make": 1},
    {"name": "E-Class", "type": "SUV", "year": 2023, "make": 1},
    {"name": "A4", "type": "SUV", "year": 2023, "make": 2},
    {"name": "A5", "type": "SUV", "year": 2023, "make": 2},
    {"name": "A6", "type": "SUV", "year": 2023, "make": 2},
    {"name": "Sorrento", "type": "SUV", "year": 2023, "make": 3},
    {"name": "Carnival", "type": "SUV", "year": 2023, "make": 3},
    {"name": "Cerato", "type": "Sedan", "year": 2023, "make": 3},
    {"name": "Corolla", "type": "Sedan", "year": 2023, "make": 4},
    {"name": "Camry", "type": "Sedan", "year": 2023, "make": 4},
    {"name": "Kluger", "type": "SUV", "year": 2023, "make": 4},
]


def initiate():
    """Create the makes and models used by the dealership inventory."""
    car_make_instances = []
    for data in CAR_MAKE_DATA:
        car_make_instances.append(
            CarMake.objects.create(
                name=data['name'],
                description=data['description'],
            )
        )

    for data in CAR_MODEL_DATA:
        CarModel.objects.create(
            name=data['name'],
            car_make=car_make_instances[data['make']],
            type=data['type'],
            year=data['year'],
        )

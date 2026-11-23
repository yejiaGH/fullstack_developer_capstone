from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator


class CarMake(models.Model):
    """A car manufacturer, for example NISSAN or Audi."""

    name = models.CharField(max_length=100)
    description = models.TextField()

    def __str__(self):
        return self.name


class CarModel(models.Model):
    """A concrete car model that belongs to a make."""

    car_make = models.ForeignKey(
        CarMake, on_delete=models.CASCADE, related_name='car_models'
    )
    name = models.CharField(max_length=100)
    CAR_TYPES = [
        ('SEDAN', 'Sedan'),
        ('SUV', 'SUV'),
        ('WAGON', 'Wagon'),
    ]
    type = models.CharField(max_length=10, choices=CAR_TYPES, default='SUV')
    year = models.IntegerField(
        default=2023,
        validators=[
            MaxValueValidator(2023),
            MinValueValidator(2015),
        ]
    )
    dealer_id = models.IntegerField(
        default=0,
        help_text='Identifier of the dealership that stocks this model'
    )

    def __str__(self):
        return self.name

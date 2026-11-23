#!/bin/bash
# Start the Django development server in a Terminal window.  Double click
# this file, or run it with:
#
#     open -a Terminal server/run_django.command
#
# The window keeps the start up banner and the request log visible, which
# is what the screenshot django_server.png of the capstone project shows.
cd "$(dirname "$0")" || exit 1
clear
echo "Best Cars Dealership - Django development server"
echo "Project root: $(pwd)"
echo
.venv/bin/python manage.py runserver 0.0.0.0:8000 --noreload

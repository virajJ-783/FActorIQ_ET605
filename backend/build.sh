#!/usr/bin/env bash
set -o errexit

pip install -r requirements.txt
python manage.py collectstatic --no-input
python manage.py migrate

# Create superuser automatically (the "|| true" prevents the build from failing if the user already exists on future deploys)
#python manage.py createsuperuser --noinput || true

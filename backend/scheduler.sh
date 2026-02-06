#!/bin/sh
set -e

while true; do
  python manage.py process_no_shows
  sleep 1800
done

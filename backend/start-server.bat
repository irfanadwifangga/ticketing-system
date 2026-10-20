@echo off
cd /d D:\project\python\ticketing-system\backend
set PYTHONPATH="src:$PWD/.venv"
python manage.py runserver 0.0.0.0:8000

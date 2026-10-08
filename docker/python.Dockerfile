FROM python:3.11-slim
WORKDIR /app
COPY . .
RUN pip install --no-cache-dir "Django>=5.0,<6.0" Flask gunicorn && \
    if [ -f requirements.txt ]; then pip install --no-cache-dir -r requirements.txt; fi
ENV PORT=5000
EXPOSE 5000 8000
CMD ["sh", "-c", "if [ -f manage.py ]; then python manage.py runserver 0.0.0.0:8000; elif [ -f app.py ]; then gunicorn --bind 0.0.0.0:${PORT} app:app; else gunicorn --bind 0.0.0.0:${PORT} main:app; fi"]

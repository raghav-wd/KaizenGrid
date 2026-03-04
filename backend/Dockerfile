FROM python:3.12-slim

WORKDIR /app

# Install system deps for Pillow
RUN apt-get update && \
    apt-get install -y --no-install-recommends libjpeg62-turbo-dev zlib1g-dev && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# COPY grid-wallpaper-55b580395d9a.json /app/key.json

# ENV GOOGLE_APPLICATION_CREDENTIALS="/app/key.json"

# Cloud Run injects PORT env var (default 8080)
ENV PORT=8080

EXPOSE ${PORT}

CMD ["gunicorn", "--bind", "0.0.0.0:8080", "--workers", "1", "--threads", "2", "--timeout", "30", "app:app"]

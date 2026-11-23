FROM python:3.12.0-slim-bookworm

ENV PYTHONBUFFERED 1
ENV PYTHONWRITEBYTECODE 1

ENV APP=/app

# Switch to the working directory of the application
WORKDIR $APP

# Install the dependencies first so that this layer can be reused
COPY requirements.txt $APP

RUN pip3 install --no-cache-dir -r requirements.txt

# Copy the rest of the code
COPY . $APP

EXPOSE 8000

RUN chmod +x /app/entrypoint.sh

ENTRYPOINT ["/bin/bash", "/app/entrypoint.sh"]

CMD ["gunicorn", "--bind", ":8000", "--workers", "3", "djangoproj.wsgi"]

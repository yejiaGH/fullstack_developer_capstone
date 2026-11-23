# Stage 1 - build the React front end.
# The compiled assets are copied into the Python image below, so the
# image is self contained and does not depend on a local `npm run build`.
FROM docker.m.daocloud.io/library/node:18-alpine AS frontend-build

ENV NODE_ENV=production
WORKDIR /app

COPY frontend/package.json frontend/package-lock.json ./
RUN npm install --no-audit --no-fund --registry=https://registry.npmmirror.com

COPY frontend/ ./
RUN npm run build


# Stage 2 - the Django application.
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

# Copy the compiled React application built in the first stage
COPY --from=frontend-build /app/build $APP/frontend/build

EXPOSE 8000

RUN chmod +x /app/entrypoint.sh

ENTRYPOINT ["/bin/bash", "/app/entrypoint.sh"]

CMD ["gunicorn", "--bind", ":8000", "--workers", "3", "djangoproj.wsgi"]

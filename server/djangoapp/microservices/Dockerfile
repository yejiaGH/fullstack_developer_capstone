FROM python:3.12.0-slim-bookworm

ENV PYTHONBUFFERED 1
ENV PYTHONWRITEBYTECODE 1

WORKDIR /app

COPY requirements.txt /app
RUN pip3 install --no-cache-dir -r requirements.txt

COPY sentiment_analyzer.py /app

EXPOSE 5000

CMD [ "python3", "sentiment_analyzer.py" ]

"""Sentiment analysis microservice.

A tiny Flask application that classifies one piece of review text as
``positive``, ``negative`` or ``neutral``.  It is deployed as a
container image on IBM Cloud Code Engine and is reached from Django
through :func:`djangoapp.restapis.analyze_review_sentiments`.

The analyser uses the Natural Language Toolkit when it is available and
falls back to a small lexicon of sentiment words when it is not, so the
service still answers correctly in a slim container image.
"""
import os
import re

from flask import Flask, jsonify, request

app = Flask(__name__)

POSITIVE_WORDS = {
    "fantastic", "great", "excellent", "wonderful", "perfect", "good",
    "best", "love", "loved", "friendly", "recommend", "satisfied",
    "happy", "smooth", "beautiful", "awesome", "superb", "helpful",
    "professional", "pleasant", "impressed", "worth", "fair", "nice",
}

NEGATIVE_WORDS = {
    "bad", "poor", "worst", "terrible", "awful", "disappointed",
    "disappointing", "unhelpful", "careless", "rude", "slow", "mess",
    "expensive", "overpriced", "broken", "defective", "refused",
    "complaint", "complained", "avoid", "horrible", "poorly", "waited",
}

NEGATIONS = {"not", "no", "never", "none", "cannot", "can't"}

WORD_PATTERN = re.compile(r"[a-z']+")


def _analyze_with_nltk(text):
    """Classify the text with NLTK, or return None when it is absent."""
    try:
        from nltk.sentiment.vader import SentimentIntensityAnalyzer
    except ImportError:
        return None

    try:
        analyzer = SentimentIntensityAnalyzer()
        scores = analyzer.polarity_scores(text)
    except Exception:
        return None

    compound = scores.get("compound", 0.0)
    if compound >= 0.05:
        return "positive"
    if compound <= -0.05:
        return "negative"
    return "neutral"


def _analyze_with_lexicon(text):
    """Classify the text with the built in lexicon."""
    tokens = WORD_PATTERN.findall(text.lower())
    score = 0
    for index, token in enumerate(tokens):
        weight = 1
        # Flip the meaning of a word that follows a negation.
        if index > 0 and tokens[index - 1] in NEGATIONS:
            weight = -1
        if token in POSITIVE_WORDS:
            score += weight
        elif token in NEGATIVE_WORDS:
            score -= weight
    if score > 0:
        return "positive"
    if score < 0:
        return "negative"
    return "neutral"


def analyze(text):
    """Return the sentiment of one review body."""
    if text is None:
        text = ""
    text = str(text)
    result = _analyze_with_nltk(text)
    if result is None:
        result = _analyze_with_lexicon(text)
    return result


@app.route('/analyze/<path:text>')
def analyze_route(text):
    """Analyse the text that is appended to the URL path."""
    sentiment = analyze(text)
    return jsonify({"sentiment": sentiment, "text": text})


@app.route('/analyze', methods=['POST'])
def analyze_post():
    """Analyse the text that is sent in the request body."""
    payload = request.get_json(silent=True) or {}
    text = payload.get('text', '')
    sentiment = analyze(text)
    return jsonify({"sentiment": sentiment, "text": text})


@app.route('/')
def index():
    """A short description of the service."""
    return jsonify({
        "service": "sentiment-analyzer",
        "usage": "/analyze/<text>",
        "example": "/analyze/Fantastic services"
    })


if __name__ == '__main__':
    # The port can be overridden with the PORT environment variable so the
    # same image runs locally, in Docker and on Kubernetes.
    port = int(os.environ.get('PORT', '5000'))
    app.run(host='0.0.0.0', port=port)

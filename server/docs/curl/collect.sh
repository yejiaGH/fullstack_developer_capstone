#!/bin/bash
# Regenerate the cURL request/response files that the capstone project
# asks for as evidence.  Run it while the full stack is up:
#
#     bash server/docs/curl/collect.sh
#
# Every file holds the exact command that was run followed by its output.
set -u

BASE="${BASE:-http://localhost:8000}"
BACKEND="${BACKEND:-http://localhost:3030}"
SENTIMENT="${SENTIMENT:-http://localhost:5050}"
OUT="$(cd "$(dirname "$0")" && pwd)"
JAR="$OUT/cookies.txt"
rm -f "$JAR"
trap 'rm -f "$JAR"' EXIT

write() {
  local file="$1"
  shift
  {
    echo "\$ $*"
    echo
    "$@" 2>&1
    echo
  } > "$OUT/$file"
  echo "wrote $OUT/$file"
}

# 1. Django server start up output.
# The start up banner and the request log are produced by the running
# server itself, so they are captured from its console instead of being
# written by this script:
#
#     python manage.py runserver 127.0.0.1:8001 --noreload
#
# The recorded output lives in the file django_server next to this script.
echo "kept $OUT/django_server (captured from the server console)"

# 2. Login.
write loginuser curl -s -c "$JAR" -X POST "$BASE/djangoapp/login" \
  -H 'Content-Type: application/json' \
  -d '{"userName":"testuser","password":"Test@12345"}'

# 3. Logout.
write logoutuser curl -s -b "$JAR" "$BASE/djangoapp/logout"

# 4. Reviews of one dealership.
write getdealerreviews curl -s "$BASE/djangoapp/reviews/dealer/29"

# 5. All dealerships.
write getalldealers curl -s "$BASE/djangoapp/get_dealers"

# 6. One dealership by id.
write getdealerbyid curl -s "$BASE/djangoapp/dealer/3"

# 7. Dealerships in Kansas.
write getdealersbyState curl -s "$BASE/djangoapp/get_dealers/Kansas"

# 8. All car makes and models.
write getallcarmakes curl -s "$BASE/djangoapp/get_cars"

# 9. Sentiment analysis of "Fantastic services".
write analyzereview curl -s "$SENTIMENT/analyze/Fantastic%20services"

echo "done"

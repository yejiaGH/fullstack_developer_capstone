#!/bin/bash
# Take a screenshot of the browser panel of the WorkBuddy window, with the
# address bar visible, and store it in docs/screenshots.
#
#     bash server/docs/tools/shot.sh <name>
#
# The window id of the WorkBuddy window is looked up automatically, the
# The application window is split into the agent chat on the left and the
# browser panel on the right.  Both columns are resizable, so the position
# of the panel is detected from the capture itself.
set -u

NAME="${1:?usage: shot.sh <name>}"
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
PY="$ROOT/server/.venv/bin/python"
OUT_DIR="$ROOT/docs/screenshots"
RAW="/tmp/wb_shot_$$.png"

mkdir -p "$OUT_DIR"

WINDOW_ID="$($PY "$ROOT/server/docs/tools/window_capture.py" \
  | awk '$2 == "WorkBuddy" && $3 == "WorkBuddy" { print $1; exit }')"

if [ -z "$WINDOW_ID" ]; then
  echo "could not find the WorkBuddy window" >&2
  exit 1
fi

# The window server refuses the capture while the browser is restarting,
# so the capture is retried a few times.
for attempt in 1 2 3 4 5 6 7 8; do
  rm -f "$RAW"
  if screencapture -l "$WINDOW_ID" -o "$RAW" 2>/dev/null && [ -s "$RAW" ]; then
    LEFT="$($PY "$ROOT/server/docs/tools/find_panel.py" "$RAW")"
    $PY "$ROOT/server/docs/tools/crop.py" "$RAW" "$OUT_DIR/$NAME.png" \
      "$LEFT" 0 3024 1898 && rm -f "$RAW" \
      && echo "saved docs/screenshots/$NAME.png (panel starts at x=$LEFT)"
    exit 0
  fi
  sleep 3
done

echo "could not capture the window for $NAME" >&2
exit 1

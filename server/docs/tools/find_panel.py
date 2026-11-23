"""Find the left edge of the browser panel inside a WorkBuddy window capture.

The application window is split into the agent chat on the left and the
browser panel on the right.  The two halves use completely different
backgrounds, so the border between them is found by looking for the
column with the biggest horizontal contrast when compared with its
neighbours.

    python find_panel.py <screenshot.png>
"""
import sys

from PIL import Image


def column_mean(pixels, x, height, step=20):
    total = 0
    count = 0
    for y in range(0, height, step):
        total += pixels[x, y]
        count += 1
    return total / max(count, 1)


def find_edge(path):
    image = Image.open(path).convert('L')
    width, height = image.size
    pixels = image.load()

    start = int(width * 0.45)
    best = (0.0, start)
    for x in range(start, width - 20):
        left = column_mean(pixels, x - 6, height)
        right = column_mean(pixels, x + 6, height)
        contrast = abs(right - left)
        if contrast > best[0]:
            best = (contrast, x)
    return best[1]


if __name__ == '__main__':
    print(find_edge(sys.argv[1]))

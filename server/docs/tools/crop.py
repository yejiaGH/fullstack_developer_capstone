"""Crop a region out of a screenshot.

The WorkBuddy application window shows the agent chat on the left and the
browser panel on the right.  Only the browser panel is needed for the
screenshots of the capstone project, so the captured window is cropped.
"""
import sys

from PIL import Image


def crop(source, target, box):
    image = Image.open(source)
    image.crop(box).save(target)
    return image.size


if __name__ == '__main__':
    src, dst = sys.argv[1], sys.argv[2]
    if len(sys.argv) > 3:
        left, top, right, bottom = (int(v) for v in sys.argv[3:7])
        size = crop(src, dst, (left, top, right, bottom))
        print('source size {} -> cropped {} to {}'.format(size, dst,
                                                          (left, top, right,
                                                           bottom)))
    else:
        print('size: {}'.format(Image.open(src).size))

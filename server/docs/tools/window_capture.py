"""Window helper used to take screenshots that include the browser chrome.

The rubric of the capstone project asks for screenshots in which the
address bar is visible, so the page only screenshots of the browser are
not enough.  This script lists the windows that are on screen and can
capture one of them, address bar included.
"""
import sys

import Quartz


def list_windows():
    options = Quartz.kCGWindowListOptionOnScreenOnly
    windows = Quartz.CGWindowListCopyWindowInfo(
        options, Quartz.kCGNullWindowID
    )
    result = []
    for window in windows:
        bounds = Quartz.CGRectMake(
            window.get('Bounds', {}).get('X', 0),
            window.get('Bounds', {}).get('Y', 0),
            window.get('Bounds', {}).get('Width', 0),
            window.get('Bounds', {}).get('Height', 0),
        )
        result.append({
            'id': window.get('kCGWindowNumber'),
            'owner': window.get('kCGWindowOwnerName') or '',
            'name': window.get('kCGWindowName') or '',
            'layer': window.get('kCGWindowLayer'),
            'bounds': (bounds.origin.x, bounds.origin.y, bounds.size.width,
                       bounds.size.height),
        })
    return result


def capture(window_id, out_path):
    url = Quartz.CGWindowCreateImage(
        Quartz.CGRectNull,
        Quartz.kCGWindowImageOptionBoundsIgnoreFraming,
        window_id,
        Quartz.kCGWindowImageDefault,
    )
    if url is None:
        raise SystemExit('could not capture window {}'.format(window_id))
    image = Quartz.CGImageSourceCreateWithURL(url, None)
    dest = Quartz.CGImageDestinationCreateWithURL(
        out_path, 'public.png', 1, None)
    Quartz.CGImageDestinationAddImage(dest, image, None)
    Quartz.CGImageDestinationFinalize(dest)


if __name__ == '__main__':
    if len(sys.argv) > 2 and sys.argv[1] == 'capture':
        capture(int(sys.argv[2]), sys.argv[3])
        print('captured window {} -> {}'.format(sys.argv[2], sys.argv[3]))
    else:
        for item in list_windows():
            if item['layer'] != 0:
                continue
            print('{id:>8}  {owner:<28} {name:<40} {bounds}'.format(**item))

"""Build the single-file demo.

    python3 build.py                 writes index.html next to this file
    python3 build.py check.js        also writes the combined script, for `node --check check.js`

Reads src/style.css, src/app.js, src/seed.js and src/logo.svg. All paths are relative to this
file, so it can be run from any folder.
"""
import base64
import os
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, 'src')


def read(name):
    with open(os.path.join(SRC, name), encoding='utf-8') as f:
        return f.read()


css = read('style.css')
seed = read('seed.js')
logo = base64.b64encode(read('logo.svg').strip().encode('utf-8')).decode('ascii')
js = read('app.js')
for token in ('/*__SEED__*/', '__LOGO__'):
    if token not in js:
        sys.exit('build.py: placeholder ' + token + ' not found in src/app.js')
js = js.replace('/*__SEED__*/', seed).replace('__LOGO__', logo)

html = (
    '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
    '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
    '<title>Northwind Security Partner Portal (demo)</title>\n'
    '<meta name="description" content="Clickable partner portal prototype: deal registration, '
    'three-step approvals, resources and commission tracking. Fictional sample data only.">\n'
    '<style>\n' + css + '\n</style>\n</head>\n<body>\n'
    '<div id="app"></div>\n<div id="toasts" class="toasts" aria-live="polite"></div>\n'
    '<script>\n' + js + '\n</script>\n</body>\n</html>\n'
)
out = os.path.join(ROOT, 'index.html')
with open(out, 'w', encoding='utf-8', newline='\n') as f:
    f.write(html)
if len(sys.argv) > 1:
    with open(sys.argv[1], 'w', encoding='utf-8', newline='\n') as f:
        f.write(js)
print('built index.html,', len(html), 'bytes')

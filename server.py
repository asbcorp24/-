#!/usr/bin/env python3
"""Local development server for STL Cosmic Morph v15. Python 3.10+, no dependencies."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlsplit, unquote
import argparse, json, os, uuid, re

ROOT = Path(__file__).resolve().parent
DATA = ROOT / 'projects' / 'default'
ASSETS = DATA / 'assets'
VERSION_RE = re.compile(r'^stl-morph-v(\d+)\.html$')

def latest_html():
    candidates = []
    for file in ROOT.iterdir():
        if file.is_file():
            match = VERSION_RE.fullmatch(file.name)
            if match:
                candidates.append((int(match.group(1)), file.name))
    return max(candidates)[1] if candidates else None

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def send_json(self, obj, status=200):
        raw = json.dumps(obj, ensure_ascii=False).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(raw)))
        self.send_header('Cache-Control', 'no-store')
        self.end_headers()
        self.wfile.write(raw)

    def read_body(self, maximum):
        try: length = int(self.headers.get('Content-Length', '0'))
        except ValueError: return None
        if length < 1 or length > maximum: return None
        return self.rfile.read(length)

    def do_GET(self):
        if urlsplit(self.path).path == '/api/project':
            path = DATA / 'project.json'
            if not path.exists(): return self.send_json({'error': 'Проект ещё не сохранён'}, 404)
            try: return self.send_json(json.loads(path.read_text(encoding='utf-8')))
            except (OSError, ValueError): return self.send_json({'error': 'Повреждённый JSON'}, 500)
        if urlsplit(self.path).path == '/':
            latest = latest_html()
            if latest is None:
                return self.send_json({'error': 'Файлы stl-morph-vN.html не найдены'}, 404)
            self.path = '/' + latest
        return super().do_GET()

    def do_POST(self):
        path = urlsplit(self.path).path
        if path == '/api/upload':
            name = unquote(self.headers.get('X-Filename', ''))
            suffix = Path(name).suffix.lower()
            if suffix not in {'.stl', '.png', '.jpg', '.jpeg', '.webp'}:
                return self.send_json({'error': 'Допустимы STL, PNG, JPG, WEBP'}, 400)
            data = self.read_body(100 * 1024 * 1024)
            if data is None: return self.send_json({'error': 'Неверный размер файла (максимум 100 МБ)'}, 413)
            ASSETS.mkdir(parents=True, exist_ok=True)
            filename = uuid.uuid4().hex + suffix
            (ASSETS / filename).write_bytes(data)
            return self.send_json({'url': '/projects/default/assets/' + filename, 'name': name})
        if path == '/api/project':
            data = self.read_body(2 * 1024 * 1024)
            if data is None: return self.send_json({'error': 'JSON слишком большой'}, 413)
            try: obj = json.loads(data)
            except ValueError: return self.send_json({'error': 'Неверный JSON'}, 400)
            if not isinstance(obj, dict) or obj.get('version') != 1 or not isinstance(obj.get('models'), list):
                return self.send_json({'error': 'Неверная структура проекта'}, 400)
            if len(obj['models']) > 500: return self.send_json({'error': 'Слишком много моделей'}, 400)
            for model in obj['models']:
                if not isinstance(model, dict) or not isinstance(model.get('url'), str):
                    return self.send_json({'error': 'Неверная модель'}, 400)
                photos = model.get('photos', [])
                if not isinstance(photos, list) or len(photos) > 4:
                    return self.send_json({'error': 'Допустимо до 4 фото на модель'}, 400)
                for p in [model['url'], *photos]:
                    if not isinstance(p, str) or not p.startswith('/projects/default/assets/') or not (ROOT / p.lstrip('/')).is_file():
                        return self.send_json({'error': 'Сначала загрузите файлы на сервер'}, 400)
            DATA.mkdir(parents=True, exist_ok=True)
            temp = DATA / ('project-' + uuid.uuid4().hex + '.tmp')
            temp.write_text(json.dumps(obj, ensure_ascii=False, indent=2), encoding='utf-8')
            os.replace(temp, DATA / 'project.json')
            return self.send_json({'ok': True, 'path': '/projects/default/project.json'})
        return self.send_json({'error': 'Неизвестный API'}, 404)

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, default=8000)
    args = parser.parse_args()
    print(f'Open http://127.0.0.1:{args.port}/')
    ThreadingHTTPServer(('127.0.0.1', args.port), Handler).serve_forever()
)

def latest_html():
    candidates = []
    for file in ROOT.iterdir():
        if file.is_file():
            match = VERSION_RE.fullmatch(file.name)
            if match:
                candidates.append((int(match.group(1)), file.name))
    return max(candidates)[1] if candidates else None


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def send_json(self, obj, status=200):
        raw = json.dumps(obj, ensure_ascii=False).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(raw)))
        self.send_header('Cache-Control', 'no-store')
        self.end_headers()
        self.wfile.write(raw)

    def read_body(self, maximum):
        try: length = int(self.headers.get('Content-Length', '0'))
        except ValueError: return None
        if length < 1 or length > maximum: return None
        return self.rfile.read(length)

    def do_GET(self):
        if urlsplit(self.path).path == '/api/project':
            path = DATA / 'project.json'
            if not path.exists(): return self.send_json({'error': 'Проект ещё не сохранён'}, 404)
            try: return self.send_json(json.loads(path.read_text(encoding='utf-8')))
            except (OSError, ValueError): return self.send_json({'error': 'Повреждённый JSON'}, 500)
        if urlsplit(self.path).path == '/': self.path = '/stl-morph-v16.html'
        return super().do_GET()

    def do_POST(self):
        path = urlsplit(self.path).path
        if path == '/api/upload':
            name = unquote(self.headers.get('X-Filename', ''))
            suffix = Path(name).suffix.lower()
            if suffix not in {'.stl', '.png', '.jpg', '.jpeg', '.webp'}:
                return self.send_json({'error': 'Допустимы STL, PNG, JPG, WEBP'}, 400)
            data = self.read_body(100 * 1024 * 1024)
            if data is None: return self.send_json({'error': 'Неверный размер файла (максимум 100 МБ)'}, 413)
            ASSETS.mkdir(parents=True, exist_ok=True)
            filename = uuid.uuid4().hex + suffix
            (ASSETS / filename).write_bytes(data)
            return self.send_json({'url': '/projects/default/assets/' + filename, 'name': name})
        if path == '/api/project':
            data = self.read_body(2 * 1024 * 1024)
            if data is None: return self.send_json({'error': 'JSON слишком большой'}, 413)
            try: obj = json.loads(data)
            except ValueError: return self.send_json({'error': 'Неверный JSON'}, 400)
            if not isinstance(obj, dict) or obj.get('version') != 1 or not isinstance(obj.get('models'), list):
                return self.send_json({'error': 'Неверная структура проекта'}, 400)
            if len(obj['models']) > 500: return self.send_json({'error': 'Слишком много моделей'}, 400)
            for model in obj['models']:
                if not isinstance(model, dict) or not isinstance(model.get('url'), str):
                    return self.send_json({'error': 'Неверная модель'}, 400)
                photos = model.get('photos', [])
                if not isinstance(photos, list) or len(photos) > 4:
                    return self.send_json({'error': 'Допустимо до 4 фото на модель'}, 400)
                for p in [model['url'], *photos]:
                    if not isinstance(p, str) or not p.startswith('/projects/default/assets/') or not (ROOT / p.lstrip('/')).is_file():
                        return self.send_json({'error': 'Сначала загрузите файлы на сервер'}, 400)
            DATA.mkdir(parents=True, exist_ok=True)
            temp = DATA / ('project-' + uuid.uuid4().hex + '.tmp')
            temp.write_text(json.dumps(obj, ensure_ascii=False, indent=2), encoding='utf-8')
            os.replace(temp, DATA / 'project.json')
            return self.send_json({'ok': True, 'path': '/projects/default/project.json'})
        return self.send_json({'error': 'Неизвестный API'}, 404)

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, default=8000)
    args = parser.parse_args()
    print(f'Open http://127.0.0.1:{args.port}/')
    ThreadingHTTPServer(('127.0.0.1', args.port), Handler).serve_forever()

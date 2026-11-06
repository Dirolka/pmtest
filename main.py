"""Локальный сайт с тестами. Запустите этот файл в PyCharm."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import argparse
import webbrowser
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parent


class TestHandler(SimpleHTTPRequestHandler):
    def translate_path(self, path):
        translated = Path(super().translate_path(path)).resolve()
        if not any(translated.is_relative_to(ROOT / folder) for folder in ('static', 'picture')):
            return str(ROOT / 'static' / '__not_found__')
        return str(translated)

    def do_GET(self):
        if self.path.split('?')[0] == '/':
            self.path = '/static/index.html'
        # Serve only the website and the original photographs.
        path = unquote(urlsplit(self.path).path)
        if '..' in Path(path).parts or not path.startswith(('/static/', '/picture/')):
            self.send_error(404)
            return
        super().do_GET()


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Тренажёр Project Management')
    parser.add_argument('--port', type=int, default=8000)
    parser.add_argument('--no-browser', action='store_true')
    args = parser.parse_args()
    handler = partial(TestHandler, directory=str(ROOT))
    try:
        server = ThreadingHTTPServer(('127.0.0.1', args.port), handler)
    except OSError as exc:
        raise SystemExit(f'Не удалось открыть порт {args.port}. Используйте --port 8001. {exc}')
    url = f'http://127.0.0.1:{args.port}'
    print(f'Тест открыт: {url}\nОстановка: Ctrl+C', flush=True)
    if not args.no_browser:
        webbrowser.open(url)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()

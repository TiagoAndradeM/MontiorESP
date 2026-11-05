"""Verificações HTTP do servidor estático usando somente a biblioteca padrão."""

import importlib.util
import json
from pathlib import Path
from threading import Thread
import unittest
from urllib.error import HTTPError
from urllib.request import urlopen


RAIZ = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location("servidor_interface", RAIZ / "scripts" / "servir-interface.py")
modulo = importlib.util.module_from_spec(spec)
spec.loader.exec_module(modulo)


class TestServidorInterface(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.servidor = modulo.criar_servidor(port=0)
        cls.thread = Thread(target=cls.servidor.serve_forever, kwargs={"poll_interval": 0.05}, daemon=True)
        cls.thread.start()
        cls.url = f"http://127.0.0.1:{cls.servidor.server_address[1]}"
        cls.addClassCleanup(cls.encerrar_servidor)

    @classmethod
    def encerrar_servidor(cls):
        cls.servidor.shutdown()
        cls.servidor.server_close()
        cls.thread.join(timeout=2)
        if cls.thread.is_alive():
            raise AssertionError("A thread do servidor de teste não encerrou.")

    def receber(self, caminho):
        with urlopen(self.url + caminho, timeout=3) as resposta:
            self.assertEqual(resposta.status, 200)
            self.assertEqual(resposta.headers["Cache-Control"], "no-store")
            return resposta.headers.get_content_type(), resposta.read()

    def test_html_da_interface(self):
        tipo, conteudo = self.receber("/")
        self.assertEqual(tipo, "text/html")
        self.assertEqual(conteudo, (RAIZ / "interface" / "index.html").read_bytes())
        self.assertIn(b"<title>MONITOR SONORO</title>", conteudo)

    def test_modulo_javascript_com_mime_explicito(self):
        tipo, conteudo = self.receber("/js/app.js")
        self.assertEqual(tipo, "text/javascript")
        self.assertEqual(conteudo, (RAIZ / "interface" / "js" / "app.js").read_bytes())

    def test_contrato_json(self):
        tipo, conteudo = self.receber("/contratos/telemetria.schema.json")
        self.assertEqual(tipo, "application/json")
        esperado = json.loads((RAIZ / "interface" / "contratos" / "telemetria.schema.json").read_text(encoding="utf-8"))
        self.assertEqual(json.loads(conteudo), esperado)

    def test_nao_publica_a_raiz_do_repositorio(self):
        with self.assertRaises(HTTPError) as erro:
            urlopen(self.url + "/AGENTS.md", timeout=3)
        self.assertEqual(erro.exception.code, 404)
        self.assertEqual(erro.exception.headers["Cache-Control"], "no-store")
        erro.exception.close()

    def test_porta_ocupada_nao_cria_outro_servidor(self):
        with self.assertRaises(OSError):
            with modulo.criar_servidor(port=self.servidor.server_address[1]):
                pass


if __name__ == "__main__":
    unittest.main()

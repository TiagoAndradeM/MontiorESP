"""Servidor local da interface simulada, sem dependências externas."""

import argparse
import errno
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import socket
import sys


PASTA_INTERFACE = Path(__file__).resolve().parent.parent / "interface"
HOST = "127.0.0.1"


class HandlerInterface(SimpleHTTPRequestHandler):
    extensions_map = {
        **SimpleHTTPRequestHandler.extensions_map,
        ".js": "text/javascript",
        ".mjs": "text/javascript",
        ".json": "application/json",
    }

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


class ServidorInterface(ThreadingHTTPServer):
    # Evita dois servidores respondendo pela mesma porta no Windows.
    allow_reuse_address = False

    def server_bind(self):
        if hasattr(socket, "SO_EXCLUSIVEADDRUSE"):
            self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_EXCLUSIVEADDRUSE, 1)
        super().server_bind()


def criar_servidor(port=8000):
    handler = partial(HandlerInterface, directory=str(PASTA_INTERFACE))
    return ServidorInterface((HOST, port), handler)


def porta_cli(valor):
    try:
        porta = int(valor)
    except ValueError as erro:
        raise argparse.ArgumentTypeError("A porta deve ser um número de 0 a 65535.") from erro
    if not 0 <= porta <= 65535:
        raise argparse.ArgumentTypeError("A porta deve estar entre 0 e 65535.")
    return porta


def main(argv=None):
    parser = argparse.ArgumentParser(description="Abrir o servidor local do MONITOR SONORO.")
    parser.add_argument("--port", type=porta_cli, default=8000,
                        help="porta local (padrão: 8000; 0 escolhe uma porta livre)")
    args = parser.parse_args(argv)
    if not (PASTA_INTERFACE / "index.html").is_file():
        print(f"Não encontrei a interface em: {PASTA_INTERFACE}", file=sys.stderr)
        return 1
    try:
        servidor = criar_servidor(args.port)
    except OSError as erro:
        if erro.errno == errno.EADDRINUSE or getattr(erro, "winerror", None) in (10048, 10013):
            print(f"Não foi possível iniciar: a porta {args.port} está ocupada ou indisponível.\n"
                  "Nenhum outro servidor foi encerrado. Escolha outra porta, por exemplo:\n"
                  "python -B scripts/servir-interface.py --port 8001", file=sys.stderr)
        else:
            print(f"Não foi possível iniciar o servidor local: {erro}", file=sys.stderr)
        return 1

    with servidor:
        porta = servidor.server_address[1]
        print(f"MONITOR SONORO disponível em http://{HOST}:{porta}/", flush=True)
        print("Esta janela precisa ficar aberta enquanto você usa a interface.", flush=True)
        print("Para encerrar o servidor, pressione Ctrl+C.", flush=True)
        try:
            servidor.serve_forever()
        except KeyboardInterrupt:
            print("\nServidor encerrado.", flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

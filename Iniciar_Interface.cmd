@echo off
setlocal
cd /d "%~dp0"
python -B "scripts\servir-interface.py"
if errorlevel 1 (
  echo.
  echo Nao foi possivel iniciar a interface. Confira a mensagem acima e a instalacao do Python 3.
  echo Pressione qualquer tecla para fechar esta janela.
  pause >nul
  exit /b 1
)

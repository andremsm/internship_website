"""
COMPILE (actually, freeze):
	PYINSTALLER:
	pyinstaller .\ods_to_json_gui.pyw --clean --name 'Update Server' --add-data './img;img.' --add-data './config;config.' --add-data './audio;audio.' --add-data './log;log.' --icon=icon.ico --contents-directory 'python'

IMPORTANTE
10/11/2023:
Pyinstaller gera um diretório que contém tudo, incluindo os diretórios
adicionados com --add-data. Isso quebra a execução do programa, então
após freezar o programa é necessário puxar esses subdiretórios para o
mesmo diretório do executável:
audio, config, img, log

Pode ser que em versões futuras do pyinstaller isso mude, mas até a
data acima não encontrei uma alternativa mais simples.

24/11/2023:
Fiz um script compile.py pra fazer isso tudo automaticamente.
"""

from src_utils.utils_logging import log_except_hook

from PySide6.QtWidgets import QApplication

from MainWindow import MainWindow

import logging
import sys
import os


if __name__ == "__main__":
	sys.excepthook = log_except_hook

	if not os.path.exists("./log"):
		os.makedirs("./log")

	logging.basicConfig(
		filename="./log/exceptions.log",
		filemode="a",
		format="%(asctime)s,%(msecs)d %(name)s %(levelname)s %(message)s",
		datefmt="%Y-%m-%d %H:%M:%S",
		level=logging.DEBUG,
	)

	# Create the Qt Application
	app = QApplication(sys.argv)

	# Create and show the form
	main_window = MainWindow()
	main_window.show()

	# Run the main Qt loop
	sys.exit(app.exec())

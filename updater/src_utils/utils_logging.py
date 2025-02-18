from PySide6.QtMultimedia import QAudioOutput, QMediaPlayer
from PySide6.QtWidgets import QMessageBox
from PySide6.QtGui import QIcon, QPixmap
from PySide6.QtCore import QUrl

import traceback
import datetime
import logging
import os


def log_except_hook(*exc_info):
	"""
	Exceções desconhecidas de forma geral.
	-

	---
	Mostra um popup avisando que algo inesperado aconteceu,
	e anota o que ocorreu em um arquivo log.

	Um efeito colateral não intencional que pode ser útil no
	futuro é que o log também registra as conexões realizadas
	por ssh.

	---
	Se você quiser testar isso, a forma mais fácil é acrescentar
	uma divisão por zero em algum lugar em uma função que ocorra
	após apertar um botão.

	"""
	# Antes de anotar o erro, verifica a última data onde ocorreu
	# uma anotação, para acrescentar um separador.
	with open(r"./log/exceptions.log", "r") as logs:
		lines = logs.readlines()
		num_lines = len(lines)
		i = num_lines - 1
		while "root ERROR" not in lines[i]:
			i -= 1
		last_date_line = lines[i]
		last_date = last_date_line.split()[0]

	current_date = datetime.datetime.now().strftime("%Y-%m-%d")

	# Essa função logging pode criar vários tipos de log,
	# no exemplo abaixo é um log do tipo INFO.
	if last_date != current_date:
		logging.info(
			"=======================================================================\n"
		)

	# Já aqui é um log do tipo ERROR. O paramiko gera vários
	# logs do tipo debug, relacionados às conexões ssh. Isso
	# pode ser desabilitado mas achei que poderia ser útil
	# futuramente.
	text = "".join(traceback.format_exception(*exc_info))
	logging.error("Unhandled exception: %s", text)

	Windows_XP_Critical_Stop_wav = QUrl.fromLocalFile("audio/Windows_XP_Critical_Stop.wav")

	windowsXP_critical_stop = QMediaPlayer()
	windowsXP_critical_stop_audio_output = QAudioOutput()
	windowsXP_critical_stop.setAudioOutput(windowsXP_critical_stop_audio_output)

	windowsXP_critical_stop_audio_output.setVolume(100)

	windowsXP_critical_stop.setSource(Windows_XP_Critical_Stop_wav)

	file_path_short = (
		f".../<strong>{os.path.basename(os.getcwd())}</strong>\\log\\exceptions.log".replace(
			"\\", "/"
		)
	)

	folders_string = "<p style='font-size:14px; white-space: pre; line-height:0.25;'>        ??????????????????????????????                        </p>"
	folders_string += f"<p style='font-size:14px; white-space: pre;'>        Error message: {exc_info[1]}</p>"
	folders_string += f"<p style='font-size:14px; line-height:0.25; white-space: pre;'>        Para mais informações veja o log:</p>"
	folders_string += (
		f"<p style='font-size:14px; white-space: pre;'>        {file_path_short}</p>"
	)

	msgBox = QMessageBox()
	app_icon = QIcon("img/icon.png")
	hoovy = QPixmap("img/hoovy.png")
	msgBox.setWindowIcon(app_icon)
	windowsXP_critical_stop.play()
	msgBox.setIconPixmap(hoovy)

	buttonCancel = msgBox.addButton("OK", QMessageBox.AcceptRole)
	msgBox.setDefaultButton(buttonCancel)
	msgBox.setWindowTitle("?????????????????????????????????????")

	msgBox.setText("<font size = 5> Erro desconhecido </font>")
	msgBox.setInformativeText(folders_string)

	msgBox.exec()

from PySide6.QtWidgets import (
	QHBoxLayout,
	QMessageBox,
	QPushButton,
	QVBoxLayout,
	QLineEdit,
	QDialog,
	QLabel,
)
from PySide6.QtMultimedia import QAudioOutput, QMediaPlayer
from PySide6.QtGui import QColor, QIcon, QPainter, Qt
from paramiko import SSHException
from PySide6.QtCore import QUrl
from fabric import Connection
import sys


class LoginDialog(QDialog):
	"""
	Popup de login.

	---

	#### LoginDialog.exec()
	Mostra o popup de login.
	#### LoginDialog.username_edit.text()
	Retorna login.
	#### LoginDialog.password_edit.text()
	Retorna senha.

	---

	A maior parte disso foi escrita pelo chatgpt
	"""

	def __init__(self, parent=None):
		super(LoginDialog, self).__init__(parent)

		self.app_icon = QIcon("img/icon.png")

		Windows_XP_Critical_Stop_wav = QUrl.fromLocalFile(
			"audio/Windows_XP_Critical_Stop.wav"
		)

		self.windowsXP_critical_stop = QMediaPlayer()
		self.windowsXP_critical_stop_audio_output = QAudioOutput()
		self.windowsXP_critical_stop.setAudioOutput(self.windowsXP_critical_stop_audio_output)

		self.windowsXP_critical_stop_audio_output.setVolume(100)

		self.windowsXP_critical_stop.setSource(Windows_XP_Critical_Stop_wav)

		self.setWindowTitle("Login")
		self.setGeometry(200, 200, 300, 150)

		self.username_label = QLabel("Usuário")
		self.username_edit = QLineEdit()
		self.username_label.setAlignment(Qt.AlignCenter)
		self.username_edit.setAlignment(Qt.AlignCenter)  # Center text

		self.password_label = QLabel("Senha")
		self.password_edit = QLineEdit()
		self.password_edit.setEchoMode(QLineEdit.Password)
		self.password_label.setAlignment(Qt.AlignCenter)
		self.password_edit.setAlignment(Qt.AlignCenter)  # Center text

		self.login_button = QPushButton("Login")
		self.login_button.setFixedSize(80, 30)  # Set a fixed size for the button
		self.login_button.clicked.connect(self.accept)
		self.login_button.setEnabled(False)  # Disable the button initially

		# Connect textChanged signals to the update_button_state slot
		self.username_edit.textChanged.connect(self.update_button_state)
		self.password_edit.textChanged.connect(self.update_button_state)

		# Create a vertical layout for the entire dialog
		layout = QVBoxLayout()
		layout.addWidget(self.username_label)
		layout.addWidget(self.username_edit)
		layout.addWidget(self.password_label)
		layout.addWidget(self.password_edit)

		# Add spacing between password input and button
		layout.addSpacing(10)

		# Create a horizontal layout for the login button
		button_layout = QHBoxLayout()
		button_layout.addStretch()  # Add stretchable space before the button
		button_layout.addWidget(self.login_button)
		button_layout.addStretch()  # Add stretchable space after the button

		# Add the button layout to the main layout
		layout.addLayout(button_layout)

		self.setLayout(layout)

		self.setFixedSize(230, 175)

	def update_button_state(self):
		"""
		Habilitar o botão se ambos inputs possuírem texto
		"""
		username_text = self.username_edit.text()
		password_text = self.password_edit.text()
		self.login_button.setEnabled(bool(username_text) and bool(password_text))

	def paintEvent(self, event):
		"""
		Pinta o fundo de branco (por algum motivo o padrão
		é cinza).
		"""
		painter = QPainter(self)
		painter.setBrush(
			QColor(255, 255, 255)
		)  # White color (adjust RGB values as per your preference)
		painter.drawRect(self.rect())

	def keyPressEvent(self, event):
		"""
		Aceita o input se enter for pressionado, ou rejeita se ESC for
		pressionado.
		"""
		if event.key() == Qt.Key_Return or event.key() == Qt.Key_Enter:
			if self.login_button.isEnabled():
				self.accept()
		if event.key() == Qt.Key_Escape:
			self.reject()

	def accept(self):
		"""
		Testa login e senha antes de fechar o formulário.
		"""
		c = Connection(
			host="cosi.mppr",
			user=self.username_edit.text(),
			connect_kwargs={"password": self.password_edit.text()},
		)
		try:
			hide = False
			# Se sys.prefix == sys.base_prefix então não está em um venv.
			if sys.prefix == sys.base_prefix:
				hide = True
			# Não altere
			result = c.run("echo sandwich", pty=True, in_stream=False, hide=hide)
			super(LoginDialog, self).accept()
		except SSHException:
			self.windowsXP_critical_stop.play()

			msgBox = QMessageBox()
			msgBox.setWindowIcon(self.app_icon)
			error_string = "<font size = 5> Login ou senha incorretos. </font>"
			# Não altere
			msgBox.critical(msgBox, "Doo Yooh rhemnmmembhur vodka", error_string)
		finally:
			c.close()

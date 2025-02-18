from PySide6.QtWidgets import (
	QGridLayout,
	QMainWindow,
	QMessageBox,
	QPushButton,
	QSizePolicy,
	QSpacerItem,
	QDialog,
	QWidget,
	QStyle,
)

from src_utils.utils_tarfile import make_tarfile, extract_tarfile
from src_utils.utils_format import format_date, format_semester

from PySide6.QtMultimedia import QAudioOutput, QMediaPlayer
from PySide6.QtGui import QColor, QIcon, QPainter, Qt
from PySide6.QtCore import QCoreApplication, QUrl

from src_utils.utils_random import get_nth_key

from pandas_ods_reader import read_ods

from LoginDialog import LoginDialog

from fabric import Connection
from invoke import Responder

from PIL import Image

import datetime
import pathlib
import shutil
import json
import time
import sys
import os


class MainWindow(QMainWindow):
	# Eu queria que esse texto aparecesse ao dar hover no MainWindow no main,
	# mas pra isso acontecer precisa colocar isso embaixo do __init__, e não
	# me parece fazer muito sentido uma descrição da classe embaixo de um
	# método.
	# Me parece ser um bug do VS Code porque dar hover no MainWindow acima
	# mostra o texto correto, e na parte que cria um LoginDialog também.
	"""
	Janela principal do programa.
	---

	Métodos:

	---

	extrair_planilha(): Lê a planilha e insere as informações nas
	estruturas de dados.

	---

	diretorios_existentes(): Lista os diretórios em /output/img/curso/

	---

	cursos_existentes(): Lista os cursos em /output/img/curso/

	---

	remover_diretorios(): Remove os diretórios que não aparecem em self.cursos

	---

	criar_diretorios():	Cria diretórios para JSON e imagens.

	---

	atualizar_imagens(): Verifica diretórios vazios e comprime imagens.

	---

	criar_json(): Exporta as informações para um JSON.

	---

	atualizar_servidor(): Envia um .tar.gz para o servidor e executa o
	script no servidor.

	---

	import_backup(): Traz um .tar.gz do servidor que contém um backup
	dos JSONs e imagens, e o extrai.

	---

	audio_mute(): Mutar ou desmutar o áudio.

	---

	setup_config(): Busca informações de configuração em config.json.

	---

	setup_audio(): Inicializa o áudio.

	---

	update_audio_sources(): Redefinir o áudio como mudo ou não.

	---

	setup_data_structs(): Inicializa estruturas de dados.

	---

	setup_layout(): Inicializa o layout da interface de usuário.

	---

	setup_buttons(): Conecta os botões às funções.

	---

	paintEvent(): Evento que muda a cor de fundo.

	---

	keyPressEvent(): Evento que detecta que ESC foi pressionado.

	---

	closeEvent(): Evento que fecha o programa.

	---

	parallel_update_audio_button(): Obsoleto.
	"""

	def __init__(self):
		"""
		Inicializa a configuração, estruturas de dados,
		layout, áudio, e botões do programa.
		"""
		super(MainWindow, self).__init__()

		self.setup_config()
		self.setup_data_structs()
		self.setup_layout()
		self.setup_audio()
		self.setup_buttons()

	def extrair_planilha(self):
		"""
		Lê a planilha linha por linha e insere as informações nas
		estruturas de dados relevantes.

		Também faz algumas verificações de erros que eu consegui
		prever.
		"""
		if self.button_extrair_planilha.isEnabled():
			self.cursos = []
			self.cdis = {}
			self.name_dict = {}
			self.datetime = datetime.datetime.now().strftime("%Y-%m-%d_%H%M")
			self.folha_ods = read_ods(self.path_to_ods, 1, headers=True)

			name_list = []
			curso_atual = self.folha_ods.iloc[0][0].strip()
			data_atual = self.folha_ods.iloc[0][2]
			self.cursos.append(curso_atual)

			# Essas informações estão disponíveis imediatamente,
			# exceto o número de participantes, que precisa ser
			# calculado.
			if self.folha_ods.iloc[0][4]:
				instrutor = self.folha_ods.iloc[0][4].strip()
			if self.folha_ods.iloc[0][5]:
				semestre = self.folha_ods.iloc[0][5]
			if self.folha_ods.iloc[0][6]:
				noticia = self.folha_ods.iloc[0][6]
			self.cdis[curso_atual] = {
				"Data": data_atual,
				"Instrutor": instrutor,
				"Semestre": semestre,
				"Noticia": noticia,
				"NumeroParticipantes": 0,
			}

			# Esse índice serve para mostrar em qual linha
			# ocorreu o erro.
			index = 1

			# Usado no get_nth_key()
			j = 0

			# Caso seja encontrado um participante sem nome.
			# Inicia em dois pois o índice da planilha começa
			# em 1, que é o cabeçalho
			k = 2

			erro_nomes = []

			for i in self.folha_ods.iloc:
				index += 1
				# Novo curso encontrado
				if i[0].strip() != curso_atual:
					self.cursos.append(i[0].strip())
				# Ainda é o mesmo curso
				if i[0].strip() == curso_atual:
					# Se for o mesmo curso com data diferente
					# da anterior, aborta e mostra o erro.
					if i[2] != data_atual:
						folders_string = "<font size = 5> Erro: </font>"
						folders_string += (
							"<font size = 5> Datas diferentes encontradas para um mesmo curso. </font>"
						)
						folders_string += "<p style='font-size:14px; line-height:0.25;'>&#9;</p>"
						folders_string += "<font size = 4> Possíveis causas: </font>"
						folders_string += "<p style='font-size:14px; line-height:0.25; white-space: pre;'>        Data incorreta</p>"
						folders_string += "<p style='font-size:14px; line-height:0.25; white-space: pre;'>        Curso com o mesmo nome de outro encontrado</p>"
						folders_string += "<p style='font-size:14px; line-height:1; white-space: pre;'>        Ordenação da planilha alterada</p>"
						folders_string += "<p style='font-size:14px; line-height:1;'>&#9;</p>"
						folders_string += "<p style='font-size:14px; line-height:1;'>Caso o problema seja o último, lembre que a ordem mais importante é data, seguida do nome do curso</p>"
						folders_string += (
							"<p style='font-size:14px; line-height:0.25; white-space: pre;'>&#9;</p>"
						)
						folders_string += "<p style='font-size:14px; line-height:0.25;'>&#9;</p>"
						folders_string += (
							f"<p style='font-size:14px; line-height:0.25;'>Local do erro: linha {index}</p>"
						)
						folders_string += "<p style='font-size:14px; line-height:0.25;'>&#9;</p>"

						msgBox = QMessageBox()
						msgBox.setWindowIcon(self.app_icon)
						self.windowsXP_critical_stop.play()
						msgBox.critical(msgBox, "Datas diferentes encontradas", folders_string)

						self.button_criar_diretorios.setEnabled(False)
						self.button_atualizar_imagens.setEnabled(False)
						self.button_criar_json.setEnabled(False)
						self.button_atualizar_servidor.setEnabled(False)

						return
					# Caso contrário, extrai as demais informações.
					# Aqui, nome e unidade precisam ser inicializados
					# como string vazia pois podem estar em branco na
					# planilha.
					nome = ""
					unidade = ""

					# Caso não possua nome, acrescenta à lista de
					# participantes sem nomes (gera erro posteriormente).
					if i[1]:
						nome = i[1].strip()
					else:
						erro_nomes.append(k)

					# Unidade não precisa necessariamente existir.
					if i[3]:
						unidade = i[3].strip()
					name_list.append({"Nome": nome, "Unidade": unidade})

				# Caso seja um novo curso, então pode-se atualizar
				# o que faltava (lista de participantes, número de
				# participantes)
				else:
					self.name_dict[curso_atual] = name_list
					curso_atual = i[0].strip()
					data_atual = i[2]
					self.cdis[curso_atual] = {
						"Data": data_atual,
						"Instrutor": i[4].strip(),
						"Semestre": i[5],
						"Noticia": i[6],
					}

					# Atualizar o número de participantes é um pouco
					# complicado porque o cdis é ordenado pela inserção
					# ao invés de números, então precisa dessa função
					# abaixo. Precisa estar dentro desse try-except porque
					# pode crashar, e não tenho certeza se vai ser sempre
					# a mesma razão (cursos com nomes iguais encontrados).
					try:
						self.cdis[get_nth_key(self.cdis, j)]["NumeroParticipantes"] = len(name_list)
					except:
						folders_string = "<font size = 5> Erro: </font>"
						folders_string += "<font size = 5> Cursos com nomes iguais encontrados. </font>"
						folders_string += "<p style='font-size:14px; line-height:0.25;'>&#9;</p>"
						folders_string += f"<p style='font-size:14px; line-height:1;'>(eu não tenho certeza se essa vai ser a causa do erro em 100% dos casos, mas nos meus testes só apareceu nesses casos)</p>"
						folders_string += f"<p style='font-size:14px; line-height:1;'>Essa exceção foi levantada durante a análise desse curso: <strong>{curso_atual}</strong></p>"
						folders_string += f"<p style='font-size:14px; line-height:1;'>Essa exceção foi levantada ao chegar nessa linha: <strong>{index}</strong></p>"
						folders_string += f"<p style='font-size:14px; line-height:1;'>Mas note que <strong>provavelmente</strong> outros cursos estão incorretos.</p>"
						folders_string += "<p style='font-size:14px; line-height:0.25;'>&#9;</p>"

						msgBox = QMessageBox()
						msgBox.setWindowIcon(self.app_icon)
						self.windowsXP_critical_stop.play()
						msgBox.critical(
							msgBox,
							"Cursos com nomes iguais encontrados",
							folders_string,
						)

						self.button_criar_diretorios.setEnabled(False)
						self.button_atualizar_imagens.setEnabled(False)
						self.button_criar_json.setEnabled(False)
						self.button_atualizar_servidor.setEnabled(False)

						return
					j += 1

					# Uma nova lista precisa ser criada para armazenar
					# os nomes.
					name_list = []

					# Aqui, nome e unidade precisam ser inicializados
					# como string vazia pois podem estar em branco na
					# planilha.
					nome = ""
					unidade = ""

					# Caso não possua nome, acrescenta à lista de
					# participantes sem nomes (gera erro posteriormente).
					if i[1]:
						nome = i[1].strip()
					else:
						erro_nomes.append(k)

					# Unidade não precisa necessariamente existir.
					if i[3]:
						unidade = i[3].strip()
					name_list.append({"Nome": nome, "Unidade": unidade})
				k += 1
			self.name_dict[curso_atual] = name_list

			# Atualizar o número de participantes é um pouco complicado
			# porque o cdis é ordenado pela inserção ao invés de números,
			# então precisa dessa função abaixo. Precisa estar dentro
			# desse try-except porque pode crashar, e não tenho certeza
			# se vai ser sempre a mesma razão (cursos com nomes iguais
			# encontrados).
			try:
				self.cdis[get_nth_key(self.cdis, j)]["NumeroParticipantes"] = len(name_list)
			except:
				folders_string = "<font size = 5> Erro: </font>"
				folders_string += "<font size = 5> Cursos com nomes iguais encontrados. </font>"
				folders_string += "<p style='font-size:14px; line-height:0.25;'>&#9;</p>"
				folders_string += f"<p style='font-size:14px; line-height:1;'>(eu não tenho certeza se essa vai ser a causa do erro em 100% dos casos, mas nos meus testes só apareceu nesses casos)</p>"
				folders_string += f"<p style='font-size:14px; line-height:1;'>Essa exceção foi levantada ao chegar nessa linha: <strong>{index}</strong></p>"
				folders_string += f"<p style='font-size:14px; line-height:1;'>Mas note que <strong>provavelmente</strong> outros cursos estão incorretos.</p>"
				folders_string += f"<p style='font-size:14px; line-height:1;'>No caso desse erro o curso incorreto provavelmente é o último da planilha.</p>"
				folders_string += "<p style='font-size:14px; line-height:0.25;'>&#9;</p>"

				msgBox = QMessageBox()
				msgBox.setWindowIcon(self.app_icon)
				self.windowsXP_critical_stop.play()
				msgBox.critical(msgBox, "Cursos com nomes iguais encontrados", folders_string)

				self.button_criar_diretorios.setEnabled(False)
				self.button_atualizar_imagens.setEnabled(False)
				self.button_criar_json.setEnabled(False)
				self.button_atualizar_servidor.setEnabled(False)

				return

			# Verificação de erros quanto a participantes sem nome.
			if len(erro_nomes) == 1:
				folders_string = "<font size = 5> Erro: </font>"
				folders_string += "<font size = 5> Participante sem nome encontrado. </font>"
				folders_string += "<p style='font-size:14px; line-height:0.25;'>&#9;</p>"
				folders_string += f"<p style='font-size:14px; line-height:0.25; white-space: pre;'>Local do erro: linha {erro_nomes[0]}</p>"
				folders_string += "<p style='font-size:14px; line-height:0.25;'>&#9;</p>"

				msgBox = QMessageBox()
				msgBox.setWindowIcon(self.app_icon)
				self.windowsXP_critical_stop.play()
				msgBox.critical(msgBox, "Participante sem nome encontrado", folders_string)

				self.button_criar_diretorios.setEnabled(False)
				self.button_atualizar_imagens.setEnabled(False)
				self.button_criar_json.setEnabled(False)
				self.button_atualizar_servidor.setEnabled(False)

				return
			elif len(erro_nomes) > 1:
				folders_string = "<font size = 5> Erro: </font>"
				folders_string += "<font size = 5> Participantes sem nome encontrados. </font>"
				folders_string += "<p style='font-size:14px; line-height:0.25;'>&#9;</p>"
				folders_string += f"<p style='font-size:14px; line-height:1; white-space: pre;'>Locais dos erros:</p>"
				for i in erro_nomes:
					folders_string += f"<p style='font-size:14px; line-height:0.25; white-space: pre;'>        Linha: {i}</p>"
				folders_string += "<p style='font-size:14px; line-height:0.25;'>&#9;</p>"

				msgBox = QMessageBox()
				msgBox.setWindowIcon(self.app_icon)
				self.windowsXP_critical_stop.play()
				msgBox.critical(msgBox, "Participantes sem nome encontrados", folders_string)

				self.button_criar_diretorios.setEnabled(False)
				self.button_atualizar_imagens.setEnabled(False)
				self.button_criar_json.setEnabled(False)
				self.button_atualizar_servidor.setEnabled(False)

				return

			# Verificação de erros quanto a cursos com nomes
			# iguais.
			if len(self.cursos) != len(set(self.cursos)):
				cursos_multiplos = {}
				for i in self.cursos:
					if self.cursos.count(i) > 1:
						cursos_multiplos[i] = self.cursos.count(i)

				folders_string = "<font size = 5> Erro: </font>"
				folders_string += "<font size = 5> Cursos com nomes iguais encontrados. </font>"
				folders_string += (
					"<p style='font-size:14px; line-height:0.05; white-space: pre;'>&#9;</p>"
				)
				for name, value in cursos_multiplos.items():
					folders_string += f"<p style='font-size:14px; line-height:1; margin: -10px -10px -10px -10px;'>{name} ({value} ocorrências)</p>"
				folders_string += "<p style='font-size:14px; line-height:0.25;'>&#9;</p>"

				msgBox = QMessageBox()
				msgBox.setWindowIcon(self.app_icon)
				self.windowsXP_critical_stop.play()
				msgBox.critical(msgBox, "Cursos com nomes iguais encontrados", folders_string)

				self.button_criar_diretorios.setEnabled(False)
				self.button_atualizar_imagens.setEnabled(False)
				self.button_criar_json.setEnabled(False)
				self.button_atualizar_servidor.setEnabled(False)

				return

			# Se chegou aqui, tudo ok.
			folders_string = "<font size = 5> Informações extraídas: </font>"
			folders_string += f"<p style='font-size:14px; line-height:0.25; white-space: pre-wrap;'>        Informações extraídas sem gerar erro.        </p>"
			folders_string += f"<p style='font-size:14px; line-height:0.25;'>&#9;</p>"
			folders_string += f"<p style='font-size:14px; line-height:0.25;'>&#9;</p>"

			msgBox = QMessageBox()
			msgBox.setWindowIcon(self.app_icon)
			self.windowsXP_exclamation.play()
			msgBox.information(msgBox, "Informações extraídas", folders_string)

			self.button_criar_diretorios.setEnabled(True)
			self.button_atualizar_imagens.setEnabled(False)
			self.button_criar_json.setEnabled(False)
			self.button_atualizar_servidor.setEnabled(False)

	def diretorios_existentes(self):
		"""
		Retorna uma lista com os nomes dos diretórios existentes em
		#### ./output/img/curso/
		"""
		if not os.path.exists("./output/img/curso"):
			return []
		if len(os.listdir("./output/img/curso/")) == 0:
			return []

		d_existentes = []
		diretorios = os.listdir("./output/img/curso/")
		for diretorio in diretorios:
			d_existentes.append(diretorio)

		return d_existentes

	def cursos_existentes(self):
		"""
		Retorna uma lista com os nomes dos cursos existentes em
		#### ./output/img/curso/
		"""
		if not os.path.exists("./output/img/curso"):
			return []
		if len(os.listdir("./output/img/curso/")) == 0:
			return []

		c_existentes = []
		diretorios = os.listdir("./output/img/curso/")
		for diretorio in diretorios:
			c_existentes.append(diretorio.split("-", 1)[1].strip())

		return c_existentes

	def remover_diretorios(self):
		"""
		Remove os diretórios que não aparecem em self.cursos.
		"""
		for diretorio in self.diretorios_existentes():
			if diretorio.split("-", 1)[1].strip() not in self.cursos:
				if os.path.exists(f"./output/img/curso/{diretorio}"):
					shutil.rmtree(f"./output/img/curso/{diretorio}")
				if os.path.exists(f"./output/img/curso_compressed/{diretorio}"):
					shutil.rmtree(f"./output/img/curso_compressed/{diretorio}")

	def criar_diretorios(self):
		"""
		Com base no que foi extraído, cria diretórios para armazenar
		o JSON e as imagens referentes a cada curso.
		"""
		if self.button_criar_diretorios.isEnabled():
			# Excluir cursos que não aparecem na planilha
			self.remover_diretorios()

			# New_folders_flag serve para verificar se um ou mais diretórios foram
			# criados.
			new_folders_flag = 0
			new_folders = []

			if not os.path.exists("./output/json/"):
				os.makedirs("./output/json/")

			# Esse "i" é porque precisa colocar esses diretórios de imagens
			# comprimidas na mesma ordem em que os cursos ficam no json,
			# se não puxa os placeholders errados.
			i = 0

			# Verifica quais diretórios precisam ser criados, cria-os,
			# e acrescenta-os a uma lista.
			for curso in self.cursos:
				# Se o curso não foi encontrado
				if not os.path.exists("./output/img/curso/" + str(i) + " - " + curso + "/"):
					# Se o curso não existe (mesmo ignorando o índice i)
					if curso not in self.cursos_existentes():
						# Precisa ser criado
						os.makedirs("./output/img/curso/" + str(i) + " - " + curso + "/")
						new_folders.append(curso)
						new_folders_flag += 1
					else:
						# Caso contrário precisa-se atualizar o índice
						for diretorio in self.diretorios_existentes():
							if diretorio.split("-", 1)[1].strip() == curso:
								if os.path.exists(f"./output/img/curso/{diretorio}"):
									shutil.move(
										f"./output/img/curso/{diretorio}", f"./output/img/curso/{i} - {curso}"
									)
								if os.path.exists(f"./output/img/curso_compressed/{diretorio}"):
									shutil.move(
										f"./output/img/curso_compressed/{diretorio}",
										f"./output/img/curso_compressed/{i} - {curso}",
									)
				if not os.path.exists(
					"./output/img/curso_compressed/" + str(i) + " - " + curso + "/"
				):
					os.makedirs("./output/img/curso_compressed/" + str(i) + " - " + curso + "/")
				i += 1

			# Somente um diretório foi criado.
			if new_folders_flag == 1:
				folders_string = "<font size = 5> Novo diretório Criado: </font>"
				folders_string += (
					f"<p style='font-size:14px; line-height:0.25;'>&#9;{new_folders[0]}</p>"
				)
				folders_string += f"<p style='font-size:14px; line-height:0.25;'>&#9;</p>"
				folders_string += (
					f"<font size = 4> Adicione novas imagens ao diretório, caso seja necessário </font>"
				)
				folders_string += f"<p style='font-size:14px; line-height:0.25;'>&#9;</p>"

				msgBox = QMessageBox()
				msgBox.setWindowIcon(self.app_icon)
				self.windowsXP_exclamation.play()
				msgBox.information(msgBox, "Novo diretório criado", folders_string)

			# Mais de um diretório foi criado.
			elif new_folders_flag > 1:
				folders_string = "<font size = 5> Novos diretórios Criados: </font>"
				for folder in new_folders:
					folders_string += f"<p style='font-size:14px; line-height:0.25;'>&#9;{folder}</p>"
				folders_string += f"<p style='font-size:14px; line-height:0.25;'>&#9;</p>"
				folders_string += (
					f"<font size = 4> Adicione novas imagens aos diretórios, caso seja necessário </font>"
				)

				msgBox = QMessageBox()
				msgBox.setWindowIcon(self.app_icon)
				self.windowsXP_exclamation.play()
				msgBox.information(msgBox, "Novos diretórios criados", folders_string)

			# Nenhum diretório foi criado.
			else:
				folders_string = "<font size = 5> Novos diretórios Criados: </font>"
				folders_string += f"<p style='font-size:14px; line-height:0.25; white-space: pre-wrap;'>        Nenhum.        </p>"
				folders_string += f"<p style='font-size:14px; line-height:0.25;'>&#9;</p>"
				folders_string += f"<p style='font-size:14px; line-height:0.25;'>&#9;</p>"

				msgBox = QMessageBox()
				msgBox.setWindowIcon(self.app_icon)
				self.windowsXP_exclamation.play()
				msgBox.information(msgBox, "Novos diretórios criados", folders_string)

			self.button_atualizar_imagens.setEnabled(True)
			self.button_criar_json.setEnabled(False)
			self.button_atualizar_servidor.setEnabled(False)

	def atualizar_imagens(self):
		"""
		Verifica quais diretórios estão vazios, se deveriam estar
		vazios (denotado pelo arquivo DELETE_ME.property), e
		comprime as imagens necessárias.
		"""

		self.image_list = []
		empty_folders = []
		empty_folders_path = []

		# Verifica se 0, 1, ou mais diretórios estão sem imagens.
		flag = 0

		# O título de cada diretório é precedido por um número.
		i = 0

		for curso in self.cursos:
			# Não possui arquivos.
			if len(os.listdir("./output/img/curso/" + str(i) + " - " + curso + "/")) == 0:
				empty_folders.append(curso)

				empty_folders_path.append(
					f"{os.getcwd()}\\output\\img\\curso\\{i} - {curso}/".replace("\\", "/")
				)
				self.image_list.append([])
				flag += 1

			# Possui arquivos.
			else:
				temp = os.listdir("./output/img/curso/" + str(i) + " - " + curso + "/")
				# Possui um arquivo, que é o arquivo DELETE_ME.
				if len(temp) == 1 and temp[0] == "DELETE_ME.property":
					self.image_list.append([])
				# Possui um arquivo, que não é o arquivo DELETE_ME.
				elif len(temp) == 1 and temp[0] != "DELETE_ME.property":
					self.image_list.append(
						os.listdir("./output/img/curso/" + str(i) + " - " + curso + "/")
					)
				# Possui múltiplos arquivos.
				else:
					# Possui arquivo DELETE_ME, precisa excluí-lo.
					if "DELETE_ME.property" in temp:
						pathlib.Path.unlink(
							"./output/img/curso/" + str(i) + " - " + curso + "/DELETE_ME.property",
							missing_ok=True,
						)
					# Cria uma lista com as imagens contidas no diretório.
					self.image_list.append(
						os.listdir("./output/img/curso/" + str(i) + " - " + curso + "/")
					)
					# Para cada imagem, cria uma versão comprimida (120x80)
					for image in self.image_list[i]:
						# if not os.path.exists(
						# 	"./output/img/curso_compressed/" + str(i) + " - " + curso + "/" + image
						# ):
						file_ext = image.split(".")[-1]
						thumbnail = Image.open(
							"./output/img/curso/" + str(i) + " - " + curso + "/" + image
						)
						thumbnail = thumbnail.resize((120, 80))
						thumbnail.save(
							"./output/img/curso_compressed/" + str(i) + " - " + curso + "/" + image,
							format="JPEG" if file_ext.lower() == "jpg" else file_ext.upper(),
							optimize=True,
							quality=50,
						)
			i += 1

		msgBox = QMessageBox()
		msgBox.setWindowIcon(self.app_icon)

		# Um diretório vazio encontrado.
		if flag == 1:
			folders_string = (
				f"<p style='font-size:14px; line-height:1;'>&#9;{empty_folders[0]}</p>"
			)
			folders_string += f"<p style='font-size:14px; line-height:0.25;'>&#9;</p>"
			folders_string += f"<font size = 4> Caso isso esteja incorreto, clique cancelar, adicione novas imagens aos diretórios, e clique novamente no botão atualizar imagens. </font>"
			folders_string += f"<p style='font-size:14px; line-height:0.25;'>&#9;</p>"

			self.windowsXP_error.play()
			msgBox.setIcon(QMessageBox.Warning)

			## Leia o último if dessa função para entender os botões
			## abaixo.

			# Se clicar em Ignorar, o diretório não precisa de imagens.
			buttonOK = msgBox.addButton("Ignorar", QMessageBox.AcceptRole)
			# Se clicar em Cancelar, mantém a próxima ação (criar_json)
			# bloqueada, para verificar os diretórios vazios.
			buttonCancel = msgBox.addButton("Cancelar", QMessageBox.AcceptRole)

			msgBox.setDefaultButton(buttonCancel)
			msgBox.setWindowTitle("Diretório sem imagens")

			msgBox.setText("<font size = 5> Diretório sem imagens encontrado: </font>")
			msgBox.setInformativeText(folders_string)

			msgBox.exec()

		# Múltiplos diretórios vazios encontrados.
		elif flag > 1:
			folders_string = ""  #'<font size = 5> Diretórios sem imagens encontrados: </font>'
			for folder in empty_folders:
				folders_string += f"<p style='font-size:14px; line-height:0.25;'>&#9;{folder}</p>"
			folders_string += f"<p style='font-size:14px; line-height:0.25;'>&#9;</p>"
			folders_string += f"<font size = 4> Caso isso esteja incorreto, clique cancelar, adicione novas imagens aos diretórios, e clique novamente no botão atualizar imagens. </font>"

			self.windowsXP_error.play()
			msgBox.setIcon(QMessageBox.Warning)

			# Leia o último if dessa função para entender os botões
			# abaixo.

			# Se clicar em Ignorar, o diretório não precisa de imagens.
			buttonOK = msgBox.addButton("Ignorar", QMessageBox.AcceptRole)
			# Se clicar em Cancelar, mantém a próxima ação (criar_json)
			# bloqueada, para verificar os diretórios vazios.
			buttonCancel = msgBox.addButton("Cancelar", QMessageBox.AcceptRole)

			msgBox.setDefaultButton(buttonCancel)
			msgBox.setWindowTitle("Diretórios sem imagens")

			msgBox.setText("<font size = 5> Diretórios sem imagens encontrados: </font>")
			msgBox.setInformativeText(folders_string)

			msgBox.exec()

		# Nenhum diretório vazio encontrado.
		else:
			folders_string = "<p style='font-size: 14px; margin-left: 40px; margin-right: 50px; white-space: nowrap;'> Imagens atualizadas e comprimidas com sucesso. </p>"
			folders_string += (
				"<p style='font-size: 14px; white-space: pre-wrap; line-height: 0.25;'>  </p>"
			)

			self.windowsXP_exclamation.play()
			msgBox.setIcon(QMessageBox.Information)

			# Tudo ok, não é necessária nenhuma decisão, apenas notificar
			# o usuário.
			buttonOK = msgBox.addButton("OK", QMessageBox.AcceptRole)

			# buttonCancel = msgBox.addButton("Cancelar", QMessageBox.AcceptRole)
			msgBox.setDefaultButton(buttonOK)
			msgBox.setWindowTitle("Imagens atualizadas")

			msgBox.setText("<font size = 5> Imagens atualizadas </font>")
			msgBox.setInformativeText(folders_string)

			msgBox.exec()

		# Se clicar em Ignorar, significa que esse diretório não precisa de
		# imagens, cria-se o arquivo DELETE_ME.property para indicar isso.
		if msgBox.clickedButton() == buttonOK:
			if empty_folders_path:
				for folder in empty_folders_path:
					with open(f"{folder}/DELETE_ME.property", "w", encoding="utf8") as file:
						file.write("1")
			self.button_criar_json.setEnabled(True)
		self.button_atualizar_servidor.setEnabled(False)

	def criar_json(self):
		"""
		Exporta as informações obtidas anteriormente para um arquivo JSON.
		"""
		k = 0
		index = 0
		with open(
			f"./output/json/output_{self.datetime}.json", "w", encoding="utf8"
		) as json_file:
			json_file.write("[\n")
			for curso in self.cursos:
				json_file.write("\t{\n")
				json_file.write("\t\t" + '"Index": ' + str(index) + ",\n")
				json_file.write("\t\t" + '"Curso": ' + '"' + curso + '",\n')
				json_file.write(
					"\t\t" + '"Data": ' + '"' + format_date(self.cdis[curso]["Data"]) + '",\n'
				)
				json_file.write(
					"\t\t"
					+ '"Semestre": '
					+ '"'
					+ format_semester(self.cdis[curso]["Semestre"])
					+ '",\n'
				)
				json_file.write(
					"\t\t" + '"Instrutor": ' + '"' + self.cdis[curso]["Instrutor"] + '",\n'
				)
				json_file.write("\t\t" + '"Noticia": ' + '"' + self.cdis[curso]["Noticia"] + '",\n')
				json_file.write(
					"\t\t"
					+ '"NumeroParticipantes": '
					+ str(self.cdis[curso]["NumeroParticipantes"])
					+ ",\n"
				)
				json_file.write(
					"\t\t" + '"Participantes": ' + json.dumps(self.name_dict[curso]) + ",\n"
				)
				json_file.write("\t\t" + '"Imagens": ' + json.dumps(self.image_list[k]) + "\n")
				k += 1
				if curso != self.cursos[len(self.cursos) - 1]:
					json_file.write("\t},\n")
				else:
					json_file.write("\t}\n")
					json_file.write("]\n")
				index += 1
		self.file_path_full = (
			f"{os.getcwd()}\\output\\json\\output_{self.datetime}.json".replace("\\", "/")
		)
		file_path_short = f".../<strong>{os.path.basename(os.getcwd())}</strong>\\output\\json\\output_{self.datetime}.json".replace(
			"\\", "/"
		)

		self.windowsXP_exclamation.play()

		folders_string = "<font size = 5> JSON Criado: </font>"
		folders_string += (
			f"<p style='font-size:14px; white-space: pre;'>Local do arquivo:</p>"
		)
		folders_string += f"<p style='font-size:14px; white-space: pre-wrap; margin-right: 30px'; word-wrap: break-word;>{self.file_path_full}</p>"
		folders_string += f"<p style='font-size:14px; white-space: pre;'>Ou, resumidamente, a partir do diretório em que o programa se encontra:</p>"
		folders_string += f"<p style='font-size:14px; white-space: pre-wrap; margin-right: 30px'; word-wrap: break-word;>{file_path_short}</p>"
		folders_string += f"<p style='font-size:14px; line-height:0.25;'>&#9;</p>"
		folders_string += f"<p style='font-size:14px; line-height:0.25;'>&#9;</p>"

		msgBox = QMessageBox()
		msgBox.setWindowIcon(self.app_icon)
		msgBox.information(msgBox, "JSON criado", folders_string)

		self.button_atualizar_servidor.setEnabled(True)

	def atualizar_servidor(self):
		"""
		Copia o arquivo JSON output para o diretório das imagens,
		anota o horário em que a atualização ocorreu, e cria um
		.tar.gz a partir do diretório ./output/img.

		Em seguida envia o .tar.gz para /tmp/ no servidor, e executa
		o script que está no servidor.
		"""
		if self.username == "" or self.password == "":
			login = LoginDialog(self)

			result = login.exec()

			if result == QDialog.Accepted:
				self.username = login.username_edit.text()
				self.password = login.password_edit.text()
				# print(f"Username: {username}, Password: {not password}")
			else:
				# print("Login canceled")
				return

		shutil.copyfile(self.file_path_full, "./output/img/data.json")

		with open(f"./output/img/time_of_update.txt", "w", encoding="utf8") as file:
			file.write(self.datetime)

		make_tarfile(
			"temp_tarfile.tar.gz",
			"./output/img",
		)
		# Esses arquivos não são mais necessários, então podem ser deletados.
		pathlib.Path.unlink("./output/img/data.json", missing_ok=True)
		pathlib.Path.unlink("./output/img/time_of_update.txt", missing_ok=True)

		c = Connection(
			host="cosi.mppr", user=self.username, connect_kwargs={"password": self.password}
		)
		pattern = r"\[sudo\] password for {}: ".format(self.username)
		sudopass = Responder(
			pattern=pattern,
			response=f"{self.password}\n",
		)
		# Envia o .tar.gz para /tmp/
		result = c.put(
			"./temp_tarfile.tar.gz",
			remote="/tmp/",
		)

		# Executa o script. Precisa executar através desse venv para
		# utilizar as bibliotecas do mongodb.
		result = c.run(
			"sudo /home/amsmarques/json_to_mongodb/.venv/bin/python3 script.py",
			pty=True,
			in_stream=False,
			watchers=[sudopass],
			hide=self.hide_output,
		)
		c.close()

		# Esse arquivo também não é mais necessário, então pode ser deletado.
		pathlib.Path.unlink(pathlib.Path("temp_tarfile.tar.gz"), missing_ok=True)

		# Não altere
		self.setWindowTitle("sandwich")

		self.windows7_error.play()

		folders_string = "<font size = 5> Servidor atualizado: </font>"
		folders_string += f"<p style='font-size:14px; white-space: pre;'>Cursos, participantes, imagens, etc atualizados.</p>"
		folders_string += f"<p style='font-size:14px; white-space: pre;'>Mudanças devem estar disponíveis imediatamente no link cosi.mppr</p>"

		msgBox = QMessageBox()
		msgBox.setWindowIcon(self.app_icon)
		msgBox.information(msgBox, "Servidor atualizado", folders_string)

		self.setWindowTitle("Lendo do arquivo " + os.path.basename(self.path_to_ods))

	def import_backup(self):
		"""
		Importa os JSONs e imagens localizados em /var/opt/server_backup no
		servidor
		"""
		# Login, caso ainda não tenha sido feito
		if self.username == "" or self.password == "":
			login = LoginDialog(self)
			result = login.exec()

			if result == QDialog.Accepted:
				self.username = login.username_edit.text()
				self.password = login.password_edit.text()
				# print(f"Username: {username}, Password: {not password}")
			else:
				# print("Login canceled")
				return
		# Inicializa conexão
		c = Connection(
			host="cosi.mppr", user=self.username, connect_kwargs={"password": self.password}
		)
		pattern = r"\[sudo\] password for {}: ".format(self.username)
		sudopass = Responder(
			pattern=pattern,
			response=f"{self.password}\n",
		)

		# Cria um .tar.gz do backup no servidor
		result = c.run(
			"sudo /home/amsmarques/json_to_mongodb/.venv/bin/python3 generate_backup.py",
			pty=True,
			in_stream=False,
			watchers=[sudopass],
			hide=self.hide_output,
		)
		filename = result.stdout.split("=")[1].replace('"', "").replace("\n", "")
		if not os.path.exists("./imported_backups/"):
			os.makedirs("./imported_backups/")
		# Importa o .tar.gz do servidor
		c.get(filename)
		shutil.move(filename, f"imported_backups/{filename}")
		# Apaga arquivos desnecessários no servidor
		result = c.run(
			"sudo /home/amsmarques/json_to_mongodb/.venv/bin/python3 cleanup.py",
			pty=True,
			in_stream=False,
			watchers=[sudopass],
			hide=self.hide_output,
		)
		c.close()
		# Extrai e apaga .tar.gz
		extract_tarfile("imported_backups", filename)
		pathlib.Path.unlink(pathlib.Path(f"./imported_backups/{filename}"), missing_ok=True)

		# Não altere
		self.setWindowTitle("sandwich")

		self.windows7_error.play()

		folders_string = "<font size = 5> Backup importado: </font>"
		folders_string += f"<p style='font-size:14px; white-space: pre;'>O backup está disponível em ./imported_backups/{filename.split('.')[0]}</p>"

		msgBox = QMessageBox()
		msgBox.setWindowIcon(self.app_icon)
		msgBox.information(msgBox, "Backup importado", folders_string)

		self.setWindowTitle("Lendo do arquivo " + os.path.basename(self.path_to_ods))

	def audio_mute(self):
		"""
		Atualiza self.silence para o oposto do que é no momento.

		Armazena no arquivo config.json se o programa
		está mutado ou não.

		Em seguida atualiza o ícone do botão de áudio

		Por fim atualiza os fontes de áudio.

		"""
		self.silence = not self.silence

		self.json_data["silence"] = self.silence
		with open("config/config.json", "w") as jsonFile:
			json.dump(self.json_data, jsonFile, indent="\t")

		if not self.silence:
			pixmapi = getattr(QStyle, "SP_MediaVolume")
			icon = self.style().standardIcon(pixmapi)
			self.button_audio.setIcon(icon)
		else:
			pixmapi = getattr(QStyle, "SP_MediaVolumeMuted")
			icon = self.style().standardIcon(pixmapi)
			self.button_audio.setIcon(icon)

		self.update_audio_sources()

	def setup_config(self):
		"""
		Configurações vindas do arquivo config.json.

		---

		### self.json_data
		- Armazena as informações abaixo.

		### self.path_to_ods
		- Local do arquivo .ods que funciona como repositório.

		### self.silence
		- Se o programa deve tocar áudios ou não.
		"""
		with open("config/config.json", "r", encoding="utf8") as f:
			self.json_data = json.load(f)
			self.path_to_ods = self.json_data["ods_path"]
			self.silence = self.json_data["silence"]

	def setup_audio(self):
		"""
		Inicializa o áudio do programa.

		---

		Primeiro, traz os arquivos de áudio para variáveis.

		Em seguida, cria os Mediaplayers para cada som do
		windows, e redefine o volume.

		Por último, toca a melodia de inicialização do
		Windows XP.

		---

		### self.windowsXP_startup
		- Melodia icônica de inicialização do Windows XP

		### self.windowsXP_shutdown
		- Melodia igualmente icônica de shutdown do Windows XP

		### self.windowsXP_exclamation
		- Melodia utilizada para popups de notificação em que
		não ocorreram erros.

		### self.windowsXP_error
		- Melodia utilizada para popups de avisos que podem ou
		não ser erros.

		### self.windowsXP_critical_stop
		- Melodia utilizada para popups de erros.

		### self.windows7_error
		- Embora o nome não sugira isso, essa melodia é utilizada
		para indicar finalização.

		"""
		# O arquivo de áudio vazio não é inicializado aqui, apenas
		# inserido em uma variável.
		self.silence_wav = QUrl.fromLocalFile("audio/silence.wav")

		self.Windows_7_Error_Louder_wav = QUrl.fromLocalFile(
			"audio/Windows_7_Error_Louder.wav"
		)
		self.Windows_XP_Critical_Stop_wav = QUrl.fromLocalFile(
			"audio/Windows_XP_Critical_Stop.wav"
		)
		self.Windows_XP_Error_wav = QUrl.fromLocalFile("audio/Windows_XP_Error.wav")
		self.Windows_XP_Exclamation_wav = QUrl.fromLocalFile(
			"audio/Windows_XP_Exclamation.wav"
		)
		self.Windows_XP_Shutdown_wav = QUrl.fromLocalFile("audio/Windows_XP_Shutdown.wav")
		self.Windows_XP_Startup_wav = QUrl.fromLocalFile("audio/Windows_XP_Startup_short.wav")

		self.windowsXP_startup = QMediaPlayer()
		self.windowsXP_startup_audio_output = QAudioOutput()
		self.windowsXP_startup.setAudioOutput(self.windowsXP_startup_audio_output)

		self.windowsXP_startup_audio_output.setVolume(50)

		self.windowsXP_shutdown = QMediaPlayer()
		self.windowsXP_shutdown_audio_output = QAudioOutput()
		self.windowsXP_shutdown.setAudioOutput(self.windowsXP_shutdown_audio_output)

		self.windowsXP_shutdown_audio_output.setVolume(50)

		self.windowsXP_exclamation = QMediaPlayer()
		self.windowsXP_exclamation_audio_output = QAudioOutput()
		self.windowsXP_exclamation.setAudioOutput(self.windowsXP_exclamation_audio_output)

		self.windowsXP_exclamation_audio_output.setVolume(50)

		self.windowsXP_error = QMediaPlayer()
		self.windowsXP_error_audio_output = QAudioOutput()
		self.windowsXP_error.setAudioOutput(self.windowsXP_error_audio_output)

		self.windowsXP_error_audio_output.setVolume(50)

		self.windowsXP_critical_stop = QMediaPlayer()
		self.windowsXP_critical_stop_audio_output = QAudioOutput()
		self.windowsXP_critical_stop.setAudioOutput(self.windowsXP_critical_stop_audio_output)

		self.windowsXP_critical_stop_audio_output.setVolume(100)

		self.windows7_error = QMediaPlayer()
		self.windows7_error_audio_output = QAudioOutput()
		self.windows7_error.setAudioOutput(self.windows7_error_audio_output)

		self.windows7_error_audio_output.setVolume(100)

		self.update_audio_sources()
		self.windowsXP_startup.play()

	def update_audio_sources(self):
		"""
		Executado quando o botão de áudio é pressionado.

		---

		Se estiver indo do estado mudo para não mudo,
		redefine os sources.

		Se estiver indo do estado não mudo para mudo,
		para a execução dos áudios, espera um tempo para
		não crashar, e redefine os sources todos para o
		áudio em branco.
		"""
		if not self.silence:
			self.windowsXP_startup.setSource(self.Windows_XP_Startup_wav)
			self.windowsXP_shutdown.setSource(self.Windows_XP_Shutdown_wav)
			self.windowsXP_exclamation.setSource(self.Windows_XP_Exclamation_wav)
			self.windowsXP_error.setSource(self.Windows_XP_Error_wav)
			self.windowsXP_critical_stop.setSource(self.Windows_XP_Critical_Stop_wav)
			self.windows7_error.setSource(self.Windows_7_Error_Louder_wav)
		else:
			self.windowsXP_startup.stop()
			self.windowsXP_shutdown.stop()
			self.windowsXP_exclamation.stop()
			self.windowsXP_error.stop()
			self.windowsXP_critical_stop.stop()
			self.windows7_error.stop()
			time.sleep(0.0115)
			self.windowsXP_startup.setSource(self.silence_wav)
			self.windowsXP_shutdown.setSource(self.silence_wav)
			self.windowsXP_exclamation.setSource(self.silence_wav)
			self.windowsXP_error.setSource(self.silence_wav)
			self.windowsXP_critical_stop.setSource(self.silence_wav)
			self.windows7_error.setSource(self.silence_wav)

	def setup_data_structs(self):
		"""
		Inicializa as estruturas de dados.

		---

		### self.datetime
		- Definido ao executar extrair_planilha().
		A mesma data é mantida por toda a execução
		para não aparecerem datas diferentes em
		instantes diferentes, pois inclui o minuto.

		### self.cursos
		- Lista com os nomes dos cursos.

		### self.image_list
		- Lista com o nome dos arquivos de imagem.

		### self.cdis
		- Estrutura que armazena Curso, Data, Instrutor,
		Semestre (e notícia).

		### self.name_dict
		- Lista com os nomes dos participantes

		### self.username
		- Login no servidor

		### self.password
		- Senha no servidor

		### self.hide_output
		- Define se o output do Fabric vai para stdout. Se o
		programa está sendo executado na versão "compilada", não
		possui terminal, e crasha ao tentar escrever para stdout.
		Se estiver em um venv, imprime para auxiliar no debug.

		"""
		self.datetime = None
		self.cursos = []
		self.image_list = []
		self.cdis = {}  # Curso, Data, Instrutor, Semestre, Notícia
		self.name_dict = {}

		self.username = ""
		self.password = ""

		self.hide_output = False
		# Se sys.prefix == sys.base_prefix então não está em um venv.
		if sys.prefix == sys.base_prefix:
			self.hide_output = True

	def setup_layout(self):
		"""
		Inicializa o layout do programa.

		---

		Insere ícone, título na barra superior.

		Cria os botões, mas não os conecta a alguma função.

		Insere mais alguns ícones relacionados a áudio.

		Mapeia os botões para uma posição na matriz de widgets.

		"""
		self.app_icon = QIcon("img/icon.png")
		self.setWindowIcon(self.app_icon)
		self.setWindowTitle("Lendo do arquivo " + os.path.basename(self.path_to_ods))

		self.button_extrair_planilha = QPushButton("Extrair Informações da Planilha")
		self.button_criar_diretorios = QPushButton("Criar Diretórios")
		self.button_atualizar_imagens = QPushButton("Atualizar Imagens")
		self.button_criar_json = QPushButton("Criar JSON")
		self.button_atualizar_servidor = QPushButton("Atualizar no Servidor")
		self.button_import_backup = QPushButton("Importar Backup do Servidor")
		self.button_criar_diretorios.setEnabled(False)
		self.button_atualizar_imagens.setEnabled(False)
		self.button_criar_json.setEnabled(False)
		self.button_atualizar_servidor.setEnabled(False)

		self.button_audio = QPushButton("")

		if not self.silence:
			pixmapi = getattr(QStyle, "SP_MediaVolume")
			icon = self.style().standardIcon(pixmapi)
			self.button_audio.setIcon(icon)
		else:
			pixmapi = getattr(QStyle, "SP_MediaVolumeMuted")
			icon = self.style().standardIcon(pixmapi)
			self.button_audio.setIcon(icon)

		# Create layout and add widgets
		layout = QGridLayout()

		layout.addWidget(self.button_extrair_planilha, 1, 1)
		layout.addWidget(self.button_criar_diretorios, 1, 2)
		layout.addWidget(self.button_atualizar_imagens, 1, 3)
		layout.addWidget(self.button_criar_json, 1, 4)

		empty = QSpacerItem(50, 0, QSizePolicy.Expanding, QSizePolicy.Expanding)

		layout.addItem(empty, 1, 9)
		layout.addItem(empty, 1, 0)

		layout.addWidget(self.button_audio, 1, 10)
		layout.addWidget(self.button_atualizar_servidor, 2, 2)
		layout.addWidget(self.button_import_backup, 3, 4)

		# Set dialog layout
		widget = QWidget()
		widget.setLayout(layout)
		self.setCentralWidget(widget)
		self.setFixedSize(650, 115)

	def setup_buttons(self):
		"""
		Conecta os botões às suas respectivas funções.
		"""
		# Add button signal to greetings slot
		self.button_extrair_planilha.clicked.connect(self.extrair_planilha)
		self.button_criar_diretorios.clicked.connect(self.criar_diretorios)
		self.button_atualizar_imagens.clicked.connect(self.atualizar_imagens)
		self.button_criar_json.clicked.connect(self.criar_json)
		self.button_atualizar_servidor.clicked.connect(self.atualizar_servidor)

		self.button_import_backup.clicked.connect(self.import_backup)

		self.button_audio.clicked.connect(self.audio_mute)

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
		Fecha o programa ao detectar que ESC foi pressionado.
		"""
		if event.key() == Qt.Key_Escape:
			QCoreApplication.quit()

	def closeEvent(self, event):
		"""
		Redefine o evento de fechamento do programa.

		---

		Toca a melodia de shutdown do Windows XP, espera terminar,
		e fecha o programa.
		"""
		if not self.silence:
			self.windowsXP_shutdown.play()
			time.sleep(2.06)
		event.accept()  # let the window close

	def parallel_update_audio_button(self):
		"""
		Obsoleto.
		---

		---

		Atualiza paralelo ao programa principal o botão
		de áudio.

		---

		O motivo disso existir é que se você abrir o programa
		e tentar mutar o som antes do áudio terminar de tocar,
		o programa crasha.

		---

		Não é mais necessário porque fiz o áudio parar ao mutar ao
		ir do não mudo para mudo, e reduzi a duração do áudio em branco
		para 0.0115 segundos.

		Deixei aqui para referências futuras caso seja necessário
		mais paralelismo.

		---

		Para executar com paralelismo, é necessário incluir as linhas
		abaixo no main, após main_window.show()
		#### t = threading.Thread(target=main_window.parallel_update_audio_button)
		#### t.start()

		"""
		if not self.silence:
			time.sleep(3.7)
			self.button_audio.setEnabled(True)
		else:
			time.sleep(1)
			self.button_audio.setEnabled(True)

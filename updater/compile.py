"""
	Compilar sem esse script:
	pyinstaller .\ods_to_json_gui.pyw --clean --name='Update Server' --add-data './img;img.' --add-data './config;config.' --add-data './audio;audio.' --add-data './log;log.' --icon=icon.ico --contents-directory 'python' --noconfirm
"""

from src_utils.utils_random import remove_tabs

import subprocess
import shlex
import sys
import os


# Se sys.prefix == sys.base_prefix então não está em um venv.
if sys.prefix == sys.base_prefix:
	venv = ".venv/Scripts/activate"
	subprocess.run(venv, shell=True)

# Arquivo fonte.
source_file = "ods_to_json_gui.pyw"
# Nome do diretório raíz do programa.
folder_name = "Update Server"
# Acrescenta estes diretórios à hierarquia de diretórios do programa.
# Note que diferente da execução sem esse script acima, aspas (' ')
# não são usadas nessa string. Não sei o porquê.
add_data = "--add-data ./img;img. --add-data ./config;config. \
			--add-data ./audio;audio. --add-data ./log;log."
# Hrafnsmerki
hrafnsmerki = "icon.ico"
# Diretório que contém os arquivos gerados.
contents_directory = "python"
# Version file, fiz isso pra aparecer no gerenciador de tarefas sem .exe.
version_file = "version.txt"

# "Compila" o programa.
freeze = remove_tabs(
	f'pyinstaller .\{source_file} --clean \
	--name="{folder_name}" {add_data} --icon={hrafnsmerki} \
	--contents-directory {contents_directory} --noconfirm \
	--version-file={version_file}'
)
subprocess.run(freeze, shell=True)

# Eu não sei se o subprocess roda por padrão no cmd ou no powershell,
# então fiz isso para garantir que seja no powershell.
powershell = "C:/Windows/System32/WindowsPowerShell/v1.0/powershell.exe"

# Os quatro diretórios abaixo precisam ser colocados no mesmo diretório
# que o .exe.
path_output = os.path.abspath(os.path.join(os.getcwd(), "dist", folder_name, "python"))
path_destination = os.path.abspath(os.path.join(os.getcwd(), "dist", folder_name))
folders = ["audio", "config", "img", "log"]

for folder in folders:
	path_move = os.path.join(path_output, folder)

	# Use shlex.quote to properly quote the paths (chatgpt).
	quoted_path_move = shlex.quote(path_move)
	quoted_path_destination = shlex.quote(path_destination)
	print(f"Movendo {quoted_path_move} para {quoted_path_destination}")

	move_folders = remove_tabs(
		f"{powershell} Move-Item \
		-Path {quoted_path_move} \
		-Destination {quoted_path_destination}"
	)

	subprocess.run(move_folders, shell=True)

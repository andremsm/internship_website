import tarfile
import os


def make_tarfile(output_filename, source_dir):
	"""
	Cria o arquivo output_filename.tar.gz a partir do diretório
	source_dir
	"""
	with tarfile.open(output_filename, "w:gz") as tar:
		tar.add(source_dir, arcname=os.path.basename(source_dir))


def extract_tarfile(source_dir, filename):
	"""
	Extrai filename para o diretório source_dir
	"""
	current_dir = os.getcwd()
	os.chdir(source_dir)
	file = tarfile.open(filename)
	file.extractall()
	file.close()
	os.chdir(current_dir)

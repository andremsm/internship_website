def format_date(date):
	"""
	Retorna data no formato dd/mm/aaaa.
	"""
	date_list = date.strip().split("-")
	date = date_list[2] + "/" + date_list[1] + "/" + date_list[0]
	return date


def format_semester(semester):
	"""
	Retorna semestre no formato mm/aaaa.
	"""
	semester_list = semester.strip().split("-")
	semester = semester_list[1] + "/" + semester_list[0]
	return semester

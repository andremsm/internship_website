def get_nth_key(dictionary, n=0):
	"""
	não lembro kek
	"""
	if n < 0:
		n += len(dictionary)
	for i, key in enumerate(dictionary.keys()):
		if i == n:
			return key
	raise IndexError("dictionary index out of range")


def remove_tabs(string: str) -> str:
	string = string.replace("\t", " ")
	while "  " in string:
		string = string.replace("  ", " ")
	return string

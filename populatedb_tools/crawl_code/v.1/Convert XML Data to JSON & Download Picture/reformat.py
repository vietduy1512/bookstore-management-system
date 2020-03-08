def reformat_file(index):
	path = 'Sach/SACH_' + str(index) + '.xml'

	# Read
	f = open(path, 'r', encoding="utf8")
	string = f.read()
	f.close()

	# Change String
	string = string.replace('&nbsp;', '')
	string = string.replace('₫', '')
	if '</Sach>' not in string: 
		string += '</Sach>'
	print(string)

	#Write
	f = open(path, 'w', encoding="utf8")
	string = f.write(string)
	f.close()

def reformat():
	for i in range(1,231):
		reformat_file(i)

reformat()
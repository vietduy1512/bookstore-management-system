import urllib.request
from xml.dom import minidom
import json

url_array = []

def get_url_array(index):
	path = 'book_list_html/file_html_' + str(index) + '.txt'
	#Download html
	#urllib.request.urlretrieve('https://tiki.vn/nha-sach-tiki/c8322?src=mega-menu&page=' + str(index), path)

	# Read
	f = open(path, 'r', encoding="utf8")
	string = f.read()
	f.close()

	#Loop
	start_index = 0
	end_index = 0
	tmp_str = ""
	for x in range(0,23):	# 23 lần
		# Find url's position and url's range
		start_index = string.find('data-score="" href=', end_index)
		start_index += 20
		end_index = string.find('" title', start_index)

		# Get url
		tmp_str = string[start_index : end_index]
		url_array.append(tmp_str)


def write_to_json():
	#Write
	with open('url_array.json', 'w', encoding="utf8") as outfile:
		json.dump(url_array, outfile, ensure_ascii=False, indent=2)



for x in range(1, 11):	
	get_url_array(x)
write_to_json()
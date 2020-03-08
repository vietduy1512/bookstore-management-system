import urllib.request
from xml.dom import minidom
import json


def download_html():
	# Read
	with open('url_array.json', 'r', encoding="utf8") as file:
		url_data = json.load(file)

	for i in range(0, 230):
		urllib.request.urlretrieve(url_data[i], 'book_html/CHITIET_SACH_' + str(i + 1) + '.html')

def get_book_data(index):
	img_name = 'images/SACH_' + str(index) + '.jpg'
	save_path = 'book_data/SACH_' + str(index) + '.json'

	# Read
	f = open('book_html/CHITIET_SACH_' + str(index) + '.html', 'r', encoding="utf8")
	string = f.read()
	f.close()

	#Loop

	# Find book_data's position and book_data's range
	start_index = string.find('var product_ga_data = {')
	start_index += 22
	end_index = string.find('};', start_index)
	end_index += 1

	# Get book_data
	tmp_str = string[start_index : end_index]

	# Save book_data as json
	tmp_str = tmp_str.replace('\'', '\"')
	book_data = {}
	json_data = json.loads(tmp_str)

	# fix TacGia data
	tacgia = ""
	if (json_data['brand'] is not None):
		tacgia = json_data['brand']

	book_data['Sach'] = {
		'MaSach': json_data['id'],
		'TuaDe': json_data['name'],
		'HinhAnh': img_name,
		'TacGia': tacgia,
		'TheLoai': json_data['category'],
		'Gia': json_data['price'],
	}

	# Find book_summary's position and book_summary's range
	start_index = string.find('<div id="gioi-thieu"')
	start_index = string.find('<p', start_index)
	end_index = string.find('</div>', start_index)
	end_index = string.rfind('</p>', start_index, end_index)
	end_index += 4

	# Get book_summary
	tmp_str = string[start_index : end_index]

	book_data['Sach']['GioiThieu'] = tmp_str

	print(index)

	with open(save_path, 'w', encoding="utf8") as outfile:
		json.dump(book_data, outfile, ensure_ascii=False, indent=2)

def main():
	for index in range(158, 231):		# Ở File thứ 157 có dấu \' bị thay thành \" dẫn đến lỗi # TODO: sẽ sửa sau
		get_book_data(index)

#download_html()
main()
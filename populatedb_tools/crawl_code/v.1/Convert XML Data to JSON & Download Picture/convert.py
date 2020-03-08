import urllib.request
from xml.dom import minidom
import json

def download_image(url, index):
	img_name = 'images/SACH_'+ str(index) + '.jpg'
	urllib.request.urlretrieve(url, img_name)

def convert_to_JSON(index):
	# parse an xml file by name
	mydoc = minidom.parse('Sach/SACH_'+ str(index) + '.xml')
	items = mydoc.getElementsByTagName('Sach')

	# for more then 1 tag 'Sach'
	for elem in items:
		# Download (Dont need this yet* Already download)
		# download_image(elem.attributes['src'].value, index)

		print('Sach/SACH_'+ str(index) + '.xml')
		data = {}
		data['Sach'] = {
			'MaSach': elem.attributes['data-seller-product-id'].value,
			'TuaDe': elem.attributes['data-title'].value,
			'HinhAnh': 'images/SACH_'+ str(index) + '.jpg',
			'TacGia': elem.attributes['data-brand'].value,
			'TheLoai': elem.attributes['data-category'].value,
			'Gia': elem.attributes['data-price'].value,
		}

	with open('json/SACH_'+ str(index) + '.json', 'w', encoding="utf8") as outfile:
		json.dump(data, outfile, ensure_ascii=False, indent=2)

def convert_data():
	for index in range(1,231):
		convert_to_JSON(index)

convert_data()
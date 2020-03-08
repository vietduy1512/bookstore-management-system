
function hbsHelpers(hbs) {


    hbs.registerHelper('get_length', function (obj) {
        return obj.length;
    });

    hbs.registerHelper('print_TheLoai', function (obj) {
        var theLoai = "<strong>";
        obj.forEach((tl) => {
            theLoai += '<a href="'+tl.url+'">'+ tl.Ten + ' </a>| '
        })
        theLoai += "</strong>"
        return theLoai;
    });

    //trả về chuỗi HTML hiện thị danh sách thể loại trên topnavbar
    hbs.registerHelper('render_TheLoai', (theLoais) => {
        var html = '<ul class="list-unstyled mb-3 col-lg-4 col-md-12">';
        var oneThirdLenght = Math.ceil(theLoais.length / 3);
        var i = 0;
        for (i = 0; i < oneThirdLenght; i++) {
            html += '<li class="nav-item"><a href="' + theLoais[i].url + '" class="nav-link">' + theLoais[i].Ten + '</a></li>';
        }
        html += "</ul>";
        html += '<ul class="list-unstyled mb-3 col-lg-4 col-md-12">';
        for (; i < oneThirdLenght * 2; i++) {
            html += '<li class="nav-item"><a href="' + theLoais[i].url + '" class="nav-link">' + theLoais[i].Ten + '</a></li>';
        }
        html += "</ul>";
        html += '<ul class="list-unstyled mb-3 col-lg-4 col-md-12">';
        for (; i < theLoais.length; i++) {
            html += '<li class="nav-item"><a href="' + theLoais[i].url + '" class="nav-link">' + theLoais[i].Ten + '</a></li>';
        }
        html += "</ul>";
        return html;
    });

    hbs.registerHelper('render_TheLoai_Search', (theLoais) => {
        var html = "";
        for (var i = 0; i < theLoais.length; i++) {
            html += '<li class="nav-item"><small><a href="' + theLoais[i].url + '" class="nav-link">'
                + theLoais[i].Ten + '</a></small></li>';
        }
        return html;
    });

    hbs.registerHelper('render_Pagination', (page) => {

        // init page position
        var rear_left_page = parseInt(page) - 2;
        var left_page = parseInt(page) - 1;
        var right_page = parseInt(page) + 1;
        var rear_right_page = parseInt(page) + 2;

        // Previous button
        var html = '<li class="page-item"><a onclick="insertPageParam(' + left_page + ')" class="page-link"><i class="fa fa-angle-double-left"></i></a></li>';
 
        var currentPageDiv = '<li class="page-item active"><a href="#" class="page-link">' + page + '</a></li>';

        if (page == 1) {
            html = ''
            html += currentPageDiv + '<li class="page-item"><a onclick="insertPageParam(2)" class="page-link">2</a></li><li class="page-item"><a onclick="insertPageParam(3)" class="page-link">3</a></li><li class="page-item"><a onclick="insertPageParam(4)" class="page-link">4</a></li><li class="page-item"><a onclick="insertPageParam(5)" class="page-link">5</a></li>';
        } else if (page == 2) {
            html += '<li class="page-item"><a onclick="insertPageParam(1)" class="page-link">1</a></li>' + currentPageDiv;
            html += '<li class="page-item"><a onclick="insertPageParam(3)" class="page-link">3</a></li><li class="page-item"><a onclick="insertPageParam(4)" class="page-link">4</a></li><li class="page-item"><a onclick="insertPageParam(5)" class="page-link">5</a></li>';
        } else {
            html += '<li class="page-item"><a onclick="insertPageParam(' + rear_left_page + ')" class="page-link">' + rear_left_page + '</a></li>' + '<li class="page-item"><a onclick="insertPageParam(' + left_page + ')" class="page-link">' + left_page + '</a></li>' + currentPageDiv;
            html += '<li class="page-item"><a onclick="insertPageParam(' + right_page + ')" class="page-link">' + right_page + '</a></li>' + '<li class="page-item"><a onclick="insertPageParam(' + rear_right_page + ')" class="page-link">' + rear_right_page + '</a></li>';
        } // TODO: implement case:semi-end & case:end

        // Next Buton
        html += '<li class="page-item"><a onclick="insertPageParam(' + right_page + ')" class="page-link"><i class="fa fa-angle-double-right"></i></a></li>'

        return html;
    });

    hbs.registerHelper('print_genre_name', (genre_name) => {
        if (genre_name == undefined) {
            return "Tất cả";
        } else {
            return genre_name;
        }
    });

    hbs.registerHelper('check_isChecked_option', (checked) => {
        if (checked == 'true') {
            return "checked";
        }
    });


    hbs.registerHelper('render_Rating', (rate) => {
        var html = "";
        for (var i = 1; i <= 5; i++) {
            html += '<span class="fa fa-star ';
            if (i <= rate)
                html += 'star-checked';
            html += '"></span>';
        }
        return html;
    })

    hbs.registerHelper('render_Book_Rating', (ChiTietDanhGia) => {
        var html = "";
        for (var i = 1; i <= 5; i++) {
            html += '<span class="fa fa-star ';
            if (i <= ChiTietDanhGia.DanhGiaTrungBinh)
                html += 'star-checked';
            html += '"></span>';
        }
        html += '<small> (' + ChiTietDanhGia.DanhGiaTrungBinh + ') (' + ChiTietDanhGia.SoLuong + ' đánh giá)</small>';
        return html;
    })

    hbs.registerHelper('render_Rating_Details', (ChiTietDanhGia) => {
        var html = '<div class="col-1 p-0"> ::number <span class="fa fa-star star-checked"></span></div>\
            <div class="col-10 p-0 progress">\
            <div class="progress-bar" role="progressbar" style="width: ::precent%" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>\
            </div><div class="col-1 p-0"> ::precent%</div>';
        var resHtml = "";
        var chitiet = ChiTietDanhGia.ChiTietDanhGia;
        for (var i = 5; i >= 1; i--) {
            var html_ = html;
            html_ = html_.replace('::number', i);
            html_ = html_.replace('::precent', chitiet[i]);
            html_ = html_.replace('::precent', chitiet[i]);
            resHtml += html_;
        }
        return resHtml;
    })

    hbs.registerHelper('render_tinhtrang_donhang',(TinhTrang)=>{
        var TrangThais = ['ChuaGiao','DangGiao','DaGiao'];
        var Ten = ['Chưa Giao','Đang Giao','Đã Giao'];

        var html = "";
        for(var i=0;i<TrangThais.length ;i++){
            html+=' <option value="' + TrangThais[i] +'" ';
            if(TinhTrang ===TrangThais[i] )
                html+= 'selected';
            html += '>'+  Ten[i]+'</option>';
        }
        return html;
    })

    
};

module.exports = hbsHelpers;
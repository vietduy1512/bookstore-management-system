weekOfYear = function (date) {
    var d = new Date(+date);
    d.setHours(0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    return Math.ceil((((d - new Date(d.getFullYear(), 0, 1)) / 8.64e7) + 1) / 7);
};

exports.getMonthFormat = function (date) {
    return getTwoNumberInt(date.getMonth() + 1) + "/" + date.getFullYear();
}

exports.getDateFormat = function (date) {
    return getTwoNumberInt(date.getDate()) + "/" + getTwoNumberInt(date.getMonth() + 1) + "/" + date.getFullYear();
}

exports.getWeekFormat = function (date) {
    return weekOfYear(date) + "/" + date.getFullYear();
}

exports.getQuaterFormat = function (date) {
    return Math.ceil((date.getMonth()  + 1)/3) + "/" + date.getFullYear();
}

exports.dateToInt = function(key){
    var dateStrs= key.split('/');
    var str = dateStrs[2]+dateStrs[1]+dateStrs[0];
    return Number.parseInt(str);
}

exports.ortherFormatToInt= function(key){
    var dateStrs= key.split('/');
    var str = dateStrs[1]+dateStrs[0];
    return Number.parseInt(str);
}

function getTwoNumberInt(num){
    if(num < 10)
        return "0"+num;
    return num;
}

exports.formatDateTime = function (date) {
    return exports.getDateFormat(date) + " " 
                            + getTwoNumberInt(date.getHours()) 
                            + ":" +getTwoNumberInt(date.getMinutes())
                            +":"+getTwoNumberInt(date.getSeconds());
}
var _=require('underscore');
var Util=require('util');

/**
 * 常用输入检测
 */
var File = {};


File.jpg='.jpg$|.jpeg$';
File.png='.png$';
File.gif='.gif$';
File.svg='.svg$';
File.sql='.sql$';
File.excel='.xls$|.xlsx|.xlsm';


/*
 * 是否Jpg
 * */

File.isJpg = function (str) {
    return Util.match(str.toLowerCase(),File.jpg);
};

/*
 * 是否Gif
 * */
File.isGif = function (str) {
    return Util.match(str.toLowerCase(),File.gif);
};
/*
 * 是否png
 * */
File.isPng = function (str) {
    return Util.match(str.toLowerCase(),File.png);
};
/*
 * 是否svg
 * */
File.isSvg = function (str) {
    return Util.match(str.toLowerCase(),File.svg);
};
/*
 * 是否图片 不含svg
 * */
File.isImage = function (str) {
    return Util.match(str.toLowerCase(),[File.jpg,File.gif,File.png]);
};

/*
 * 是否sql
 * */
File.isSql = function (str) {
    return Util.match(str.toLowerCase(),File.sql);
};
/*
 * 是否Excel
 * */
File.isExcel = function (str) {
    return Util.match(str.toLowerCase(),File.excel);
};

module.exports = File;

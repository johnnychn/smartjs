/**
 * 常用输入检测
 */
var Input = {};
Input.TEXT=1;
Input.NUMBER=2;
Input.EMAIL=3;
Input.PASSWORD=4;
Input.RADIO=6;
Input.CHECKBOX=7;
Input.COMBOBOX=8;
Input.TEXTAREA=9;
Input.FILE=10;
Input.IMAGE=11;
Input.DATE=20;
Input.DATETIME=21;

/*
 * 是否邮箱
 * */

Input.isEmail = function (str) {
    var reg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/;
    return reg.test(str);
};
/*
 * 是否http
 * */
Input.isHttp = function (str) {
    str = str.toLowerCase();
    var reg = /^http:\/\//;
    return reg.test(str);
};
/*
 * 是否Https
 * */
Input.isHttps = function (str) {
    str = str.toLowerCase();
    var reg = /^https:\/\//;
    return reg.test(str);
};
/*
 * 是否 //的url
 * */
Input.isFlexUrl = function (str) {
    str = str.toLowerCase();
    var reg = /^\/\//;
    return reg.test(str);
};

/*
 * 是否邮箱
 * */
Input.isLink = function (str) {

    return this.isHttp(str) || this.isHttps(str);
};
module.exports = Input;

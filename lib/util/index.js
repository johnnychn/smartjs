var _=require('underscore');

/**
 * 常用工具
 */
var Util = {};
/*
 * 检查是否包含制定字符(正则表达式)
 * */
Util.match=function(str,matchs){
    var regStr='';
    if(this.isArray(matchs)){
        _.each(matchs,function(v){
            regStr=regStr+v+'|';
        });
        regStr = regStr.substr(0, regStr.length - 1);
    }else{
        regStr=matchs;
    }
    reg=new RegExp(regStr);
    return reg.test(str);
};
/*
 * 按名字获取内容,一半用于head meta中
 * */
Util.getContentByName = function (name) {
    if (document.getElementsByName(name).length == 1) {
        return document.getElementsByName(name)[0].getAttribute("content");
    } else {
        return false;
    }
};
/*
 * 删除对象属性
 * */
Util.clearKey=function(obj,key){
    if(_.has(obj,key)){
        delete obj[key];
    }
};

/*
 * 删除多个对象属性
 * */
Util.clearKeys=function(obj,key){
    var self=this;
    if(self.isString(key)){
        self.clearKey(obj,key);
    }else if(self.isArray(key)){
        _.each(key,function(v){
            self.clearKey(obj,v);
        })
    }else if(self.isObject(key)){
        _.each(key,function(v,k){
            self.clearKey(obj,k);
        })
    }
};

/*
 * 替换字符串
 * */
Util.replace = function (str, sptr, sptr1) {
    str = str.replace(new RegExp(sptr, 'gm'), sptr1);
    return str;
};
/*
 * 替代js本身的 eval,避免编译错误
 * */
Util.eval = function (v) {
    var estr = ('(' + v + ')');
    var Fn = Function;  //一个变量指向Function，防止有些前端编译工具报错
    return new Fn('return ' + estr)();
};
/*
 * 获取js
 * */
Util.getScript = function (src, callback) {
    var head = document.getElementsByTagName("head")[0] || document.documentElement;
    var script = document.createElement("script");
    script.async = "true";
    script.src = src;
    var done = false;
    // 加载完毕后执行
    script.onload = script.onreadystatechange = function () {
        if (!done && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete")) {
            done = true;
            try {
                callback(script);
            } catch (err) {
            }
            script.onload = script.onreadystatechange = null;
        }
    };

    head.insertBefore(script, head.firstChild);
};
/*
 * 获取css
 * */
Util.getCss = function (src, callback) {
    var head = document.getElementsByTagName("head")[0] || document.documentElement;
    var script = document.createElement("link");
    script.async = "true";
    script.href = src;
    script.rel = 'stylesheet';
    script.type = 'text/css';

    var done = false;

    // 加载完毕后执行
    script.onload = script.onreadystatechange = function () {
        if (!done && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete")) {
            done = true;
            try {
                callback(script);
            } catch (err) {
            }
            script.onload = script.onreadystatechange = null;
        }
    };

    head.insertBefore(script, head.firstChild);
};

/*
 * String 转 vars对象
 * */
Util.stringToVars = function (str) {
    var obj = {};
    var node;
    var arrSource = unescape(str).split("&");
    i = 0;
    while (i < arrSource.length) {
        if (arrSource[i].indexOf("=") > 0) {
            node = arrSource[i].split("=");
            obj[node[0]] = node[1];

        }
        i++;
    }
    return obj;
};
/*
 * vars对象 转 String
 * */
Util.varsToString = function (obj) {
    var str = '';
    for (var i in obj) {
        str += i + '=' + obj[i + ''] + '&';
    }
    str = str.substr(0, str.length - 1);
    return str;
};


Util.intToString = function (v, length, add_character) {
    if (!add_character) {
        add_character = '0';
    }
    var str;
    if (this.isString(v)) {
        str = v;
    } else {
        str = v.toString();
    }

    while (str.length < length) {
        str = add_character + str;
    }
    return str;

};
/* 模版 Nano Templates - https://github.com/trix/nano
 *  nano("<p>Hello {user.first_name} {user.last_name}! Your account is <strong>{user.account.status}</strong></p>", data)
 * */


Util.nano = function (template, data) {
    return template.replace(/\{([\w\.]*)\}/g, function (str, key) {
        var keys = key.split("."), v = data[keys.shift()];
        for (var i = 0, l = keys.length; i < l; i++) v = v[keys[i]];
        return (typeof v !== "undefined" && v !== null) ? v : "";
    });
};


//是否数组
Util.isString = function (arg) {
    return Object.prototype.toString.call(arg) === '[object String]';
};
//是否数组
Util.isObject = function (arg) {
    return Object.prototype.toString.call(arg) === '[object Object]';
};
//是否数组
Util.isNumber = function (arg) {
    return Object.prototype.toString.call(arg) === '[object Number]';
};
//是否数组
Util.isArray = function (arg) {
    return Object.prototype.toString.call(arg) === '[object Array]';
};
//获取当前时间戳
Util.getTime = function () {
    if (!Date.now) {
        return new Date().getTime();
    } else {
        return Date.now();
    }
};

//对js原生扩展

// 对Date的扩展，将 Date 转化为指定格式的String
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
// 例子：
// (new Date()).format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
// (new Date()).format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
Date.prototype.format = function (fmt) { //author: meizz
    var o = {
        "M+": this.getMonth() + 1,                 //月份
        "d+": this.getDate(),                    //日
        "h+": this.getHours(),                   //小时
        "m+": this.getMinutes(),                 //分
        "s+": this.getSeconds(),                 //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds()             //毫秒
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};


module.exports = Util;

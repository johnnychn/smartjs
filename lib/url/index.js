var _ = require('underscore');
var Util = require('util');

/**
 * 微信分享
 */


var Url = {};


/*
 * 获取浏览器?后所有参数的对象，没有返回{}
 * */
Url.getParams = function (url) {
    url = url || String(window.location);
    return Util.stringToVars(url.split("?")[1]);
};
/*
 * 获取#后所有参数的字符串，没有返回''
 * */
Url.getHashsString = function (url) {
    url = url || String(window.location);
    return url.split("#")[1];

};
/*
 * 获取#后所有参数的对象，没有返回{}
 * */
Url.getHashs = function (url) {
    return Util.stringToVars(Url.getHashsString(url));

};
/*
 * 设置#后所有参数
 * */
Url.setHashs = function (vars) {
    window.location = String(window.location).split("#")[0] + '#' + Util.varsToString(vars);

};
Url.cachedHashs = '';

/*
 * 检测hash是否改变
 * */
Url.onHashChange = function (hashChangeFire) {
    var self = this;

    function isHashChanged() {
        var hashString = self.getHashsString();
        if (hashString == self.cachedHashs) {
            return false

        } else {
            self.cachedHashs = hashString;
            return true;

        }
    }

    if (('onhashchange' in window) && ((typeof document.documentMode === 'undefined') || document.documentMode == 8)) {
        // 浏览器支持onhashchange事件
        window.onhashchange = hashChangeFire;  // TODO，对应新的hash执行的操作函数
    } else {
        // 不支持则用定时器检测的办法
        setInterval(function () {
            var ischanged = isHashChanged();  // TODO，检测hash值或其中某一段是否更改的函数
            if (ischanged) {
                hashChangeFire();  // TODO，对应新的hash执行的操作函数
            }
        }, 150);
    }
};


/*
 * 页面跳转
 * */
Url.getUrl = function (url) {
    window.location = url;
};

Url.reload = function () {
    location.reload();
};

//获取HTML目录
Url.getPath = function (path) {
    var p = path || window.location.href;
    var pos = p.lastIndexOf("/index.php");
    if (pos > 0) {
        p = p.substr(0, pos + 1);
    }
    pos = p.indexOf("?");
    if (pos > 0) {
        p = p.substr(0, pos + 1);
    }

    pos = p.lastIndexOf("/");
    return p.substr(0, pos + 1);

};

//获取路径里的文件名和扩展名
Url.getFileName = function (url) {
    var pos = url.lastIndexOf("/");
    if (pos == -1) {
        pos = url.lastIndexOf("\\");
    }
    var filename = url.substr(pos + 1);
    var name = filename.substring(0, filename.lastIndexOf("."));
    //文件名
    var ext = filename.substr(filename.lastIndexOf(".") + 1);
    //扩展名
    return {
        name: name,
        ext: ext
    };
};


module.exports = Url;

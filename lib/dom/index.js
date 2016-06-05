var _ = require("underscore");
var Size = require("size");
var Css = require("css");
var Input=require('input');
var Loader=require('loader');
var $ = window.$;

function Dom(dom) {
    this.baseUrl='';
    this.dom = $(dom);
}
Dom.prototype.smartCss=function(obj,ext){
    this.dom.css(Css.smartObject(obj,ext));

};
Dom.prototype.smartTransition=function(obj){
    this.dom.css(Css.transitionObject(obj));
};
Dom.prototype.transformOrigin=function (x, y, ext){
    this.dom.css(Css.transformOriginObject(x, y, ext));
};
Dom.prototype.boxShadow=function(shadow){
    this.dom.css(Css.fixCss('box-shadow',shadow));
};

Dom.prototype.size = function () {
    return new Size(0, 0, this.dom.width(), this.dom.height());
};
Dom.prototype.fillInRec = function (rec) {
    var obj = this.size().fillInRec(rec);
    var size = Css.transformObject(obj, 'px');
    this.dom.css(Css.transformOriginObject(0,0));
    this.dom.css(size);
    return obj;
};
Dom.prototype.fixInRec = function (rec) {
    var obj = this.size().fixInRec(rec);
    var size = Css.transformObject(obj, 'px');
    this.dom.css(Css.transformOriginObject(0,0));
    this.dom.css(size);
    return obj;
};
Dom.prototype.scrollTo = function (time,callback) {
    var me = this;
    var mark = $(me.dom);

    if (mark.offset()) {

    } else {
        mark = $(mark.first());
    }
    var position = mark.offset();

    var toObj = {};
        toObj.scrollTop = position.top + 'px';
        toObj.scrollLeft = position.left + 'px';
    if (window.Zepto) {
        console.log('UIGoMark is not support Zepto');
    } else {
        $('html,body').animate(toObj,time, function () {
            if (callback) {
                callback(me);
            }
        });

    }


};
Dom.prototype.maskImage=function(url){
    //兼容安卓需要加上z-index属性
    this.dom.css(Css.fixCss('mask-image','url('+url+')'));
};


Dom.prototype.preLoadImages=function(callback){
    var self = this;
    var loader = new Loader();
    this.preloader=loader;
    loader.addImages(loader.checkAllImages(self.dom));
    if(callback){
        loader.addCompletionListener(callback);
    }
    loader.start();
};


Dom.prototype.getAssetUrl = function (url) {
    if (Input.isHttp(url)||Input.isHttps(url)) {
        return url;
    } else {
        return this.baseUrl + url;

    }
};
function displayImage(dom) {
    var self = this;
    var imgurl =dom.attr('image-data');
    if (imgurl) {
        dom.attr('src', self.getAssetUrl(imgurl));
    }
    return self;
}

Dom.prototype.displayImages = function () {
    var self = this;
    $(self.dom).each(function () {
        if ($(this).prop("nodeName").toLowerCase()== 'img') {
            displayImage($(this));
        } else {
            $(this).find('img').each(function () {
                displayImage($(this));
            })
        }


    });
    return self;
};
module.exports = Dom;
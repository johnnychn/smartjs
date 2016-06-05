var _ = require('underscore');
var $ = window.$;
/**
 * 微信分享
 */

function UIGoMark(dom, option) {
    this.dom = $(dom);
    this.init(option)
}
UIGoMark.prototype.init = function (opt) {
    var me = this;
    me.opt = _.extend({time: 500, type: "y", body: 'html,body', mark: 'body'}, opt);
    me.dom.click(function () {

        me.goTop();
    })
};
UIGoMark.prototype.goPosition = function (top, left, time, callback) {
    var me = this;
    var toObj = {};
    left=left||0;
    time=time||500;
    callback=callback||function(){};

    toObj.scrollTop = top + 'px';


    toObj.scrollLeft = left + 'px';


    $(me.opt.body).animate(toObj, time, function () {
        if (callback) {
            callback(me);
        }
    });
}
UIGoMark.prototype.goTop = function () {
    var me = this;
    var mark = $(me.opt.mark);

    if (mark.offset()) {

    } else {
        mark = $(mark.first());
    }
    var position = mark.offset();

    var toObj = {};
    if (me.opt.type != 'x') {

        toObj.scrollTop = position.top + 'px'

    }
    if (me.opt.type != 'y') {

        toObj.scrollLeft = position.left + 'px'


    }


    if (window.Zepto) {
        console.log('UIGoMark is not support Zepto');
    } else {
        $(me.opt.body).animate(toObj, me.opt.time, function () {
            if (me.opt.callback) {
                me.opt.callback(me);
            }
        });

    }


};


module.exports = UIGoMark;

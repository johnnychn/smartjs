var $ = window.$;
var _ = require('underscore');
/**
 * 设备信息
 */
function ToggleButton(dom, opt) {
    this.init(dom, opt);
}
ToggleButton.prototype.init = function (dom, opt) {
    var me = this;
    this.dom = $(dom);

    this.opt=_.extend({select:false},opt);
    this.select = this.opt.select;
    this.setSelect(this.select);
    this.dom.click(function () {
        me.click();
    })
};
ToggleButton.prototype.setSelect=function(selected){
    this.select=selected;
    if (this.select) {
        this.dom.addClass('selected');
    }else{
        this.dom.removeClass('selected');
    }
    if (this.select) {
        if (this.opt.onselect) {
            this.opt.onselect(this);
        }

    }else{
        if (this.opt.unselect) {
            this.opt.unselect(this);
        }

    }
};
ToggleButton.prototype.setSelectSilence=function(selected){
    this.select=selected;
    if (this.select) {
        this.dom.addClass('selected');
    }else{
        this.dom.removeClass('selected');
    }
};


ToggleButton.prototype.click = function () {

    this.setSelect(!this.select);


};



module.exports = ToggleButton;

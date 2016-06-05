var EventDispatcher = require('event-dispatcher');
var $ = window.$;

/**
 * 文件按钮
 * change 事件
 *
 *
 * 和Fastclick有冲突
 */

var filebuttonCount=0;
function FileBtton(dom,read) {
    this.dom = $(dom);
    this.read=read||true;
    EventDispatcher.prototype.apply(FileBtton.prototype);
    this.init();
}
FileBtton.prototype.hiddenFile=function(){
    this.file.css({'height':'0px','width':'0px',overflow:"hidden"});
};
FileBtton.prototype.init = function () {
    var me = this;
    filebuttonCount++;

    me.file = $('<input type="file" style="display:none;width:0px;height:0px;overflow: hidden;" hidden="hidden" id="FileBtton_' + filebuttonCount + '"/>');
    me.dom.click(function () {
        me.file.click();
    });
    me.file.change(function () {
        var data = {type: "change",inputFile:me.file,file: me.file.get(0).files[0]};
        me.file.hide();
        me.dispatchEvent(data);
    });
};


module.exports = FileBtton;

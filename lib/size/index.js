var _ = require("underscore");
function Size(x, y, width, height) {
    this.x = x||0;
    this.y = y||0;
    this.width = width||0;
    this.height = height||0;
};
Size.prototype.fixInRec = function ( recBig) {
    var rec=this;
    var obj = {width: 0, height: 0};
    var rad = rec.width / rec.height;
    var radbig = recBig.width / recBig.height;
    if (rad > radbig) {
        obj.width = recBig.width;
        obj.height = obj.width / rad;
    } else {
        obj.height = recBig.height;
        obj.width = obj.height * rad;
    }
    obj.x = (recBig.width - obj.width) / 2;
    obj.y = (recBig.height - obj.height) / 2;
    obj.scale = obj.width / rec.width;
    return obj;
};
Size.prototype.fillInRec = function (recBig) {
    var rec=this;
    var obj = {width: 0, height: 0};
    var rad = rec.width / rec.height;
    var radbig = recBig.width / recBig.height;
    if (rad < radbig) {
        obj.width = recBig.width;
        obj.height = obj.width / rad;
    } else {
        obj.height = recBig.height;
        obj.width = obj.height * rad;

    }
    obj.x = (recBig.width - obj.width) / 2;
    obj.y = (recBig.height - obj.height) / 2;
    obj.scale = obj.width / rec.width;
    return obj;
};
module.exports = Size;
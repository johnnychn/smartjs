var _ = require("underscore");
var Util = require("util");
var Css = {};
Css.fixValue = function (value, ext) {
    if (Util.isString(value)) {
        if (Util.match(value, 'px$|%$|cm$|em$|rem$|pt$|ms$|s$')) {
            return value;
        }
    }
    if (!ext) {
        ext = 'px';
    }
    value = parseFloat(value);
    return value + ext;
};
Css.withExt=function(key,value,ext){
    if (Util.isString(key)) {
        if (Util.match(key, 'width|height|top|left|right|bottom|margin|padding|size')) {
            return this.fixValue(value, ext);
        } else {
            return value;
        }
    }
    return value;
};

Css.fixCss = function (name, attr) {
    cssObj = {};
    cssObj[name] = attr;
    cssObj['-webkit-' + name] = attr;
    cssObj['-moz-' + name] = attr;
    cssObj['-ms-' + name] = attr;
    cssObj['-o-' + name] = attr;
    return cssObj;
};
Css.transitionObject = function (obj) {
    var option = _.extend({property: "all", duration: 0, delay: 0, func: "ease"}, obj);
    var self = this;
    var transition = {};
    _.each(option, function (value, key) {
        switch (key) {
            case 'property':
                transition = _.extend(transition, self.fixCss('transition-property', value));
                break;
            case 'duration':
                transition = _.extend(transition, self.fixCss('transition-duration', value));
                break;
            case 'func':
                transition = _.extend(transition, self.fixCss('transition-timing-function', value));
                break;
            case 'delay':
                transition = _.extend(transition, self.fixCss('transition-delay', value));
                break;
        }
    });
    return transition;
};

Css.transformObject = function (obj, ext) {
    return this.fixCss('transform', this.transformString(obj, ext))
};

function formatScaleInObject(obj) {
    var scale = {scaleX: 1, scaleY: 1};
    if (_.has(obj, 'scale')) {
        scale.scaleX = obj.scale;
        scale.scaleY = obj.scale;
        delete obj.scale;
    }
    if (_.has(obj, 'scaleX')) {
        scale.scaleX = obj.scaleX;
        delete obj.scaleX;
    }
    if (_.has(obj, 'scaleY')) {
        scale.scaleY = obj.scaleY;
        delete obj.scaleY;
    }

    obj.scaleString = 'scale(' + scale.scaleX + ',' + scale.scaleY + ') ';
}

Css.transformString = function (obj, ext) {
    var self = this;
    var string = '';
    obj = _.clone(obj);
    formatScaleInObject(obj);
    _.each(obj, function (value, key) {

        switch (key) {
            case 'x':
                string += 'translateX(' + self.fixValue(value, ext) + ') ';
                break;
            case 'y':
                string += 'translateY(' + self.fixValue(value, ext) + ') ';
                break;
            case 'scaleString':
                string += value;
                break;
            case 'rotate':
                string += 'rotate(' + self.fixValue(value, 'deg') + ') ';
                break;
            case 'rotateX':
                string += 'rotateX(' + self.fixValue(value, 'deg') + ') ';
                break;
            case 'rotateY':
                string += 'rotateY(' + self.fixValue(value, 'deg') + ') ';
                break;
            case 'rotateZ':
                string += 'rotateZ(' + self.fixValue(value, 'deg') + ') ';
                break;
        }
    });
    return string;
};
Css.transformOriginObject = function (x, y, ext) {
    return this.fixCss('transform-origin', this.fixValue(x, ext) + ' ' + this.fixValue(y, ext));
};
Css.animationDurationObject = function (time) {
    return this.fixCss('animation-duration', this.fixValue(time,'s'));
};
Css.animationDelayObject = function (time) {
    return this.fixCss('animation-delay', this.fixValue(time,'s'));
};
Css.smartObject = function (obj, ext) {
    var self=this;
    obj= _.clone(obj);
    var transform = this.transformObject(obj, ext);
    Util.clearKeys(obj, ['x', 'y', 'scale', 'scaleX', 'scaleY', 'rotate', 'rotateX', 'rotateY']);
    _.each(obj,function(value,key){
        obj[key]=self.withExt(key,value,ext);
    });
    return _.extend(obj,transform);
};
module.exports = Css;
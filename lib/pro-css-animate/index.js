/*
 * Author: Johnny Chen
 */

var Css = require('css');
var _ = require("underscore");
var Tween = require("tween");
var Dom=require("dom");
var $ = window.$;

// ext  'px' or '%'
//limitToRange 强制将值限制在 范围内
// allowOutRange 是否允许超过范围的值

var ProCSSAnimate = function (dom, from, to, option) {
    this.dom = $(dom);
    this.smartDom=new Dom(dom);
    this.from = from;
    this.to = to;
    this.option = _.extend({min: 0, max: 1, ext: "px", outRangeUpdate: true,limitToRange:true}, option);
    this.option.size = this.option.max - this.option.min;
    this.init();
};

ProCSSAnimate.prototype.init = function () {
    var self = this;
    self.value = 0;
    self.current = {};
    for (var i in self.to) {
        var tov = parseFloat(self.to[i]);
        if (!self.from.hasOwnProperty(i))  {
          self.from[i]=tov;

        }
    }
    self.updateDom = function () {
        self.smartDom.smartCss(self.current,self.option.ext);
    };
    self.updateValue = function (v) {
        self.value = v;
        self.realValue = (v - self.option.min) / self.option.size;
        if (false == self.option.outRangeUpdate) {
            if (self.realValue < 0 || self.realValue > 1) {
                return;
            }
        }
        if(self.option.limitToRange==true){
            self.realValue = Math.max(Math.min(self.realValue, 1), 0);
        }
        var d, subd;
        for (var i in self.to) {
            var tov = self.to[i];
            var fromv = self.from[i];
                d = tov - fromv;
                d = self.realValue * d;
                self.current[i] = d + fromv;
        }
        self.updateDom();
    };
    self.updateValue(0);

};
var ProCSSAnimateManager = function () {
    this.init();
};
ProCSSAnimateManager.prototype.init = function () {
    var self = this;
    self.list = [];
    self.value = 0;
    self.add = function (pca) {
        self.list.push(pca);
    };
    self.remove = function (pca) {
        self.list = _.without(self.list, pca);
    };
    self.updateAnimates = function () {
        _.each(self.list, function (pca) {
            pca.updateValue(self.value);
        })
    };
    self.updateValue = function (v) {
        self.value = v;
        self.updateAnimates();
    }
    self.tweenTo = function (v, time, func) {
        if (!func) {
            func = Tween.Sine.inOut;
        }
        if (!time) {
            time = 0.5;
        }
        var target = {value: self.value};
        return VA.Tween.to(target, time, {value: v}).ease(func).step(function (tween) {
            self.updateValue(target.value);

        });
    }


};
ProCSSAnimateManager.prototype.createAnimate = function (dom, from, to, option) {
    return new ProCSSAnimate(dom, from, to, option);
};

module.exports = ProCSSAnimateManager;


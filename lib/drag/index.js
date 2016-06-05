/**
 * Created by johnny on 16/3/13.
 */
/*!
 * drag.js - copyright Jake Luer 2011
 * https://github.com/jakeluer/drag.js
 * MIT License
 */
var _ = require('underscore');
var $ = window.$;
var EventDispatcher = require("event-dispatcher");
var Tween=require('tween');
/**
 * 设备信息
 */
var is_touch_device = !!('ontouchstart' in window);

var Drag = function (dom, option) {
    var def = {minX: 0, maxX: 100, minY: 0, maxY: 0, scaleX: 1, scaleY: 1,startDom:false};
    this.opt = _.extend(def, option);
    this.opt.width = this.opt.maxX - this.opt.minX;
    this.opt.height = this.opt.maxY - this.opt.minY;
    this.dom = $(dom);
    if(this.opt.startDom==false){
        this.startDom=this.dom;
    }else {
        this.startDom=$( this.opt.startDom);
    }

    this.init();
};

function getPositon(e) {
    if (is_touch_device) {
        var _touch = e.originalEvent.targetTouches[0];
        if (!_touch) {
            _touch = e.originalEvent.changedTouches[0];
        }
        return {x: _touch.clientX, y: _touch.clientY};
    } else {
        return {x: e.originalEvent.clientX, y: e.originalEvent.clientY};
    }
}

Drag.prototype.init = function () {

    EventDispatcher.prototype.apply(Drag.prototype);
    var self = this;
    var dis = {x: 0, y: 0};
    var startPos = {x: 0, y: 0};
    var start;

    self.updateScale = function (x, y) {
        self.opt.scaleX = x;
        self.opt.scaleY = y;
    };
    self.setValue = function (vx, vy) {
        var pos = {};
        pos.x = vx * self.opt.width+ self.opt.minX;
        pos.y = vy * self.opt.height + self.opt.minY;
        self.update(pos);
        self.dispatchEvent({type: "update"});

    };
    self.destroy=function(){
        $(window).unbind(self.evs.move, self.dragMove);
        $(window).unbind(self.evs.end, self.dragEnd);
        self.startDom.unbind(self.evs.start, self.dragStart);
    };


    self.tweenTo = function (vx, vy, time, func) {
        if (!func) {
            func = Tween.Sine.inOut;
        }
        if (!time) {
            time = 0.5;
        }

        var target = {valueX: self.valueX, valueY: self.valueY};

        self.tween_obj = Tween.to(target, time, {valueX: vx, valueY: vy}).ease(func).step(function (tween) {
            self.setValue(tween.target.valueX,  tween.target.valueY);

        });
        return self.tween_obj;
    };

    self.update = function (domPos) {
        domPos.x = Math.max(Math.min(domPos.x, self.opt.maxX), self.opt.minX);
        domPos.y = Math.max(Math.min(domPos.y, self.opt.maxY), self.opt.minY);
        if (self.opt.width == 0) {
            self.valueX = 0;
        } else {
            self.valueX = (domPos.x - self.opt.minX) / self.opt.width;
        }
        if (self.opt.height == 0) {
            self.valueY = 0;
        } else {
            self.valueY = (domPos.y - self.opt.minY) / self.opt.height;
        }

        self.dom.css({'margin-left': domPos.x, 'margin-top': domPos.y});


    };

    function getAbsPos(pos){
        pos.x = pos.x / self.opt.scaleX;
        pos.y = pos.y / self.opt.scaleY;
        return   {x: startPos.x + pos.x, y: startPos.y + pos.y};
    }

    self.dragMove = function (e) {
        var pos = getPositon(e);
        dis.x = pos.x - start.x;
        dis.y = pos.y - start.y;
        self.update(getAbsPos(dis));
        self.dispatchEvent({type: "update"});
    };
    self.dragEnd = function (e) {
        var pos = getPositon(e);
        dis.x = pos.x - start.x;
        dis.y = pos.y - start.y;
        self.update(getAbsPos(dis));
        $(window).unbind(self.evs.move, self.dragMove);
        $(window).unbind(self.evs.end, self.dragEnd);
        self.startDom.bind(self.evs.start, self.dragStart);
        self.dispatchEvent({type: "end"});
    };


    self.dragStart = function (e) {
        if (self.tween_obj) {
            self.tween_obj.kill();
        }
        startPos.x = parseFloat(self.dom.css('margin-left'));
        startPos.y = parseFloat(self.dom.css('margin-top'));
        start = getPositon(e);
        dis.x = dis.y = 0;
        self.update(getAbsPos(dis));
        $(window).bind(self.evs.move, self.dragMove);
        $(window).bind(self.evs.end, self.dragEnd);
        self.startDom.unbind(self.evs.start, self.dragStart);
        self.dispatchEvent({type: "start"});
    };

    self.evs = (function () {
        if (is_touch_device) {
            return {
                start: 'touchstart',
                move: 'touchmove',
                end: 'touchend'
            };
        }
        else {
            return {
                start: 'mousedown',
                move: 'mousemove',
                end: 'mouseup'
            };
        }
    }());
    var prevDef = function (e3) {
        e3.preventDefault();
        e3.stopPropagation();
    };
    self.dom.bind('selectstart', prevDef);
    self.dom.bind('dragstart', prevDef);
    self.startDom.bind(self.evs.start, self.dragStart);
};


module.exports = Drag;

/*
 * Author: Alex Gibson
 * https://github.com/alexgibson/shake.js
 * License: MIT license
 */

(function (global, factory) {
    if (typeof define === 'function' && define.amd) {
        define(function () {
            return factory(global, global.document);
        });
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory(global, global.document);
    } else {
        global.CSSAnimations = factory(global, global.document);
    }
}(typeof window !== 'undefined' ? window : this, function (window, document) {


    var _ = require('underscore');
    var Util = require('util');
    var Css = require('css');
    var $ = window.$;
    // Utility

    function findKeyframeRules(styles, func) {
        var rules = styles.cssRules || styles.rules || [];

        for (var i = 0; i < rules.length; i++) {
            var rule = rules[i];

            if (rule.type == CSSRule.IMPORT_RULE) {
                findKeyframeRules(rule.styleSheet, func);
            }
            else if (rule.type === CSSRule.KEYFRAMES_RULE ||
                rule.type === CSSRule.MOZ_KEYFRAMES_RULE ||
                rule.type === CSSRule.WEBKIT_KEYFRAMES_RULE) {
                func(rule, styles, i);
            }
        }
    }

    // Classes

    function KeyframeRule(r) {
        this.original = r;
        this.keyText = r.keyText;
        this.css = {};

        // Extract the CSS as an object
        var rules = r.style.cssText.split(';');

        for (var i = 0; i < rules.length; i++) {
            var parts = rules[i].split(':');

            if (parts.length == 2) {
                var key = parts[0].replace(/^\s+|\s+$/g, '');
                var value = parts[1].replace(/^\s+|\s+$/g, '');

                this.css[key] = value;
            }
        }
    };

    function KeyframeAnimation(kf) {
        this.original = kf;
        this.name = kf.name;
        this.keyframes = [];
        this.keytexts = [];
        this.keyframeHash = {};

        this.initKeyframes();
    };

    KeyframeAnimation.prototype.initKeyframes = function () {
        this.keyframes = [];
        this.keytexts = [];
        this.keyframeHash = {};

        var rules = this.original;

        for (var i = 0; i < rules.cssRules.length; i++) {
            var rule = new KeyframeRule(rules.cssRules[i]);
            this.keyframes.push(rule);
            this.keytexts.push(rule.keyText);
            this.keyframeHash[rule.keyText] = rule;
        }
    };

    KeyframeAnimation.prototype.getKeyframeTexts = function () {
        return this.keytexts;
    };

    KeyframeAnimation.prototype.getKeyframe = function (text) {
        return this.keyframeHash[text];
    };

    KeyframeAnimation.prototype.fixStyle = function (name, value) {
        var style = name + ':' + value + ';';
        switch (name) {

            case 'transform':
                style += '-webkit-' + name + ':' + value + ';';
                break;
            case 'transform-origin':
                style += '-webkit-' + name + ':' + value + ';';
                break;
            case 'transform-style':
                style += '-webkit-' + name + ':' + value + ';';
                break;
            case 'perspective':
                style += '-webkit-' + name + ':' + value + ';';
                break;
            case 'perspective-origin':
                style += '-webkit-' + name + ':' + value + ';';
                break;
            case 'backface-visibility':
                style += '-webkit-' + name + ':' + value + ';';
                break;

        }


        return style;
    };


    KeyframeAnimation.prototype.setKeyframe = function (text, css) {
        var self = this;
        var cssRule = text + " {";
        for (var k in css) {
            cssRule += self.fixStyle(k, css[k]);
        }
        cssRule += "}";

        // The latest spec says that it should be appendRule, not insertRule.
        // Browsers also vary in the semantics of this, whether or not the new
        // rules are merged in with previous ones at the same keyframe or if they
        // are simply replaced. Need to look into that more.
        //
        // https://github.com/jlongster/css-animations.js/issues/4
        if ('appendRule' in this.original) {
            this.original.appendRule(cssRule);
        }
        else {
            this.original.insertRule(cssRule);
        }

        this.initKeyframes();

        // allow for chaining for ease of creation.
        return this;
    };

    KeyframeAnimation.prototype.setKeyframes = function (obj) {
        for (var k in obj) {
            this.setKeyframe(k, obj[k]);
        }
    };

    KeyframeAnimation.prototype.clear = function () {
        for (var i = 0; i < this.keyframes.length; i++) {
            this.original.deleteRule(this.keyframes[i].keyText);
        }
    };

    function Animations() {
        this.animations = {};
        this.id = 0;

        var styles = document.styleSheets;
        var anims = this.animations;

        for (var i = 0; i < styles.length; i++) {
            try {
                findKeyframeRules(styles[i], function (rule) {
                    anims[rule.name] = new KeyframeAnimation(rule);
                });
            }
            catch (e) {
                // Trying to interrogate a stylesheet from another
                // domain will throw a security error
            }
        }
    }

    Animations.prototype.get = function (name) {
        return this.animations[name];
    };

    Animations.prototype.getDynamicSheet = function () {
        if (!this.dynamicSheet) {
            var style = document.createElement('style');
            style.rel = 'stylesheet';
            style.type = 'text/css';
            document.getElementsByTagName('head')[0].appendChild(style);
            this.dynamicSheet = style.sheet;
        }

        return this.dynamicSheet;
    };
    Animations.prototype.createSmartAnimation = function (from, to) {
        var self=this;
        var ext = 'px';//后缀
        var smartObjects;
        if (Util.isString(_.last(arguments))) {
            ext = _.last(arguments);
            smartObjects = _.without(arguments, ext);
        } else {
            smartObjects = arguments;
        }
       var animations={};
        var step=smartObjects.length-1;
        _.each(smartObjects,function(obj,index){
            var key=parseInt(index/step*100)+'%';
            animations[key]=Css.smartObject(obj,ext);

        });
        return self.create(animations);
    };

    Animations.prototype.create = function (name, frames) {
        var styles = this.getDynamicSheet();

        // frames can also be passed as the first parameter
        if (typeof name === 'object') {
            frames = name;
            name = null;
        }

        if (!name) {
            this.id++;
            name = 'johnny_css_animation_' + this.id;
        }

        // Append a empty animation to the end of the stylesheet
        try {
            var idx = styles.insertRule('@keyframes ' + name + '{}',
                styles.cssRules.length);
        }
        catch (e) {
            if (e.name == 'SYNTAX_ERR' || e.name == 'SyntaxError') {
                idx = styles.insertRule('@-webkit-keyframes ' + name + '{}',
                    styles.cssRules.length);
            }
            else {
                throw e;
            }
        }

        var anim = new KeyframeAnimation(styles.cssRules[idx]);
        this.animations[name] = anim;

        if (frames) {
            anim.setKeyframes(frames);
        }

        return anim;
    };

    Animations.prototype.remove = function (name) {
        var styles = this.getDynamicSheet();
        name = name instanceof KeyframeAnimation ? name.name : name;

        this.animations[name] = null;

        try {
            findKeyframeRules(styles, function (rule, styles, i) {
                if (rule.name == name) {
                    styles.deleteRule(i);
                }
            });
        }
        catch (e) {
            // Trying to interrogate a stylesheet from another
            // domain will throw a security error
        }
    };
    Animations.prototype.clearAnimationByID = function (id) {
        var ele = typeof(id) == 'string' ? document.getElementById(id) : id;
        ele.style.animationName = null;
        var self = this;

        self.setCss(ele, "animation-name", '');

    };
    Animations.prototype.setCss = function (dom, name, value) {
        dom.style['-webkit-' + name] = value;
        dom.style[name] = value;

    };
    Animations.prototype.addAnimation = function (dom, option) {
        var me = this;
        $(dom).each(function () {
            me.addAnimationToID($(this).get(0), option);
        })
    };


    Animations.prototype.addAnimationToID = function (id, option) {
        var ele = typeof(id) == 'string' ? document.getElementById(id) : id;
        ele.style.animationName = option.name;
        var self = this;
        for (var prop in option) {
            if (option.hasOwnProperty(prop)) {

                switch (prop) {
                    case "name":
                        self.setCss(ele, "animation-name", option[prop]);
                        break;
                    case "duration":
                        self.setCss(ele, "animation-duration", option[prop]);
                        break;
                    case "func":
                        self.setCss(ele, "animation-timing-function", option[prop]);
                        break;
                    case "delay":
                        self.setCss(ele, "animation-delay", option[prop]);
                        break;
                    case "count":
                        self.setCss(ele, "animation-iteration-count", option[prop]);
                        break;
                    case "direction":
                        self.setCss(ele, "animation-direction", option[prop]);
                        break;
                    case "state":
                        self.setCss(ele, "animation-play-state", option[prop]);
                        break;
                    case "transform-origin":
                        self.setCss(ele, "transform-origin", option[prop]);
                        break;
                    case 'transform':
                        self.setCss(ele, "transform", option[prop]);
                        break;
                    case 'transform-style':
                        self.setCss(ele, "transform-style", option[prop]);
                        break;
                    case 'perspective':
                        self.setCss(ele, "perspective", option[prop]);
                        break;
                    case 'perspective-origin':
                        self.setCss(ele, "perspective-origin", option[prop]);
                        break;
                    case 'backface-visibility':
                        self.setCss(ele, "backface-visibility", option[prop]);
                        break;
                }


            }
        }


    };

    return window.CSSAnimations = new Animations;
}));

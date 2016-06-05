"use strict";

var _ = require('underscore');
var Util=require('util');
var Css=require('css');
var Size=require('size');
var Input=require('input');
var File=require('file');
var FileButton=require('file-button');
var EventDispatcher=require('event-dispatcher');
var Drag=require('drag');
var Sound=require('sound');
var Tween=require('tween');
var CssAnimations=require('css-animations');
var ProCssAnimate=require('pro-css-animate');
var ToggleButton=require('toggle-button');
var AjaxFileUpload=require("ajax-file-upload");
var FastClick=require('fast-click');
var RandomColor=require('random-color');
var EasyAnimation = require("easy-animation");
var EasyAnimationManager = require("easy-animation-manager");
var Form=require("form");
var Loader=require('loader');
var MovieClip=require('movie-clip');
var Device=require('device');
var Dom=require('dom');
var Url=require('url');
var Video=require('video');
var Share=require('share');


var SmartJS = function (options) {
    this.copyright = 'www.2smart.cn';
   // console.log('By 2Smart ' + this.copyright);
    //赋值模块
    this._ = _;
    this.Util=Util;
    this.Css=Css;
    this.Size=Size;
    this.Input=Input;
    this.File=File;
    this.FileButton=FileButton;
    this.EventDispatcher=EventDispatcher;
    this.Drag=Drag;
    this.Sound=Sound;
    this.Tween=Tween;
    this.CssAnimations=CssAnimations;
    this.ProCssAnimate=ProCssAnimate;
    this.ToggleButton=ToggleButton;
    this.AjaxFileUpload=AjaxFileUpload;
    this.FastClick=FastClick;
    this.RandomColor=RandomColor;
    this.EasyAnimation=EasyAnimation;
    this.EasyAnimationManager=EasyAnimationManager;
    this.Form=Form;
    this.Loader=Loader;
    this.MovieClip=MovieClip;
    this.Dom=Dom;
    this.Url=Url;
    this.Video=Video;
    this.Device=Device;
    this.Share=Share;
};




module.exports = window.SmartJS = new SmartJS();



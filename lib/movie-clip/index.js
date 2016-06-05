var _ = require('underscore');
var $ = window.$;
var EventDispatcher = require("event-dispatcher");
var Util = require("util");

/**
 * 影片剪辑
 *
 *  Event  frame  play pause stop
 *
 */
function MovieClip(dom, opt) {
    if ($(dom).data('movieclip')) {
        console.log('inited movieclip');
        return $(dom).data('movieclip');
    }
    this.dom = $(dom);
    this.option = {};
    this.option.frameTime = 100;
    this.option.playOnce = false;
    this.option.loop = true;
    this.option.defaultActon = {name: 'default', frames: [1, -1]};

    this.option = $.extend(this.option, opt);


}


MovieClip.prototype.init = function () {
    EventDispatcher.prototype.apply(MovieClip.prototype);


    var movieClip = this;

    movieClip.frames = movieClip.dom.find('.movieclip_frame');
    movieClip.frames.css({padding: '0px'});
    movieClip.currentFrame = 1;
    movieClip.totalFrame = movieClip.frames.size();
    movieClip.playing = false;


    movieClip.loop = this.option.loop;

    this.option.defaultActon.frames[1] = movieClip.totalFrame;

    movieClip.action = movieClip.option.actions ? movieClip.option.actions[0] : this.option.defaultActon;

    movieClip.frame = function (frame) {

        movieClip.frames.hide();
        $(movieClip.frames.toArray()[frame - 1]).show();
        movieClip.currentFrame = frame;
        movieClip.dispatchEvent({type: "frame", frame: movieClip.currentFrame});


    };
    movieClip.nextFrame = function () {


        if (movieClip.currentFrame < movieClip.action.frames[1]) {


            movieClip.frame(movieClip.currentFrame + 1);
        } else {
            movieClip.frame(movieClip.action.frames[0]);
        }


        if (movieClip.loop == false && movieClip.currentFrame == movieClip.action.frames[1]) {
            movieClip.stop();
            return movieClip;
        } else {
            if (movieClip.playing == true) {
                movieClip.autoNextFrame();


            }

        }


    };
    movieClip.autoNextFrame = function () {
        movieClip.playing_iv = setTimeout(movieClip.nextFrame, movieClip.option.frameTime);

    };
    movieClip.clearAutoNextFrame = function () {
        clearTimeout(movieClip.playing_iv);

    };

    movieClip.delayPlay = function (time) {
        clearTimeout(movieClip.iv);
        movieClip.iv = setTimeout(movieClip.play, time);

    };


    movieClip.play = function () {
        clearTimeout(movieClip.iv);
        if (movieClip.playing == true) {
            return;
        }


        movieClip.clearAutoNextFrame();
        movieClip.autoNextFrame();
        movieClip.playing = true;


        movieClip.dispatchEvent({type: "play", frame: movieClip.currentFrame});
        movieClip.frame(movieClip.currentFrame);

    };
    movieClip.pause = function () {
        if (movieClip.playing == false) {
            return;
        }
        movieClip.clearAutoNextFrame();

        movieClip.playing = false;
        movieClip.dispatchEvent({type: "pause", frame: movieClip.currentFrame});

    };
    movieClip.stop = function () {
        if (movieClip.playing == false) {
            return;
        }
        movieClip.clearAutoNextFrame();


        movieClip.playing = false;
        movieClip.dispatchEvent({type: "stop", frame: movieClip.currentFrame});


    };


    movieClip.skipToAction = function (action) {
        for (var i = 0; i < movieClip.option.actions.length; i++) {
            if (action == movieClip.option.actions[i].name) {
                movieClip.action = movieClip.option.actions[i];
                break;

            }

        }
        movieClip.frame(movieClip.action.frames[0]);

        movieClip.play();

    };
    if (movieClip.totalFrame == 0) {
        return movieClip;
    }
    movieClip.frame(1);


    $(movieClip.dom).data('movieclip', movieClip);


};


MovieClip.prototype.buildHtml = function (dom, html, from, to, ID_length,reduceFrame) {
    var img;
    //reduceFrame 每几帧减少一帧

    var id=0;
    reduceFrame=reduceFrame||0;


    if (from < to) {

        for (var i = from; i <= to; i++) {
            if(reduceFrame>0){


                id++;
                if((id%reduceFrame)==0){
                    continue;
                }
            }
            img = $(html.replace('{ID}',Util.intToString(i, ID_length)));
            img.hide();

            $(dom).append(img);

        }
    } else {
        for (var i = from; i >= to; i--) {
            if(reduceFrame>0){


                id++;
                if((id%reduceFrame)==0){
                    continue;
                }
            }
            img = $(html.replace('{ID}', Util.intToString(i, ID_length)));
            img.hide();

            $(dom).append(img);

        }
    }


};


module.exports = MovieClip;

var _ = require('underscore');
var EventDispatcher = require("event-dispatcher");
/**
 * 声音播放
 */

function Sound(config) {
    this.init(config);
}

Sound.prototype = {
    init: function (config) {
        var me = this;
        EventDispatcher.prototype.apply(Sound.prototype);
        this.config = _.extend({

            autoload: false


        }, config);

        if (!this.config.path) {
            console.log('path is need');
        } else {

            this.audio = new Audio(this.config.path);
            for (var key in this.config) {
                if (this.config.hasOwnProperty(key) && (key in this.audio)) {
                    this.audio[key] = this.config[key];
                }
            }
            this.audio.onended = function () {
                me.dispatchEvent({type: "onended"});
            }
            this.audio.oncanplay=function(){
                me.dispatchEvent({type: "oncanplay"});
            }
            this.audio.onloadeddata = function () {
                //me.stop();
                me.dispatchEvent({type: "onloadeddata"});
            };
            this.audio.load();

        }

    },

    play: function () {

        this.audio.play();
        this.dispatchEvent({type: "play"});
    },
    destory: function () {
        this.audio.src = '';
    },
    pause: function () {

        this.audio.pause();
        this.dispatchEvent({type: "pause"});
    },
    playing:function(){
        return !this.audio.paused;
    },
    currentTime:function(){
        return this.audio.currentTime;
    },
    duration:function(){
        return this.audio.duration;
    },

    onended:function(){
        this.dispatchEvent({type: "stop"});
    },

    stop: function () {
        this.audio.pause();
       // this.audio.currentTime = 0;
        this.dispatchEvent({type: "stop"});
    },

    toggle: function () {

        if (this.audio.paused) {

            this.play();
        } else {
            this.pause();
        }

    },

    seek: function (time) {

        this.audio.currentTime = parseInt(time, 10);
    },


    percent: function () {
        return (this.audio.currentTime / this.audio.duration) || 0;

    }


};


module.exports = Sound;

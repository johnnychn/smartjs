var _ = require('underscore');
var EventDispatcher = require("event-dispatcher");
/**
 * 声音播放
 *
 *  autoplay: true 如果false的话,视频有问题(iphone上) 可以在canplay后暂停
 *
 */

function Video(config) {
    this.init(config);
}

Video.prototype = {
    init: function (config) {
        var me = this;
        EventDispatcher.prototype.apply(Video.prototype);
        this.config = _.extend({
            autoplay: true,
            autoload: false


        }, config);

        if (!this.config.src) {
            console.log('path is need');
        } else {

            var videoObj = $('<video></video>');

            if (this.config.inline != false) {
                videoObj.attr('webkit-playsinline', true);
            }

            this.video = videoObj.get(0);
            for (var key in this.config) {
                if (this.config.hasOwnProperty(key) && (key in this.video)) {
                    this.video[key] = this.config[key];
                }
            }
            this.video.oncanplay = function () {
                me.dispatchEvent({type: "canplay"});
            }
            this.video.onended = function () {
                //me.stop();
                me.dispatchEvent({type: "ended"});
            };
            this.video.onloadeddata = function () {
                //me.stop();
                me.dispatchEvent({type: "onloadeddata"});
            };



            this.endedCheck();
            this.video.load();

        }

        //   console.log(this)

    },
    removeEndedCheck: function () {
        clearInterval(this.iv);
    },
    endedCheck: function () {
        var me = this;
        me.removeEndedCheck();
        this.iv = setInterval(function () {
            //me.stop();
            if (me.currentTime() < 1) {
                return;
            }
            if (me.currentTime() >= me.duration()) {
                me.dispatchEvent({type: "ended"});
                me.removeEndedCheck();
            }
        }, 100);
    },

    play: function () {
        this.endedCheck();
        this.video.play();
        this.dispatchEvent({type: "play"});
    },

    pause: function () {
        this.removeEndedCheck();
        this.video.pause();
        this.dispatchEvent({type: "pause"});
    },
    playing: function () {
        return !this.video.paused;
    },

    currentTime: function () {
        return this.video.currentTime;
    },
    duration: function () {
        return this.video.duration;
    },
    stop: function () {
        this.video.pause();
        this.removeEndedCheck();
        this.dispatchEvent({type: "stop"});
    },
    destory: function () {
        this.video.src = '';
    },

    toggle: function () {

        if (this.video.paused) {

            this.play();
        } else {
            this.pause();
        }

    },
    seek: function (a) {
        var player = this;

        function seekTo(t) {
            var b = player;
            try {
                player.video.currentTime = t, player.video.paused && player.video.play()
            } catch (c) {
                player.video.one("canplay", function () {
                    b.video.currentTime = t, b.video.paused && b.video.play()
                })
            }
            player.endedCheck();
        }

        function seek(t) {
            if (!isNaN(t)) {
                var b = this, c = null;
                c && (clearTimeout(c), c = null);
                var d = player.video.seekable;
                1 == d.length && t < d.end(0) ? seekTo(t) : c = setTimeout(function () {
                    seek(t)
                }, 100)
            }
        }


        seek(a);
    },


    percent: function () {
        return (this.video.currentTime / this.video.duration) || 0;

    }


};


module.exports = Video;

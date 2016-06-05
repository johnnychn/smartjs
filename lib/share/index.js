var _ = require('underscore');
var Util = require('util');
var Device = require('device');
var Url = require('url');
var Input = require('input');

var Share = {};

/**
 * 微信分享
 */

function WechatShare(config) {
    this.init(config);
}


//默认参数
var wechat_share_defaults = {
    sdk: 'http://api.visionape.cn/wechat/?', //授权链接
    type: 'SDK',// SDK 或者 TXGAME
    jsApiList: [
        'checkJsApi',
        'onMenuShareTimeline',
        'onMenuShareAppMessage',
        'onMenuShareQQ',
        'onMenuShareWeibo',
        'hideMenuItems',
        'showMenuItems',
        'hideAllNonBaseMenuItem',
        'showAllNonBaseMenuItem',
        'translateVoice',
        'startRecord',
        'stopRecord',
        'onRecordEnd',
        'playVoice',
        'pauseVoice',
        'stopVoice',
        'uploadVoice',
        'downloadVoice',
        'chooseImage',
        'previewImage',
        'uploadImage',
        'downloadImage',
        'getNetworkType',
        'openLocation',
        'getLocation',
        'hideOptionMenu',
        'showOptionMenu',
        'closeWindow',
        'scanQRCode',
        'chooseWXPay',
        'openProductSpecificView',
        'addCard',
        'chooseCard',
        'openCard'
    ],
    shareData: {
        appmessage: {
            title: "",
            desc: "",
            img: "",
            link: ""
        }, timeline: {
            title: "",
            img: "",
            link: ""
        }
    }

};

WechatShare.prototype._loadHtmlInfo = function () {

    function getUrl(link) {
        if (!link) {
            return false;
        }
        if (Input.isHttp(link) || Input.isHttps(link)) {
            return link;
        } else {
            return Url.getPath() + link;
        }

    }

    this.config.shareData.appmessage.title = Util.getContentByName('wxm:appmessage_title');
    this.config.shareData.appmessage.desc = Util.getContentByName('wxm:appmessage_desc');
    this.config.shareData.appmessage.img_url =getUrl(Util.getContentByName('wxm:img_url')) || getUrl('share.jpg');
    this.config.shareData.appmessage.link = Util.getContentByName('wxm:link') || Url.getPath();
    this.config.shareData.timeline.title = Util.getContentByName('wxm:timeline_title');
    this.config.shareData.timeline.img_url = getUrl(Util.getContentByName('wxm:img_url')) ||getUrl('share.jpg');
    this.config.shareData.timeline.link = Util.getContentByName('wxm:link') || Url.getPath();

};

WechatShare.prototype._TXGAMESDK = function (callback) {
    //目前只有腾讯游戏项目支持，其他项目请调用 getSDK
    var self = this;
    try {
        WXJssdk.init(function (wx) {
            callback.apply(self, [wx]);

        })
    } catch (e) {


    }

};


WechatShare.prototype._getSDK = function (callback, apilist) {
    var self = this;

    $.getJSON(this.config.sdk + 'url=' + encodeURIComponent(location.href.replace(/[\#][\s\S]*/, '')) + '&callback=?', function (data) {

        try {

            wx.config({

                appId: data.appId,
                timestamp: data.timestamp,
                nonceStr: data.nonceStr,
                signature: data.signature,
                jsApiList: apilist
            });

            callback.apply(self, [wx]);
        } catch (e) {

        }


    });

};


WechatShare.prototype.update = function () {

    try {


        var self = this;

        wx.ready(function () {
            wx.onMenuShareAppMessage({
                title: self.config.shareData.appmessage.title,
                desc: self.config.shareData.appmessage.desc,
                link: self.config.shareData.appmessage.link,
                imgUrl: self.config.shareData.appmessage.img_url,
                trigger: self.config.shareData.appmessage.trigger,
                success: self.config.shareData.appmessage.success || function () {
                }, cancel: self.config.shareData.appmessage.cancel || function () {
                }, fail: self.config.shareData.appmessage.fail || function () {
                }

            });
            wx.onMenuShareTimeline({
                title: self.config.shareData.timeline.title,
                link: self.config.shareData.timeline.link,
                imgUrl: self.config.shareData.timeline.img_url,
                trigger: self.config.shareData.timeline.trigger,
                success: self.config.shareData.timeline.success || function () {
                },
                cancel: self.config.shareData.timeline.cancel || function () {
                },
                fail: self.config.shareData.timeline.fail || function () {
                }
            })
        })
    } catch (e) {
    }
};


WechatShare.prototype.init = function (config) {
    var self = this;
    this.config = _.extend(wechat_share_defaults, config);
    this._loadHtmlInfo();

    //if (false == Device.wechat) {
    //    //非微信
    //    return;
    //}

    if (this.config.type == 'SDK') {
        Util.getScript('http://res.wx.qq.com/open/js/jweixin-1.0.0.js', function () {
            self._getSDK(self.update, self.config.jsApiList);
        })
    } else if (this.config.type == 'TXGAME') {
        Util.getScript('http://ossweb-img.qq.com/images/js/WXJssdk.js', function () {
            self._TXGAMESDK(self.update);
        })
    }
};

WechatShare.prototype.set = function () {

    if (arguments.length === 3 && _.isString(arguments[0]) && _.isString(arguments[1])) {
        this.config.shareData[arguments[0]][arguments[1]] = arguments[2];
    } else {
        console.log('[WechatShare] set 函数参数错误')
    }

};
Share.WechatShare = WechatShare;

module.exports = Share;
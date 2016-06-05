var _ = require('underscore');
var $ = window.$;

/**
 * 微信分享
 */



'use strict';


function EasyAnimation(dom, config) {


    var self = this;
    self.elems = {};
    self.serial = 1;
    self.blocked = false;
    self.domString = dom;

    config.viewport = $(dom) || $(window.document.documentElement);


    self.config = _.extend(self.defaults, config);


    self.init();
}

EasyAnimation.prototype = {


    defaults: {

        enter: 'bottom',
        move: '8px',
        over: '0.6s',
        wait: '0s',
        easing: 'ease',

        scale: {direction: 'up', power: '5%'},
        rotate: {x: 0, y: 0, z: 0},

        opacity: 0,
        mobile: false,
        visible: false,
        reset: false,

        //        Expects a reference to a DOM node (the <html> node by default)
        //        which is used as the context when checking element visibility.


        //        'always' — delay every time an animation resets
        //        'onload' - delay only for animations triggered by first load
        //        'once'   — delay only the first time an animation reveals
        delay: 'once',

        //        vFactor changes when an element is considered in the viewport.
        //        The default value of 0.60 means 60% of an element must be
        //        visible for its reveal animation to trigger.
        vFactor: 0.60,

        complete: function (el) {
        } // Note: reset animations do not complete.
    },

    // Queries the DOM, builds scrollReveal elements and triggers animation.
    // @param {boolean} flag — a hook for controlling delay on first load.
    init: function () {
        var self = this;
        var serial;
        var elem;
        var query = [];


        if (self.config.viewport.attr('data-sr')) {
            query.push(self.config.viewport.get(0));
        }

        self.config.viewport.each(function () {
            query = query.concat(Array.prototype.slice.call($(this).get(0).querySelectorAll('[data-sr]')));
        });


        query.forEach(function (el) {

            serial = self.serial++;
            elem = self.elems[serial] = {domEl: el};
            elem.config = self.configFactory(elem);
            elem.styles = self.styleFactory(elem);


            elem.seen = false;

            el.removeAttribute('data-sr');


            el.setAttribute('style',
                elem.styles.inline
                + elem.styles.initial
            );


        });

        if (self.config.visible == true) {
            self.show();
        } else {
            self.hide();
        }

    },

    show: function () {
        this.animate(true)
    },
    hide: function () {
        this.animate(false);
    },

    // Applies and removes appropriate styles.
    // @param {boolean} flag — a hook for controlling delay on first load.


    toggle: function (skip) {

        if (this.visible) {

            this.hide(skip)
        } else {
            this.show(skip)
        }

    },


    animate: function (visible) {
        var self = this;
        this.visible = visible;

        var key;
        var elem;
        //  var visible;

        // Begin element store digest.

      //  console.log(visible);
        for (key in self.elems) {
            if (self.elems.hasOwnProperty(key)) {

                elem = self.elems[key];
                // visible = self.isElemInViewport( elem );

                if (visible) {

                    if (self.config.delay === 'always'
                        || ( self.config.delay === 'onload' && flag )
                        || ( self.config.delay === 'once' && !elem.seen )) {

                        // Use delay.
                        elem.domEl.setAttribute('style',
                            elem.styles.inline
                            + elem.styles.target
                            + elem.styles.transition
                        );

                    } else {

                        // Don’t use delay.
                        elem.domEl.setAttribute('style',
                            elem.styles.inline
                            + elem.styles.target
                            + elem.styles.reset
                        );
                    }


                    elem.seen = true;

                    if (!elem.config.reset && !elem.animating) {
                        elem.animating = true;
                        complete(key);
                    }

                } else if (!visible && elem.config.reset) {

                    elem.domEl.setAttribute('style',
                        elem.styles.inline
                        + elem.styles.initial
                        + elem.styles.reset
                    );

                }

            }
        }

        // Digest complete, now un-block the event handler.
        self.blocked = false;

        // Cleans the DOM and removes completed elements from self.elems.
        // @param {integer} key — self.elems property key.
        function complete(key) {

            var elem = self.elems[key];

            setTimeout(function () {

                elem.domEl.setAttribute('style', elem.styles.inline);
                elem.config.complete(elem.domEl);
                delete self.elems[key];

            }, elem.styles.duration);
        }
    },

    // Parses an elements data-sr attribute, and returns a configuration object.
    // @param {object} elem — An object from self.elems.
    // @return {object}
    configFactory: function (elem) {
        var self = this;
        var parsed = {};
        var config = {};
        var words = elem.domEl.getAttribute('data-sr').split(/[, ]+/);

        words.forEach(function (keyword, i) {
            switch (keyword) {

                case 'enter':

                    parsed.enter = words[i + 1];
                    break;

                case 'wait':

                    parsed.wait = words[i + 1];
                    break;

                case 'move':

                    parsed.move = words[i + 1];
                    break;

                case 'ease':

                    parsed.move = words[i + 1];
                    parsed.ease = 'ease';
                    break;

                case 'ease-in':

                    if (words[i + 1] == 'up' || words[i + 1] == 'down') {

                        parsed.scale.direction = words[i + 1];
                        parsed.scale.power = words[i + 2];
                        parsed.easing = 'ease-in';
                        break;
                    }

                    parsed.move = words[i + 1];
                    parsed.easing = 'ease-in';
                    break;

                case 'ease-in-out':

                    if (words[i + 1] == 'up' || words[i + 1] == 'down') {

                        parsed.scale.direction = words[i + 1];
                        parsed.scale.power = words[i + 2];
                        parsed.easing = 'ease-in-out';
                        break;
                    }

                    parsed.move = words[i + 1];
                    parsed.easing = 'ease-in-out';
                    break;

                case 'ease-out':

                    if (words[i + 1] == 'up' || words[i + 1] == 'down') {

                        parsed.scale.direction = words[i + 1];
                        parsed.scale.power = words[i + 2];
                        parsed.easing = 'ease-out';
                        break;
                    }

                    parsed.move = words[i + 1];
                    parsed.easing = 'ease-out';
                    break;

                case 'hustle':

                    if (words[i + 1] == 'up' || words[i + 1] == 'down') {

                        parsed.scale.direction = words[i + 1];
                        parsed.scale.power = words[i + 2];
                        parsed.easing = 'cubic-bezier( 0.6, 0.2, 0.1, 1 )';
                        break;
                    }

                    parsed.move = words[i + 1];
                    parsed.easing = 'cubic-bezier( 0.6, 0.2, 0.1, 1 )';
                    break;

                case 'over':

                    parsed.over = words[i + 1];
                    break;

                case 'flip':
                case 'pitch':
                    parsed.rotate = parsed.rotate || {};
                    parsed.rotate.x = words[i + 1];
                    break;

                case 'spin':
                case 'yaw':
                    parsed.rotate = parsed.rotate || {};
                    parsed.rotate.y = words[i + 1];
                    break;

                case 'roll':
                    parsed.rotate = parsed.rotate || {};
                    parsed.rotate.z = words[i + 1];
                    break;

                case 'reset':

                    if (words[i - 1] == 'no') {
                        parsed.reset = false;
                    } else {
                        parsed.reset = true;
                    }
                    break;

                case 'scale':

                    parsed.scale = {};

                    if (words[i + 1] == 'up' || words[i + 1] == 'down') {

                        parsed.scale.direction = words[i + 1];
                        parsed.scale.power = words[i + 2];
                        break;
                    }

                    parsed.scale.power = words[i + 1];
                    break;

                case 'vFactor':
                case 'vF':
                    parsed.vFactor = words[i + 1];
                    break;

                case 'opacity':
                    parsed.opacity = words[i + 1];
                    break;

                default:
                    return;
            }
        });

        // Build default config object, then apply any keywords parsed from the
        // data-sr attribute.
        config = _.extend(config, self.config);
        config = _.extend(config, parsed);

        if (config.enter === 'top' || config.enter === 'bottom') {
            config.axis = 'Y';
        } else if (config.enter === 'left' || config.enter === 'right') {
            config.axis = 'X';
        }

        // Let’s make sure our our pixel distances are negative for top and left.
        // e.g. "enter top and move 25px" starts at 'top: -25px' in CSS.
        if (config.enter === 'top' || config.enter === 'left') {
            config.move = '-' + config.move;
        }

        return config;
    },

    // Generates styles based on an elements configuration property.
    // @param {object} elem — An object from self.elems.
    // @return {object}
    styleFactory: function (elem) {
        var self = this;
        var inline;
        var initial;
        var reset;
        var target;
        var transition;

        var cfg = elem.config;
        var duration = ( parseFloat(cfg.over) + parseFloat(cfg.wait) ) * 1000;

        // Want to disable delay on mobile devices? Uncomment the line below.
        // if ( self.isMobile() && self.config.mobile ) cfg.wait = 0;

        if (elem.domEl.getAttribute('style')) {
            inline = elem.domEl.getAttribute('style') + '; visibility: visible; ';
        } else {
            inline = 'visibility: visible; ';
        }

        transition = '-webkit-transition: -webkit-transform ' + cfg.over + ' ' + cfg.easing + ' ' + cfg.wait + ', opacity ' + cfg.over + ' ' + cfg.easing + ' ' + cfg.wait + '; ' +
        'transition: transform ' + cfg.over + ' ' + cfg.easing + ' ' + cfg.wait + ', opacity ' + cfg.over + ' ' + cfg.easing + ' ' + cfg.wait + '; ' +
        '-webkit-perspective: 1000;' +
        '-webkit-backface-visibility: hidden;';

        reset = '-webkit-transition: -webkit-transform ' + cfg.over + ' ' + cfg.easing + ' 0s, opacity ' + cfg.over + ' ' + cfg.easing + ' 0s; ' +
        'transition: transform ' + cfg.over + ' ' + cfg.easing + ' 0s, opacity ' + cfg.over + ' ' + cfg.easing + ' 0s; ' +
        '-webkit-perspective: 1000; ' +
        '-webkit-backface-visibility: hidden; ';

        initial = 'transform:';
        target = 'transform:';
        build();

        // Build again for webkit…
        initial += '-webkit-transform:';
        target += '-webkit-transform:';
        build();

        return {
            transition: transition,
            initial: initial,
            target: target,
            reset: reset,
            inline: inline,
            duration: duration
        };

        // Constructs initial and target styles.
        function build() {

            if (parseInt(cfg.move) !== 0) {
                initial += ' translate' + cfg.axis + '(' + cfg.move + ')';
                target += ' translate' + cfg.axis + '(0)';
            }

            if (parseInt(cfg.scale.power) !== 0) {

                if (cfg.scale.direction === 'up') {
                    cfg.scale.value = 1 - ( parseFloat(cfg.scale.power) * 0.01 );
                } else if (cfg.scale.direction === 'down') {
                    cfg.scale.value = 1 + ( parseFloat(cfg.scale.power) * 0.01 );
                }

                initial += ' scale(' + cfg.scale.value + ')';
                target += ' scale(1)';
            }

            if (cfg.rotate.x) {
                initial += ' rotateX(' + cfg.rotate.x + ')';
                target += ' rotateX(0)';
            }

            if (cfg.rotate.y) {
                initial += ' rotateY(' + cfg.rotate.y + ')';
                target += ' rotateY(0)';
            }

            if (cfg.rotate.z) {
                initial += ' rotateZ(' + cfg.rotate.z + ')';
                target += ' rotateZ(0)';
            }

            initial += '; opacity: ' + cfg.opacity + '; ';
            target += '; opacity: 1; ';
        }
    }


} // End of the scrollReveal prototype ======================================|


module.exports = EasyAnimation;

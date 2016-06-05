var _ = require('underscore');
var EasyAnimation=require("easy-animation");

/**
 * 动画管理
 */

function AnimationManager(config) {
    this.init(config);
}
AnimationManager.prototype.init = function (config) {
    this.config = _.extend({single: true, animations: {}}, config);
    this.animations = this.config.animations;
    this.currentAnimations = [];
};
AnimationManager.prototype.addAnimations=function(ids,config){
    for(var i=0;i<ids.length;i++){
        this.addAnimation(ids[i],new EasyAnimation(ids[i],config));
    }
};



AnimationManager.prototype.addAnimation = function (id, animation) {
    if (this.getAnimationByID(id)) {
        console.log('[' + id + ']  id is used');
        return;
    }
    this.animations[id] = animation;
    if(animation.visible){
        this.currentAnimations.push(animation);
    }



};
AnimationManager.prototype.removeAnimation = function (id) {
    if (this.getAnimationByID(id)) {
        delete  this.animations[id];
    }
};
AnimationManager.prototype.hide = function (mc) {


    mc.hide();
    this.currentAnimations= _.without(this.currentAnimations, mc);
 //   console.log(this.currentAnimations)


};
AnimationManager.prototype.hideAll = function () {


    while (this.currentAnimations.length > 0) {
        this.hide(this.currentAnimations.shift());
    }


};
AnimationManager.prototype.showAll = function () {
    var me=this;
    _.each(this.animations,function(ani){
        me.show(ani);
    });
};

AnimationManager.prototype.showByID = function (id) {

    if (this.getAnimationByID(id)) {
        this.show(this.animations[id]);
    }

};
AnimationManager.prototype.hideByID = function (id) {

    if (this.getAnimationByID(id)) {
        this.hide(this.animations[id]);
    }

};
AnimationManager.prototype.toggleByID=function (id) {

    if (this.getAnimationByID(id)) {
        this.toggle(this.animations[id]);
    }

};

AnimationManager.prototype.getAnimationByID=function(id){
    if (this.animations.hasOwnProperty(id)) {
        return this.animations[id];
    }
    return false;
};

AnimationManager.prototype.toggle=function (mc) {
    if (_.indexOf(this.currentAnimations, mc) == -1) {
        this.show(mc);
    }else{
        this.hide(mc);
    }




};



AnimationManager.prototype.show = function (mc) {

    if (_.indexOf(this.currentAnimations, mc) == -1) {


        if (this.config.single) {
            this.hideAll();
        }

        mc.show();
        this.currentAnimations.push(mc);

     //   console.log(this.currentAnimations)
    }

};


module.exports = AnimationManager;

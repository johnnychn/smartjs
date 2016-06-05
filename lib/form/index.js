var _ = require('underscore');
var $ = window.$;
var Util = require('util');

/**
 * 表单
 *
 *
 *
 常用正则表达式
 提取信息中的网络链接:(h|H)(r|R)(e|E)(f|F) *= *('|")?(\w|\\|\/|\.)+('|"| *|>)?
 提取信息中的邮件地址:\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*
 提取信息中的图片链接:(s|S)(r|R)(c|C) *= *('|")?(\w|\\|\/|\.)+('|"| *|>)?
 提取信息中的IP地址:(\d+)\.(\d+)\.(\d+)\.(\d+)
 提取信息中的中国手机号码:(86)*0*13\d{9}
 提取信息中的中国固定电话号码:(\(\d{3,4}\)|\d{3,4}-|\s)?\d{8}
 提取信息中的中国电话号码（包括移动和固定电话）:(\(\d{3,4}\)|\d{3,4}-|\s)?\d{7,14}
 提取信息中的中国邮政编码:[1-9]{1}(\d+){5}
 提取信息中的中国身份证号码:\d{18}|\d{15}
 提取信息中的整数：\d+
 提取信息中的浮点数（即小数）：(-?\d*)\.?\d+
 提取信息中的任何数字 ：(-?\d*)(\.\d+)?
 提取信息中的中文字符串：[\u4e00-\u9fa5]*
 提取信息中的双字节字符串 (汉字)：[^\x00-\xff]*
 */

function Form(dom) {
    this.dom = $(dom);
}
Form.prototype.email = function (str) {

    var reg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/;
    return reg.test(str);

};
Form.prototype.radioHtml = function (obj, select, temp,name) {
    temp = temp || ' <input type="radio" name="{name}" value="{value}" {checked}/>{label} ';
    name=name||'';
    var html = '';
    _.each(obj, function (v, k) {
        var checked = (k == select ? 'checked' : '');
        if (!_.isObject(v)) {
            v = {name: name, value: k,label:v};
        }
        v.checked = checked;

        html += Util.nano(temp, v);
    });
    return html;
};
Form.prototype.checkboxHtml = function (obj, temp,name) {
    temp = temp || ' <input type="checkbox" name="{name}" value="{value}" {checked}/>{label} ';

    var html = '';
    _.each(obj, function (v, k) {
        v.checked = v.checked == true ? 'checked' : '';
        html += Util.nano(temp, v);
    });
    return html;
};
Form.prototype.comboboxHtmlByObj = function (obj, select) {
    var html = '';
    _.each(obj, function (v, k) {
        var selected = (k == select ? 'selected' : '');
        html += '<option value="' + k + '" ' + selected + '>' + v + '</option>';
    });
    return html;

};
Form.prototype.comboboxHtmlByArray = function (arr, label_key,value_key,value) {
    var html = '';
    _.each(arr, function (v) {
        var selected = (v[value_key]== value ? 'selected' : '');
        html += '<option value="' + v[value_key] + '" ' + selected + '>' + v[label_key] + '</option>';
    });
    return html;

};

Form.prototype.getInput = function (name, init) {
    var checkdom = this.dom;
    var value = '';
    var finded;
    var maxloop = 100;
    var loop = 0;
    while (!finded) {

        var valuedom = checkdom.find("[name='" + name + "']");
        if (valuedom.size() > 0) {

            if (valuedom.size() > 1) {
                value = checkdom.find("[name='" + name + "']" + ':checked').val();
                if (init != undefined) {

                    checkdom.find("[name='" + name + "'][value='" + init + "']").click();
                }
            } else if (valuedom.attr('type') == 'checkbox') {
                value = valuedom.is(':checked');
                if (init != undefined) {
                    valuedom.removeAttr('checked');
                    if (init == true) {
                        valuedom.click();
                    }
                }
            } else {


                value = valuedom.val();
                if (init != undefined) {
                    valuedom.val(init)
                }
            }

            finded = true;
            break;
        } else {
            loop++;
            if (loop > maxloop) {
                break;
            }
            checkdom = checkdom.parent();

        }


    }

    return value
};
Form.prototype.clearInputs = function () {
    var self = this;

    this.dom.find('input').each(function () {
        var node = $(this);
        var index = node.attr('name');
        var element = '';
        self.getInput(index, element);
    });
    return true;
};
Form.prototype.initInputs = function (name, inits) {
    var self = this;
    var obj;
    if (inits) {
        obj = _.object(name, inits);
    } else {
        obj = name;
    }
    var values = {};
    _.each(obj, function (element, index, list) {
        values[index] = self.getInput(index, element);
    });
    return values;
};
Form.prototype.getInputs = function (name) {
    var self = this;

    if (Util.isString(name)) {
        name = [name];
    }

    var values = {};
    for (var i = 0; i < name.length; i++) {
        values[name[i]] = self.getInput(name[i]);


    }

    return values;


};


module.exports = Form;

/**
 * Created by Jim Ankrom on 7/18/2015.
 */

var cosinedesign = cosinedesign || {};
cosinedesign.plugins = cosinedesign.plugins || {};
cosinedesign.plugins.control = cosinedesign.plugins.control || {};

cosinedesign.plugins.control.actions = {
    setColor: function (el, options) {
        if (options)
            el.style.backgroundColor = options.color;
    },
    morphColor: function (el, options) {
        if (options)
            el.style.background = 'linear-gradient(90deg, ' + options.color + ',' + options.endColor + ')';
    }
};
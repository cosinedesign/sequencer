/**
 * Created by Jim Ankrom on 7/17/2015.
 */
var cosinedesign = cosinedesign || {};

cosinedesign.mvc = (function (utils) {
    return {
        view: function (options) {
            options = options || {};

            var v = {
                el: null,
                model: null,
                render: function () {
                    return this;
                }
            };

            utils.merge(options, v);

            utils.decorators.events(options);

            return options;
        }
    };
})(
    // Dependencies
    cosinedesign.utility
);
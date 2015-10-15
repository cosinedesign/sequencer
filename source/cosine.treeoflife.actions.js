/**
 * Created by cosinezero on 8/26/2015.
 */

// an action has:
// config
// render()
var currentStepDuration = 500;
var cosine = cosine || {};
cosine.treeOfLife = cosine.treeOfLife || {};

cosine.treeOfLife.renderers = (function (svg) {

    return {
        fill: function (defs, shape, options) {
            shape.style.fill = options.color;
        },
        text: function (defs, shape, options) {
            svg.create.text(shape, options.text);
        },
        gradient: function (defs, shape, options) {

            // create a gradient id...
            var id = 'linear' + options.color1.replace('#', '') + options.color2.replace('#', '');

            // TODO: allow options to set a 'left to right' / right to left / top to bottom etc.
            this.gradient = svg.create.gradients.linear(defs, id, [options.color1, options.color2], {
                x1:"0%",x2:"100%",  y1:"0%", y2:"0%"
            });

            shape.style.fill = 'url(#' + id + ')';
        },
        pattern: function (defs, shape, options) {
            // TODO: create pattern
            shape.style.fill = 'url(#' + this.patternId + ')';
        }
    };
})(
    cosinedesign.svg
);

// Client-side rendering tools
cosine.treeOfLife.toolkit = (function (svg) {
    var svgView;
    function getSvg() {
        if (svgView) return svgView;
        svgView = document.body.appendChild(svg.create.svg({ width: '100%', height: '100%' }));
        return svgView;
    }

    function hideGroup (g) {
        if (g) svg.setAttribues({ opacity: 0 })
    }
    var useElements = {},
        activeGroup;
    function showGroup(id, actionId) {
        hideGroup(activeGroup);
        var use = useElements[actionId];
        if (!use) {
            useElements[actionId] = svg.create.use(getSvg(), { id: id }, {}, {}, {});
        }
        activeGroup = use;
        svg.setAttributes(use, { opacity: 1 });
    }

    function tween(fromTarget, toSource, interval, callback) {
        createjs.Tween.get(fromTarget).to(toSource, interval).addEventListener('change', callback);
    }

    return {
        svgView: getSvg,
        showGroup: showGroup,
        tween: tween
    };
})(
    cosinedesign.svg
);


// These are the action definitions... not the action data
cosine.treeOfLife.actions = (function (renderers, color, svg) {
    // TODO: We will need to delineate between an action definition and the action itself
    // TODO: or maybe we have a create method that creates the action config object? or updates it?
    // TODO: define action schema
    function actionDef (options) {
        options = options || {};

        return {
            name: options.name || "New Action",
            type: options.type || 'setColor',
            options: options.options || {},
            render: options.render || renderers.fill,
            schema: options.schema || {},
            action: options.action || function () {}
        }
    }

    // Action Definitions
    return {
        // setColor
        setColor: actionDef({
            name: 'Set Color',
            type: 'setColor',
            schema: {
                color: {
                    type: "color",
                    options: {label: "Color"},
                    default: '#ff00ff'
                }
            },
            action: function (options) {
                if (options.color) {
                    document.body.style.background = options.color;
                }
            }
        }),
        // morphColor
        morphColor: actionDef({
            name: 'Morph Color',
            type: 'morphColor',
            render: renderers.gradient,
            schema: {
                color1: {
                    type: "color",
                    options: {label: "Color 1"},
                    default: "#FF0000"
                },
                color2: {
                    type: "color",
                    options: {label: "Color 2"},
                    default: "#FF00FF"
                }
            },
            action: function (options) {
                document.body.style.background = options.color1;
                var c1 = color.HEXtoRGB(options.color1),
                    c2 = color.HEXtoRGB(options.color2);
                cosine.treeOfLife.toolkit.tween(c1, c2, currentStepDuration, function () {
                    document.body.style.background = color.RGBtoHEX(c1);
                });
            }
        }),
        strobe: actionDef({
            name: 'strobe',
            type: 'strobe',
            schema: {
                color: {
                    type: "color",
                    options: { label: "Color" },
                    default: '#ffffff'
                }
            },
            action: function (options) {
                options = options || {};
                options.duration = options.duration || 50;
                options.baseColor = options.baseColor || '#000000';
                if (options.color) {
                    document.body.style.background = options.color;
                }

                setTimeout(function () {
                    document.body.style.background = options.baseColor;
                }, options.duration);
            }
        }),
        DANCE: actionDef({
            name: 'DANCE',
            type: 'DANCE',
            schema: {},
            render: function (defs, shape, options) {
                shape.style.fill = '#000000';
                svg.create.text(shape.parentNode, "DANCE", { x: shape.x.baseVal.value + 10 , y: shape.y.baseVal.value + 10, width: 40, height: 15, fill: '#ffffff' });
            },
            action: function () {
                cosine.treeOfLife.toolkit.showGroup('DANCE', "DANCE-CAMP");
                // TODO: set interval to hide this after nnn time
            }
        }),
        CAMP: actionDef({
            name: 'CAMP',
            type: 'CAMP',
            schema: {},
            render: function (defs, shape, options) {
                shape.style.fill = '#ffffff';
                svg.create.text(shape.parentNode, "CAMP", { x: shape.x.baseVal.value + 10 , y: shape.y.baseVal.value + 10, width: 40, height: 15, fill: '#000000' });
            },
            action: function () {
                cosine.treeOfLife.toolkit.showGroup('CAMP', "CAMP-DANCE");
                // TODO: set interval to hide this after nnn time
            }
        })
        //,photo: actionDef({
        //    name: 'Photo',
        //    type: 'photo',
        //    schema: {},
        //    render: function (defs, shape, options) {
        //        shape.style.fill = '#ffffff';
        //        svg.create.text(shape.parentNode, "CAMP", { x: shape.x.baseVal.value + 10 , y: shape.y.baseVal.value + 10, width: 40, height: 15, fill: '#000000' });
        //    },
        //    action: function () {
        //        cosine.treeOfLife.toolkit.showGroup('CAMP', "CAMP-DANCE");
        //        // TODO: set interval to hide this after nnn time
        //    }
        //})
        //,video: actionDef({
        //name: 'Photo',
        //type: 'photo',
        //schema: {},
        //render: function (defs, shape, options) {
        //    shape.style.fill = '#ffffff';
        //    svg.create.text(shape.parentNode, "CAMP", { x: shape.x.baseVal.value + 10 , y: shape.y.baseVal.value + 10, width: 40, height: 15, fill: '#000000' });
        //},
        //action: function () {
        //    cosine.treeOfLife.toolkit.showGroup('CAMP', "CAMP-DANCE");
        //    // TODO: set interval to hide this after nnn time
        //}
        //})
    };

    // strobe/Flash
    // mixedStrobe
    // tesselate
    // fire / water / smoke
})(
    cosine.treeOfLife.renderers,
    cosinedesign.graphics.color,
    cosinedesign.svg
);


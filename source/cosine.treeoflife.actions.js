/**
 * Created by cosinezero on 8/26/2015.
 */

// an action has:
// config
// render()

var cosine = cosine || {};
cosine.treeOfLife = cosine.treeOfLife || {};

cosine.treeOfLife.renderers = (function (svg) {

    return {
        fill: function (defs, shape, options) {
            shape.style.fill = options.color;
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

// These are the action definitions... not the action data
cosine.treeOfLife.actions = (function (renderers) {
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
            schema: options.schema || {}
        }
    }

    // Action Definitions
    return {
        // setColor
        setColor: actionDef({
            name: 'Set Color',
            type: 'setColor',
            schema: {
                color1: {
                    type: "color",
                    options: {label: "Color"},
                    default: '#ff00ff'
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
            }
        }),
        strobe: actionDef({
            name: 'strobe',
            type: 'strobe',
            render: function (defs, shape) {
                shape.style.fill = "#FFFFFF";
            }})
    };

    // strobe/Flash
    // mixedStrobe
    // tesselate
    // fire / water / smoke
})(
    cosine.treeOfLife.renderers
);


/**
 * Created by cosinezero on 9/30/2015.
 */
// Editor to edit values of an object.
// Requires schema for all values you want to edit.

var cosinedesign = cosinedesign || {};
cosinedesign.editor = (function (utils, svg, graphics, config){
    var ui = utils.ui,
        color = graphics.color;

    var activePicker;

    function createContainer() {
        var c = document.createElement('div');
        c.style.position = "absolute";
        c.style.display = "none";
        c.style.zIndex = 100000;
        document.body.appendChild(c);
        return c;
    }

    // TODO: make this a lazy-loaded property or something
    var rangePicker = (function (container) {
        if (!container) {
            container = createContainer();
        }

        var exports = {
            container: container,
            value: 0,
            show: function (options, position, value, callback) {
                if (activePicker.hide) activePicker.hide();
                activePicker = exports;
                exports.callback = callback;
                container.style.left = position.left + "px";
                container.style.top = position.top + "px";
                container.style.display = "block";

                setOptions(options, value);

                // delete handlers
                exports.allOff();
                exports.on('valueChanged', callback);
            },
            hide: function () {
                exports.callback = null;
                container.style.display = "none";
            }
        };

        utils.decorators.events(exports);

        function setValue (value) {
            pick.slider.value = value;
        }

        function setOptions(options, value) {
            utils.ui.setAttributes(pick.slider, options);
            pick.min.innerText = options.min;
            pick.max.innerText = options.max;
            setValue(value);
        }

        var pick = {
            value: 0,
            slider: utils.ui.create.range(),
            min: document.createElement('span'),
            max: document.createElement('span')
        };

        container.appendChild(pick.min);
        container.appendChild(pick.slider);
        container.appendChild(pick.max);

        utils.ui.bind(pick.slider, 'input', function () {
            exports.trigger('valueChanged', pick.slider.value);
        });


        return exports;
    })();

    // TODO: make this a lazy-loaded property or something
    var colorPicker = (function (container) {
        if (!container) {
            container = createContainer();
        }

        var exports = {
            container: container,
            value: "#00FF00",
            show: function (options, position, value, callback) {
                if (activePicker && activePicker.hide) activePicker.hide();
                activePicker = exports;
                exports.callback = callback;
                container.style.left = position.left + "px";
                container.style.top = position.top + "px";
                container.style.display = "block";
                //setColor(value);
                displayHueFromHex(value);
                pick.color = color.RGBtoHSV(color.HEXtoRGB(value));

                // delete colorchanged handlers
                exports.allOff();

                exports.on('colorChanged', callback);
            },
            hide: function () {
                exports.callback = null;
                container.style.display = "none";
            }
        };

        utils.decorators.events(exports);

        var pick = {
            color: {},
            svg: document.createElementNS(svg.ns, 'svg'),
            defs: document.createElementNS(svg.ns, 'defs'),
            whiteField: svg.create.shape({
                width: 100,
                height: 100,
                fill: 'white'
            }),
            valField: svg.create.shape({
                width: 100,
                height: 100
            }),
            satField: svg.create.shape({
                width: 100,
                height: 100
            }),
            hueField: svg.create.shape({
                width: 30,
                height: 100,
                x: 104
            }),
            group: document.createElementNS(svg.ns, 'g'),
            setSatVal: function (e) {
                e.preventDefault();
                //var p = pick.svg;
                var w = pick.satField.width.animVal.value;
                var rect = pick.svg.getClientRects()[0];
                var s = (e.clientX - rect.left + document.body.scrollLeft) / w;
                var v = 1 - (e.clientY - rect.top + document.body.scrollTop) / w;

                pick.color.v = utils.constrain(v);
                pick.color.s = utils.constrain(s);

                // display the final color
                // TODO: create a "color" datatype that can convert.
                pick.color = color.HSVtoRGB(pick.color);
                var hex = pick.color.hex = color.RGBtoHEX(pick.color);
                setColor(hex);
                exports.trigger('colorChanged', hex);
                return false;
            },
            setHue: function (e) {
                e.preventDefault();
                var rect = pick.svg.getClientRects()[0];
                var h = 1 - (e.clientY - rect.top + document.body.scrollTop) / pick.hueField.height.animVal.value;

                pick.color.h = utils.constrain(h) * 360;
                pick.color.s = 1;
                pick.color.v = .5;

                var col = pick.color = color.HSVtoRGB(pick.color);
                var hex = pick.color.hex = color.RGBtoHEX(col);
                displayHue(hex);
                exports.trigger('colorChanged', hex);
                return false;
            }
        }; // render picker here

        pick.offset = utils.ui.offset(pick.svg);

        pick.hueField.left = pick.valField.left + pick.valField.width.animVal.value;

        svg.create.gradients.rainbow(pick.defs, "hue1");

        // TODO: refactor these to a generic 'create' method
        var sat = svg.create.gradients.linear(pick.defs, "sat1", ["#FFFFFF", "#000000"], {
            x1:"0%", x2:"0%", y1:"0%", y2:"100%"
        }),
        hsvColor = svg.create.gradients.linear(pick.defs, "val1", ["#FFFFFF", exports.value], {
            x1:"0%",x2:"100%",  y1:"0%", y2:"0%"
        });

        sat.stops[0].setAttribute('stop-opacity', "0");
        hsvColor.stops[0].setAttribute('stop-opacity', "0");

        pick.hueField.setAttribute("fill","url(#hue1)");
        pick.satField.setAttribute("fill","url(#sat1)");
        pick.valField.setAttribute("fill","url(#val1)");

        pick.svg.appendChild(pick.defs);
        pick.svg.appendChild(pick.group);
        pick.group.appendChild(pick.whiteField);
        pick.group.appendChild(pick.valField);
        pick.group.appendChild(pick.satField);
        pick.group.appendChild(pick.hueField);

        container.appendChild(pick.svg);

        function setColor(rgbHex) {
            exports.value = rgbHex;
        }

        function displayHue(rgbHex) {
            hsvColor.stops[1].setAttribute('stop-color', rgbHex);
        }

        function displayHueFromHex(rgbHex) {
            var hsv = color.RGBtoHSV(color.HEXtoRGB(rgbHex));
            hsv.s = 1;
            hsv.v = .5;
            var rgb = color.HSVtoRGB(hsv);
            displayHue(color.RGBtoHEX(rgb));
        }

        function unbindSatVal () {
            ui.unbind(pick.satField, 'mousemove', pick.setSatVal);
            ui.unbind(pick.satField, 'mouseup', unbindSatVal);
            // document.body.style.cursor = 'default';
        }

        function unbindHue() {
            ui.unbind(pick.hueField, 'mousemove', pick.setHue);
            ui.unbind(pick.hueField, 'mouseup', unbindHue);
        }

        // TODO - assign click handlers
        ui.bind(pick.satField, 'mousedown', function (e) {
            pick.setSatVal(e);
            // document.body.style.cursor = 'none';
            ui.bind(pick.satField, 'mousemove', pick.setSatVal);
            ui.bind(pick.satField, 'mouseup', unbindSatVal);
        });
        ui.bind(pick.hueField, 'mousedown', function (e) {
            pick.setHue(e);
            ui.bind(pick.hueField, 'mousemove', pick.setHue);
            ui.bind(pick.hueField, 'mouseup', unbindHue);
        });


        //      - click should call callback assigned via show
        //      - click should update model
        // one has to set the color value on step 0 for val gradient

        return exports;
    })();

    function getPopupOffset(activator, popup, viewport) {
        // TODO: This needs to verify if we'll go outside the viewport
        var offset = {
            left: 4,
            top: 0
        };

        return {
            left: activator.left + activator.width + offset.left,
            top: activator.top + offset.top
        };
    }

    function createLabel(config, options) {
        return utils.ui.create.label({
            display: options.display || "inline-block",
            width: config.labelWidth,
            text: options.label
        });
    }

    var editor = {
        // EXAMPLE SCHEMA
        // schema = {
        //      property1: {
        //          type: "color"
        //      },
        //      property2: {
        //          type: "range",
        //          options: {
        //              upper: 1, lower: 0
        //          }
        //      }
        // }
        edit: function (schema, target, container) {

            // TODO: create a table in container

            var self = this,
                model = {},
                elements = {},
                pickers = {};

            utils.each(schema, function (item, index, key) {
                var value = target[key];
                // create an observable to bind data back to target
                utils.decorators.observableProperty(key, value, model);

                // create a container div for the picker
                var elPick = container.appendChild(document.createElement('div'));
                elements[key] = elPick;

                // TODO: assign the key+"Changed" event to set target[key] value
                model.on(key+'Changed', function (newValue) {
                    target[key] = newValue;
                });

                var picker = self.pickers[item.type];
                pickers[key] = picker(key, value, model, elPick, item.options);
            });

            //elements.actionBar = document.createElement('div');
            //elements.closeButton = document.createElement('input');
            //container.appendChild(elements.actionBar);
            //elements.actionBar.appendChild(elements.closeButton);

            //utils.ui.addClick(elements.closeButton, function () {

            //});

            return {
                show: function () {
                    return this;
                },
                hide: function () {
                    if (activePicker) activePicker.hide();
                    this.clear();
                    return this;
                },
                clear: function () {
                    if (activePicker) activePicker.hide();
                    if (model && model.allOff) model.allOff(); // this may not exist if model is practically empty
                    pickers = null;
                    elements = null;
                    model = null;
                    utils.ui.deleteChildren(container);
                }
            };
        },
        pickers: {
            "string": function (key, value, model, container, options) {
                // render a textbox
            },
            "color": function (key, value, model, container, options) {
                var p = {
                    label: createLabel(config, options),
                    activator: document.createElementNS(svg.ns, 'svg')
                };

                // set general size of svg via config
                p.colorSVG = svg.create.shape({
                    width: config.activatorWidth = config.activatorWidth || 50,
                    height: config.activatorHeight = config.activatorHeight || 20,
                    fill: value
                });

                // TODO: assign the key+"Changed" event to set target[key] value
                model.on(key + 'Changed', function (newValue) {
                    p.colorSVG.style.fill = newValue;
                });

                // render the color picker's activator
                p.activator.appendChild(p.colorSVG);
                p.activator.setAttribute('width', config.activatorWidth);
                p.activator.setAttribute('height', config.activatorHeight);

                p.label.width = config.labelWidth + "px";

                container.appendChild(p.label);
                container.appendChild(p.activator);

                var activated = false;
                // assign click handler to launch the color picker control
                utils.ui.addClick(p.activator, function (e) {
                    if (!activated) {
                        var position = getPopupOffset(p.activator.getBoundingClientRect(), colorPicker.container);
                        colorPicker.show(options, position, model[key], function (color) {
                            model[key] = color;
                        });
                        activated = true;
                    } else {
                        colorPicker.hide();
                        activated = false;
                    }

                });

                // listen to colorPicker
                return p;
            },
            "number": function (key, value, model,container, options) {

            },
            "range": function (key, value, model, container, options) {
                var p = {
                    label: createLabel(config, options),
                    activator: document.createElement('div')
                };

                p.activator.style.width = config.activatorWidth + 'px';
                p.activator.style.height = config.activatorHeight + 'px';
                p.activator.style.display = 'inline-block';
                container.appendChild(p.label);
                container.appendChild(p.activator);

                p.activator.innerText = value;

                var activated = false;
                utils.ui.addClick(p.activator, function (e) {
                    if (!activated) {
                    var position = getPopupOffset(p.activator.getBoundingClientRect(), rangePicker.container);

                    rangePicker.show(options, position, value, function (result) {
                        model[key] = result;
                    });
                        activated = true;
                    } else {
                        activated = false;
                        rangePicker.hide();
                    }
                });

                // TODO: assign the key+"Changed" event to set target[key] value
                model.on(key + 'Changed', function (newValue) {
                    p.activator.innerText = newValue;
                });

                return p;
            },
            "select": function (key, value, model, container, options) {
            }
        }
    };

    return editor;
})(
    cosinedesign.utility,
    cosinedesign.svg,
    cosinedesign.graphics,
    {
        labelWidth: 75
    }
);



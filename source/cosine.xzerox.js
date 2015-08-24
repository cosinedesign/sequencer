/**
 * Created by cosinezero on 8/23/2015.
 */

var cosine = cosine || {};

cosine.xzerox = (function (utils, mvc, svg, config) {
    var buttonSize = config.grid.size + (config.grid.border * 2);

    // TODO: maybe move to utils
    function position (pos) {
        this.x = pos.x;
        this.y = pos.y;
    }

    // x0x namespace to hold all the various views and utilities
    var x0x = {
        config: config,
        patternBank: {
            get: function (name) {
                return this.store.get(name);
            },
            set: function (name, value) {
                this.store.set(name, value);
            },
            store: utils.cache.storage('patternBank')
        },
        buildPattern: function (options) {
            options = options ||
                {
                    sequence: {
                        steps: [4, 8, 12, 16],
                    }
                };

            return {
                bars: [{
                    sequences: [
                        x0x.buildSequence(options.sequence),
                        x0x.buildSequence(options.sequence),
                        x0x.buildSequence(options.sequence)
                    ]
                }]
            };
        },
        buildSequence: function (options) {
            return [
                {step: 2},
                {step: 4},
                {step: 8},
                {step: 12}
            ];
        },
        buildSequenceView: function (barView, sequence) {
            var offsetX;
            var result = mvc.view({
                position: position,
                sequence: sequence,
                svg: barView.svg,
                // step views
                views: [],
//                        x: offsetX,
                y: barView.y,
                clear: function () {
                    // iterate through the views, and remove each svg, then delete the view
                    utils.each(this.views, function (v) {
                        result.svg.removeChild(v.svgShape);
                    });

                    result.svg.removeChild(this.select.button);
                    this.views = [];
                },
                // TODO: in init, set the size, not x/y.
                init: function () {
                    var len = sequence.length,
                        self = this,
                        next;

                    sequence.sort(function (a, b) {
                        return utils.compare(a.step, b.step);
                    });

                    // initialize each of the steps, including a spacer if needed
                    utils.each(sequence, function (a, i) {
                        var aV;
                        // if this is the last step
                        if (i == len - 1) {
                            next = config.pattern.steps;
                        } else {
                            next = sequence[i + 1].step;
                        }

                        a.length = next - a.step;

                        // if it's the first step, insert a spacer if we're not at 0
                        if (i == 0 && a.step != 0) {
                            aV = {
                                action: null,
                                length: a.step, // -1 ?
                                height: config.grid.size,
                                width: x0x.getActionWidth(a.step, config.grid.size, config.grid.border),
                                fill: '#666666',
                                stroke: 'grey'
                            };

                            result.views.push(aV);
                            self.trigger('actionViewCreated', a, aV);
                        }

                        // push the actual action view
                        aV = {
                            action: a,
                            length: a.length,
                            height: config.grid.size,
                            width: x0x.getActionWidth(a.length, config.grid.size, config.grid.border),
                            fill: 'url(#pinkMorph)',
                            stroke: 'grey'
                        };

                        result.views.push(aV);

                    });
                },
                // in render, set x/y of the shapes
                render: function () {
                    var s,
                        self = this;

                    // create select button
                    offsetX = this.x = this.x || 0;

                    this.select.y = this.y + config.grid.border;
                    // create the select sequence button shape
                    s = this.select.button = svg.create.shape(this.select);
                    this.svg.appendChild(s);

                    offsetX += buttonSize;

                    // render each step
                    utils.each(this.views, function (v) {
                        offsetX += config.grid.border; //self.x

                        v.x = offsetX; // self.x;
                        v.y = result.y + config.grid.border;
                        v.svgShape = svg.create.shape(v);
                        result.svg.appendChild(v.svgShape);

                        // assign click handlers to the shape
                        self.trigger('actionViewCreated', v.action, v.svgShape);
                        // TODO: assign destroy handlers to the action
                        // (when we destroy the action, should remove the shape from the svg)

                        // add right side border to offset
                        offsetX += v.width + config.grid.border; // self.x
                    });

                    this.trigger('render', this);
//                                    // TODO: implement below:
//                                    utils.each(sequence, function (a, i) {
//                                        var shape, s, stepWidth;
//                                        // TODO: get the action length
//                                        // if we're the last action
//                                        if (i == len-1) {
//                                            next = config.pattern.steps;
//                                        } else {
//                                            next = sequence[i+1].step;
//                                        }
//                                        // determine its step length
//                                        a.length = next - a.step;
//
//
//                                        // TODO: determine it's width
//
//                                        // if it's the first step, insert a spacer if we're not at 0
//                                        if (i == 0 && a.step != 0) {
//                                            stepWidth = getActionWidth(a.step, config.grid.size, config.grid.border);
//                                            //offsetX += config.grid.border;
//                                            s = svg.create.shape({
//                                                height: config.grid.size,
//                                                // TODO: refactor this into a function
//                                                // 30 is 16x2 - 2, to fix for the outer borders of this item
//                                                // OR 16= step length, 30 = (steplength * 2) - 2
//                                                //width: (config.grid.size * a.step) + (config.grid.border * ((a.step * 2)-2)),
//                                                width: stepWidth,
//                                                x: offsetX,
//                                                y: that.y + config.grid.border,
//                                                fill: '#666666',
//                                                stroke: 'grey'
//                                            });
//                                            that.svg.appendChild(s);
//                                        }
//
//                                        offsetX += config.grid.border;
//                                        stepWidth = getActionWidth(a.length, config.grid.size, config.grid.border);
//                                        // create the SVG block for the action
//                                        s = svg.create.shape({
//                                            height: config.grid.size,
//                                            // 30 is 16x2 - 2, to fix for the outer borders of this item
//                                            // OR 16= step length, 30 = (steplength * 2) - 2
//                                            width: stepWidth,
//                                            //width: (config.grid.size * 16) + (config.grid.border * 30),
//                                            x: offsetX,
//                                            y: that.y + config.grid.border,
//                                            fill: '#00FF00',
//                                            stroke: 'grey'
//                                        });
//
//                                        // add right side border to offset
//                                        offsetX += stepWidth + config.grid.border;
//
//                                        // TODO: assign handlers to the action
//
//                                        // and append it to the svg
//                                        that.svg.appendChild(s);
//                                    });
                }
            });
            utils.decorators.events(result);
            return result;
        },
        // 30 is 16x2 - 2, to fix for the outer borders of this item
        // OR 16= step length, 30 = (steplength * 2) - 2
        //width: (config.grid.size * a.step) + (config.grid.border * ((a.step * 2)-2)),
        getActionWidth: function (size, grid, border) {
            return (grid * size) + (border * ((size * 2) - 2));
        },
        views: {
            buttonBar: mvc.view({
                buttons: [],
                position: position,
                // set by controller
                activeSequence: null,
                addSequenceClick: null,
                colors: [],
                init: function () {
                    var colorOn,
                        colorOff,
                        initialX;

                    this.initialized = true;
                    this.addSequence = svg.create.shape({
                        height: config.grid.size,
                        width: config.grid.size,
                        x: this.x + config.grid.border,
                        y: this.y + config.grid.border,
                        fill: config.xox.new.fill,
                        stroke: 'grey'
                    });
                    this.svg.appendChild(this.addSequence);

                    // add click for addSequence
                    utils.ui.addClick(this.addSequence, this.addSequenceClick);

                    // adjust for remaining border from above
                    this.y += config.grid.border;
                    this.x += config.grid.border;

                    // offset for button
                    this.x += buttonSize;
                    initialX = this.x;

                    for (i = 0; i < 16; i++) {
                        // Change to the next color if it matches the index
                        colorOn = config.buttons.on.colors[i] || colorOn;
                        colorOff = config.buttons.off.colors[i] || colorOff;
                        this.colors.push({ on: colorOn, off: colorOff });

                        // calculate location
                        if (i) {
                            this.x = initialX + (buttonSize * i); // just add one side of the border
                        }

                        var s = svg.create.shape({
                            width: config.grid.size,
                            height: config.grid.size,
                            index: i,
                            x: this.x,
                            y: this.y,
                            fill: colorOff,
                            stroke: 'grey',
                            "stroke-width": 1
                        });

                        this.buttons.push(s);

                        this.trigger('buttonCreated', s, i);

                        this.svg.appendChild(s);
                    }
                },
                render: function () {
                    if (!this.initialized) this.init();
                    // create an svg square using config
                    // turn on each button that lines up to a sequence
                    this.update();
                },
                move: function (position) {
                    //TODO: Move each button to start at the provided position
                    this.addSequence.style.y = position.y;

                    utils.each(this.buttons, function (s) {
                        s.style.y = position.y;
                    });
                },
                update: function () {
                    var self = this;
                    utils.each(this.buttons, function (b, i) {
                        self.buttonOff(b, i);
                    });
                    utils.each(this.activeSequence, function (a) {
                        self.buttonOn(self.buttons[a.step], a.step)
                    });
                },
                buttonOn: function (s, i) {
                    s.style.fill = this.colors[i].on;
                },
                buttonOff: function (s, i) {
                    s.style.fill = this.colors[i].off;
                }
            }),
            bar: mvc.view({
//                        bar: pattern.bars[0],
                sequenceViews: [],
                views: [],
                // create sequence views
                init: function () {
                    // each sequence in bar
                    utils.each(this.bar.sequences, this.addSequenceView);
                },
                addSequenceView: function (sequence, index) {
                    var self = x0x.views.bar;
                    // current starting offset, should set this to the width of the above button
                    var offsetX = self.x + config.grid.border;
                    var select = {
                        height: config.grid.size,
                        width: config.grid.size,
                        x: offsetX,
                        y: self.y + config.grid.border,
                        fill: config.sequence.button.fill,
                        stroke: 'grey'
                    };

                    // Move the offset to the correct location
                    offsetX += config.grid.size + config.grid.border;

                    // Assign it the current offset
                    var seqView = x0x.buildSequenceView(self, sequence);
                    self.trigger('sequenceViewCreated', seqView);
                    seqView.sequenceIndex = index;
                    // remember step views, to remove them from the svg when destroyed
                    self.sequenceViews.push(seqView);
                    //seqView.x = offsetX;
                    seqView.select = select;
                    seqView.init();

                    return seqView;
                },
                position: position,
                renderView: function (view) {
                    var b = x0x.views.bar;
                    // set x and y for each sequence view
                    view.position(b);
                    view.render();
                    this.y += buttonSize;
                    //this.trigger('sequenceViewRendered', view);
                },
                render: function () {
                    // render sequences top to bottom
                    utils.each(this.sequenceViews, this.renderView.bind(this));
                }
            })
        }
    };

    return x0x;
})(
    cosinedesign.utility,
    cosinedesign.mvc,
    cosinedesign.svg,
    cosine.xzerox.config
);


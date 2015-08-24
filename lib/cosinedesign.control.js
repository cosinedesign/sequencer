/**
 * Created by Jim Ankrom on 6/25/2015.
 *
 * Glossary:
 *  -   Pattern - Group of bars
 *  -   Bar - multichannel sequence
 *  -   Sequence - single channel of 16 steps
 *
 *
 */



// TODO: TOP - when the sequencer re-renders the actions it doesn't render them with the action renderers.

// TODO: refactor out presetPicker
// TODO: pattern save
// TODO: add / copy bar (pop up a choice to add blank or
// TODO: add 'nudge' and 'drag', to shorten/lengthen tempo slightly
// TODO: add 'phase' to modify tempo offset
// TODO: add midi API access to local devices...
// TODO: select action, assign to event
// TODO: make xox buttons cycle with selected tempo
// TODO: create more standalone controller with:
// TODO: pattern selector (ableton-style)
// TODO: create standalone tempo controller
    // TODO: nudge tempo
// TODO: light integration

var cosinedesign = cosinedesign || {};

cosinedesign.control = (function (utils, mvc, svg, config, plugins) {

    var actionStyles = plugins.actions;

    var sequencer = utils.decorators.events({
            config: config,
            render: function () {
                utils.each(sequencer.views, function (item, index) {

                });
            }
        }),
        state = {
            // Bank of patterns
            patternBank: {
                get: function (name) {
                    return this.store[name];
                },
                store: utils.cache.storage('patternBank')
            }
        },
        viewPort;

    function buttonClick (button, stepId) {
        // Toggle step
        var actionIndex = -1,
            seq = state.currentPattern.sequences[activeSequence],
            eventResult;

        var action = find(seq, function (a, i) {
            actionIndex = i;
            return a.step == stepId;
        });

        if (action) {
            // Remove step
            seq.splice(actionIndex, 1);
            button.classList.remove('on');
            eventResult = 'stepRemoved';
        } else {
            // Add step
            action = { step: stepId };
            seq.push(action);
            button.classList.add('on');
            eventResult = 'stepAdded';
            // TODO: trigger 'action added' event
        }

        sequencer.trigger(eventResult, { action: action });
        sequencer.render();
    }

    utils.ui.onLoad(function () {
        state.currentPattern = state.patternBank.get('default');
        sequencer.init();
    });

    sequencer.init = function (options) {
        // create all the containers, init all the views
        viewPort = svg.create.svg({
            width: 600,
            height: 600
        });

        options.el.appendChild(viewPort);



        var barSelector = mvc.view({
                el: viewPort,
                render: function () {}
            }),
            buttonBar = mvc.view({
                el: viewPort,
                buttons: [],
                svg: viewPort,
                init: function () {
                    var i, x = 0,
                        buttonSize = config.grid.size + (config.grid.border * 2),
                        offset;
                    this.initialized = true;
                    this.svg.shapes = [];

                    for (i=0; i < 16; i++) {

                        // calculate location
                        if (i) {
                            offset = (buttonSize * i);
                            x = offset + config.grid.border; // just add one side of the border
                        }

                        this.svg.shapes.push({
                            width: config.grid.size,
                            height: config.grid.size,
                            x: x,
                            y: buttonSize,
                            fill: 'green'
                        });
                    }

                    this.svg.onShapeCreated = function (item, index) {
                        utils.ui.addClick(item, function () {
                            buttonClick(item, index);
                        });
                    };
                },
                render: function () {
                    if (!this.initialized) this.init();
                    // create an svg square using config
                    svg.create.svg(this.svg);
                }
            }),
            pattern = mvc.view({
                el: viewPort,
                model: state.currentPattern,
                init: function () {},
                render: function () {}
        });

        // pattern selector
        // bar selector
        // sequences
        // buttonBar
        // Arranged in render order
        sequencer.views = {
            barSelector: barSelector,
            pattern: pattern,
            buttonBar: buttonBar
        };
    };

    return sequencer;
})(
    cosinedesign.utility,
    cosinedesign.mvc,
    cosinedesign.svg,
    // Configuration
    {
        debug: true,
        grid: {
            size: 20,
            border: 2
        }
    },
    cosinedesign.plugins.control
);





// TODO: remove these when done
//
//var utils = cosinedesign.utility;
//
//
//
//// - xox-style sequencer
//// - ableton pattern sequencer (grid of patterns
////     you can turn on / off)
//
//// pattern is n channels of sequences
//
//// Sequencer
//// TODO: wire up events by passing them in to IIFE
//// TODO: create pattern grid like ableton
//// TODO: make buttons light up by tempo
//// TODO: create events
////      - on sequence event create
////      - on button click
////      - on new bar
//var xox = (function () {
//    var elements = {},
//        config = {
//            pattern: {
//                steps: 16,
//                channels: 2
//            },
//            buttons: {
//                width: 30,
//                padding: 2
//            }
//        },
//    // starting sequence
//        activeSequence = 0,
//        activeBar = 0,
//        events = {},
//        pattern = {
//            sequences: [
//                [{ step: 0 },
//                    { step: 4 },
//                    { step: 8 },
//                    { step: 12 }]
//            ]
//        };
//
//    var renderer = {
//        sequence: function (s, index) {
//            // iterate each action
//            var len = s.length,
//                c = createChannel(),
//                e = createEdit();
//
//            elements.display.appendChild(c);
//            elements.sidebar.appendChild(e);
//
//            if (activeSequence == index) {
//                e.classList.add('on');
//            } else {
//                e.classList.remove('on');
//                e.addEventListener('click', function () {
//                    activeSequence = index;
//                    render();
//                });
//            }
//
//            if (len == 0) {
//                c.appendChild(createAction(config.pattern.steps).setSpacer());
//            } else {
//                s.sort(sortActions);
//                // each action in the sequence
//                each(s, function (a, i) {
//                    var next;
//
//                    // if we're the last action
//                    if (i == len-1) {
//                        next = config.pattern.steps;
//                    } else {
//                        next = s[i+1].step;
//                    }
//                    // determine its length
//                    a.length = next - a.step;
//
//                    var ael;
//                    // if we're the first action insert a spacer
//                    if (i == 0) {
//                        if (a.step != 0) {
//
//                            view({
//                                el: c,
//                                model: a,
//                                render: function () {
//                                    var that = this;
//                                    // insert a non-action div into the display
//                                    var ael = createAction(this.model.step);
//
//                                    addClick(ael, function () {
//                                        // load the action options for current preset into action
//                                        trigger('actionClick', {
//                                            el: ael,
//                                            action: that.model
//                                        });
//                                    });
//
//                                    this.el.appendChild(ael.setSpacer());
//                                }
//                            }).render();
//                        }
//                    }
//                    //{"sequences":[[{"step":0,"length":4},
//                    // {"step":4,"length":4,"options":{"color":"#fafafa","endColor":"#ff00f0","type":["in","out"]},"action":"morphColor"},
//                    // //{"step":8,"length":4},{"step":12,"length":4}],[]]}
//                    view({
//                        el: c,
//                        model: a,
//                        render: function () {
//                            var that = this;
//                            // insert a non-action div into the display
//                            var ael = createAction(this.model.length),
//                                // get the renderer and update the action with it.
//                                styler = actionStyles[this.model.action];
//
//                            if (styler) styler(ael, this.model.options);
//
//                            this.el.appendChild(ael);
//
//                            addClick(ael, function () {
//                                // load the action options for current preset into action
//                                trigger('actionClick', {
//                                    el: ael,
//                                    action: that.model
//                                });
//                            });
//                        }
//                    }).render();
//
//                    if (debug) {
//                        // if (debug) actionDiv.innerHTML = action.step + ":" + action.length + ":" + getActionWidth(action.length);
//                        document.getElementById('debug').innerHTML = JSON.stringify(pattern);
//                    }
//                    return;
//                });
//            }
//        },
//        buttons: function (s) {
//            // iterate through actions, turn on buttons that corelate
//            each(s, function (a, i) {
//                elements.buttons[a.step].classList.add('on');
//            });
//        },
//        clearButtons: function () {
//            each(elements.buttons, function (b) {
//                if (b.classList) b.classList.remove('on');
//            });
//        }
//    };
//
//    utils.ui.onLoad(init);
//
//    function init() {
//        // load elements
//        elements.xox = document.getElementsByClassName('xox')[0];
//        elements.display = elements.xox.getElementsByClassName('display')[0];
//        elements.buttons = elements.xox.getElementsByClassName('button');
//        elements.barSelector = document.getElementById('barSelector');
//        elements.barSelectors = elements.barSelector.getElementsByClassName('square');
//        elements.sidebar = document.getElementById('sidebar');
//
//        //assign click handlers to buttons
//        addButtonHandlers(elements.buttons);
//        addBarHandlers(elements.barSelectors);
//        render();
//    }
//
//    function render() {
//        utils.ui.deleteChildren(elements.display);
//        utils.ui.deleteChildren(elements.sidebar);
//
//        utils.each(elements.barSelectors, function (el, i) {
//            if (el.classList) {
//                if (i == activeBar) {
//                    el.classList.add('on');
//                } else {
//                    el.classList.remove('on');
//                }
//            }
//        });
//
//        // render the sequences
//        utils.each(pattern.sequences, function (s, i) {
//            // this needs to update just the display without deleting all
//            renderer.sequence(s, i);
//            // if seq is current render buttons next
//            if (activeSequence == i) {
//                renderer.clearButtons();
//                renderer.buttons(s);
//            }
//        });
//        // render the buttons
//        var addSeq = createEdit();
//        addSeq.classList.add('add');
//        addSeq.innerHTML = "+";
//        elements.sidebar.appendChild(addSeq);
//
//        utils.ui.addClick(addSeq, function () {
//            pattern.sequences.push([]);
//            activeSequence = pattern.sequences.length-1;
//            render();
//        });
//    }
//
//    function addButtonHandlers(els) {
//        //var i, count = els.length, btn;
//
//        utils.each(els, function (el, i) {
//            el.onclick = function () {
//                xoxButtonClick(i);
//            };
//        });
//
//        //for (i=0; i<count; i++) {
//        //    btn = els[i];
//        //    // enclose scope for i
//        //    (function (index) {
//        //        btn.onclick = function () {
//        //            xoxButtonClick(index);
//        //        };
//        //    })(i);
//        //}
//    }
//
//    function addBarHandlers(els) {
//        utils.each(els, function (el, i) {
//            utils.ui.addClick(el, function () {
//                activeBar = i;
//                render();
//            });
//        });
//
//    }
//
//    function xoxButtonClick(stepId) {
//        // Toggle step
//        var index,
//            button = elements.buttons[stepId],
//            seq = pattern.sequences[activeSequence],
//            eventResult;
//
//        var action = utils.find(seq, function (a, i) {
//            index = i;
//            return a.step == stepId;
//        });
//
//        if (action) {
//            // Remove step
//            seq.splice(index, 1);
//            button.classList.remove('on');
//            eventResult = 'actionRemoved';
//        } else {
//            // Add step
//            action = { step: stepId };
//            seq.push(action);
//            button.classList.add('on');
//            eventResult = 'actionAdded';
//            // TODO: trigger 'action added' event
//        }
//        trigger(eventResult, { action: action });
//        render();
//    }
//
//    function getAction(stepId) {
//        return utils.find(sequence, function (a) {
//            return a.step == stepId;
//        });
//    }
//
//    function sortActions (a, b) {
//        return sort(a, b, 'step');
//    }
//
//    function createAction(size) {
//        var a = document.createElement('div');
//        a.style.width = getActionWidth(size);
//        a.className = 'action';
//        a.setSpacer = setSpacer;
//        return a;
//    }
//
//    function createEdit() {
//        var e = document.createElement('div');
//        e.className = 'edit';
//        return e;
//
//    }
//
//    function createChannel() {
//        var c = document.createElement('div');
//        c.className = 'channel';
//        return c;
//    }
//
//    function setSpacer() {
//        this.classList.add('spacer');
//        return this;
//    }
//
//    //function updateButtons(seq) {
//    //    // clear all buttons
//    //    // iterate through actions, turn on buttons that corelate
//    //    each(seq, function (action, index) {
//    //        elements.buttons[action.step].classList.add('on');
//    //    });
//    //}
//
//    function getActionWidth(stepLength) {
//        return (stepLength * (config.buttons.width + (2*config.buttons.padding))) - (2*config.buttons.padding) + 'px';
//    }
//
//    return sequencer;
//})();

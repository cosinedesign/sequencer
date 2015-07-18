/**
 * Created by Jim Ankrom on 6/25/2015.
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
var debug = true;


// TODO: this is the action customization, refactor it out
var actionStyles = {
    setColor: function (el, options) {
        if (options)
            el.style.backgroundColor = options.color;
    },
    morphColor: function (el, options) {
        if (options)
            el.style.background = 'linear-gradient(90deg, ' + options.color + ',' + options.endColor + ')';
    }
};


//// pack items into associative array based on prop
//function pack (items, prop) {
//    var out = {};
//    each(items, function (item) {
//        out[item[prop]]=item;
//    });
//    return out;
//}

function view (options) {
    options = options || {};

    var v = {};
    v.el = options.el || null;
    v.model = options.model || null;
    v.render = options.render || function () {};
    return v;
}

// Factory method that returns an object with access to localStorage for your value.
function storage (key) {

    return {
        get: function (defaultValue) {
            var v = localStorage[key];
            if (v) {
                v = JSON.parse(v);
            } else {
                v = defaultValue;
            }
            return v;
        },
        set: function (value) {
            var v = JSON.stringify(value)
            localStorage[key] = v;
            if (debug) console.log("Saved - " + v);
        }
    }
};

function sort(a, b, prop) {
    if (a[prop] < b[prop]) {
        return -1;
    }
    if (a[prop] > b[prop]) {
        return 1;
    }
    // a must be equal to b
    return 0;
}

function find(items, filter, findAll) {
    return each(items, function (item, index) {
        if (filter(item, index)) return item;
    }, !findAll);
}

// pack array of objects into associative array based on propName
// - for an array of objects [{id: 'a', ...}, {id: 'b', ...}]
//     we should get an object {a: {id: 'a', ...}, b: {id: 'b', ...}}
function pack (els, prop) {
    var out = {};
    each(els, function (item) {
        var key = item[prop];
        if (key) out[key]=item;
    });
    return out;
}

// blend values of one object with values of another with callback
function blend (a, b, callback) {
    each(a, function (item, key) {
        callback(item, b[key], key);
    });
}

// if short is true, and callback returns something, stop the loop.
// returns first result if short is true, all results if short is false.
function each(items, callback, short) {
    var i, keys, key, l, item, map = [];

    if (!items) return;

    if (Array.isArray(items)) {
        l = items.length;
    } else {
        keys = Object.keys(items);
        l = keys.length;
    }

    for (i=0;i<l;i++) {
        if (keys) {
            key = keys[i];
            item = callback(items[key], key);
        } else {
            item = callback(items[i], i);
        }

        if (item) {
            if (short) return item;
            map.push(item);
        }
    }
    if (map.length) return map;
}

function avg(values) {
    var sum = 0, length = values.length, i;
    for(i = 0; i < length; i++ ){
        sum += values[i];
    }
    return sum/length;
}

function addClick(el, handler) {
    if (el.addEventListener) el.addEventListener('click', handler);
}

function onLoad(callback) {
    if(document.readyState === 'complete'){
        callback();
    } else {
        window.addEventListener("load", callback);
    }
}

function createSelect(options) {
    var s = document.createElement('select');

    each(options, function (item, i) {
        s.appendChild(createOption(i, item));
    });
    return s;
}

function createOption(value, text) {
    var o = document.createElement('option');
    o.value = value;
    o.text = text;
    return o;
}

// Delete all child elements
function deleteChildren (e) {
    while (e.firstChild) {
        e.removeChild(e.firstChild);
    }
}

// TODO: wire up events by passing them in to IIFE
var tempoControl = (function () {
    var elements = {

        },
        ms= {
            cur: 500,
            avg: 500,
            cum: 500
        },
        bpms = {
            cur: 128,
            avg: 128,
            cum: 128
        },
        tempo = 120,
        intervals = {},
        pulse = 250;

    function msToBPM(ms) {
        if (ms) {
            var t = 60000/ms;
            return Math.round(t*100)/100;
        } else {
            return ms;
        }
    }

    var tapClick = (function () {
        var x = new Date();
        var lastClickTime = x.getTime(),
            barClicks = [],
            avgClicks = [];

        return function () {
            var d = new Date();
            var t = d.getTime();
            ms.cur = t - lastClickTime;
            lastClickTime = t;
            if (ms.cur) {
                barClicks.push(ms.cur);
                ms.avg = avg(barClicks);
                avgClicks.push(ms.avg);
                ms.cum = avg(avgClicks);
            }
            if (barClicks.length > 4) barClicks.shift();
            if (avgClicks.length > 4) avgClicks.shift();

            clearIntervals();
            render();
            event.stopPropagation();
        };
    })();

    function clearIntervals() {
        each(ms, function (item, key) {
            clearInterval(intervals[key]);
        });
    }

    function init() {
        //transport: document.getElementById('transport'),
        elements.tapTempo = document.getElementById('tapTempo');
        elements.tempoDisplay =  document.getElementById('tempoDisplay');
        var _bpms = elements.tempoDisplay.getElementsByClassName('bpm');
        elements.bpms = pack(_bpms, 'id');
        each(elements.bpms, function (ele, key) {
            addClick(ele, function () {
                clearIntervals();
                tempo = msToBPM(ms[key]);
                elements.tapTempo.innerHTML = tempo;
            });
        });

        addClick(elements.tapTempo, tapClick);
    }

    function render() {
        blend(elements.bpms, ms, function (el, m, key) {
            el.innerHTML = msToBPM(m);
            intervals[key] = setInterval(function () {
                el.classList.add('beat');
                setTimeout(function () {
                    el.classList.remove('beat');
                }, pulse);
            }, m);
        });
    }

    onLoad(init);

    return {
        tempo: tempo
    };
})();

// - xox-style sequencer
// - ableton pattern sequencer (grid of patterns
//     you can turn on / off)

// pattern is n channels of sequences

// Sequencer
// TODO: wire up events by passing them in to IIFE
// TODO: create pattern grid like ableton
// TODO: make buttons light up by tempo
// TODO: create events
//      - on sequence event create
//      - on button click
//      - on new bar
var xox = (function () {
    var elements = {},
        config = {
            pattern: {
                steps: 16,
                channels: 2
            },
            buttons: {
                width: 30,
                padding: 2
            }
        },
    // starting sequence
        activeSequence = 0,
        activeBar = 0,
        events = {},
        pattern = {
            sequences: [
                [{ step: 0 },
                    { step: 4 },
                    { step: 8 },
                    { step: 12 }]
            ]
        };

    var renderer = {
        sequence: function (s, index) {
            // iterate each action
            var len = s.length,
                c = createChannel(),
                e = createEdit();

            elements.display.appendChild(c);
            elements.sidebar.appendChild(e);

            if (activeSequence == index) {
                e.classList.add('on');
            } else {
                e.classList.remove('on');
                e.addEventListener('click', function () {
                    activeSequence = index;
                    render();
                });
            }

            if (len == 0) {
                c.appendChild(createAction(config.pattern.steps).setSpacer());
            } else {
                s.sort(sortActions);
                // each action in the sequence
                each(s, function (a, i) {
                    var next;

                    // if we're the last action
                    if (i == len-1) {
                        next = config.pattern.steps;
                    } else {
                        next = s[i+1].step;
                    }
                    // determine its length
                    a.length = next - a.step;

                    var ael;
                    // if we're the first action insert a spacer
                    if (i == 0) {
                        if (a.step != 0) {

                            view({
                                el: c,
                                model: a,
                                render: function () {
                                    var that = this;
                                    // insert a non-action div into the display
                                    var ael = createAction(this.model.step);

                                    addClick(ael, function () {
                                        // load the action options for current preset into action
                                        trigger('actionClick', {
                                            el: ael,
                                            action: that.model
                                        });
                                    });

                                    this.el.appendChild(ael.setSpacer());
                                }
                            }).render();
                        }
                    }
                    //{"sequences":[[{"step":0,"length":4},
                    // {"step":4,"length":4,"options":{"color":"#fafafa","endColor":"#ff00f0","type":["in","out"]},"action":"morphColor"},
                    // //{"step":8,"length":4},{"step":12,"length":4}],[]]}
                    view({
                        el: c,
                        model: a,
                        render: function () {
                            var that = this;
                            // insert a non-action div into the display
                            var ael = createAction(this.model.length),
                                // get the renderer and update the action with it.
                                styler = actionStyles[this.model.action];

                            if (styler) styler(ael, this.model.options);

                            this.el.appendChild(ael);

                            addClick(ael, function () {
                                // load the action options for current preset into action
                                trigger('actionClick', {
                                    el: ael,
                                    action: that.model
                                });
                            });
                        }
                    }).render();

                    if (debug) {
                        // if (debug) actionDiv.innerHTML = action.step + ":" + action.length + ":" + getActionWidth(action.length);
                        document.getElementById('debug').innerHTML = JSON.stringify(pattern);
                    }
                    return;
                });
            }
        },
        buttons: function (s) {
            // iterate through actions, turn on buttons that corelate
            each(s, function (a, i) {
                elements.buttons[a.step].classList.add('on');
            });
        },
        clearButtons: function () {
            each(elements.buttons, function (b) {
                if (b.classList) b.classList.remove('on');
            });
        }
    };

    onLoad(init);

    // TODO: Convert to decorator
    function trigger (name, args) {
        if (events[name]) events[name](args);
    }

    // TODO: Convert to decorator
    function on(name, callback) {
        events[name] = callback;
    }

    function init() {
        // load elements
        elements.xox = document.getElementsByClassName('xox')[0];
        elements.display = elements.xox.getElementsByClassName('display')[0];
        elements.buttons = elements.xox.getElementsByClassName('button');
        elements.barSelector = document.getElementById('barSelector');
        elements.barSelectors = elements.barSelector.getElementsByClassName('square');
        elements.sidebar = document.getElementById('sidebar');

        //assign click handlers to buttons
        addButtonHandlers(elements.buttons);
        addBarHandlers(elements.barSelectors);
        render();
    }

    function render() {
        deleteChildren(elements.display);
        deleteChildren(elements.sidebar);

        each(elements.barSelectors, function (el, i) {
            if (el.classList) {
                if (i == activeBar) {
                    el.classList.add('on');
                } else {
                    el.classList.remove('on');
                }
            }
        });

        // render the sequences
        each(pattern.sequences, function (s, i) {
            // this needs to update just the display without deleting all
            renderer.sequence(s, i);
            // if seq is current render buttons next
            if (activeSequence == i) {
                renderer.clearButtons();
                renderer.buttons(s);
            }
        });
        // render the buttons
        var addSeq = createEdit();
        addSeq.classList.add('add');
        addSeq.innerHTML = "+";
        elements.sidebar.appendChild(addSeq);
        addClick(addSeq, function () {
            pattern.sequences.push([]);
            activeSequence = pattern.sequences.length-1;
            render();
        });
    }

    function addButtonHandlers(els) {
        //var i, count = els.length, btn;

        each(els, function (el, i) {
            el.onclick = function () {
                xoxButtonClick(i);
            };
        });

        //for (i=0; i<count; i++) {
        //    btn = els[i];
        //    // enclose scope for i
        //    (function (index) {
        //        btn.onclick = function () {
        //            xoxButtonClick(index);
        //        };
        //    })(i);
        //}
    }

    function addBarHandlers(els) {
        each(els, function (el, i) {
            addClick(el, function () {
                activeBar = i;
                render();
            });
        });

    }

    function xoxButtonClick(stepId) {
        // Toggle step
        var index,
            button = elements.buttons[stepId],
            seq = pattern.sequences[activeSequence],
            eventResult;

        var action = find(seq, function (a, i) {
            index = i;
            return a.step == stepId;
        });

        if (action) {
            // Remove step
            seq.splice(index, 1);
            button.classList.remove('on');
            eventResult = 'actionRemoved';
        } else {
            // Add step
            action = { step: stepId };
            seq.push(action);
            button.classList.add('on');
            eventResult = 'actionAdded';
            // TODO: trigger 'action added' event
        }
        trigger(eventResult, { action: action });
        render();
    }

    function getAction(stepId) {
        return find(sequence, function (a) {
            return a.step == stepId;
        });
    }

    function sortActions (a, b) {
        return sort(a, b, 'step');
    }

    function createAction(size) {
        var a = document.createElement('div');
        a.style.width = getActionWidth(size);
        a.className = 'action';
        a.setSpacer = setSpacer;
        return a;
    }

    function createEdit() {
        var e = document.createElement('div');
        e.className = 'edit';
        return e;

    }

    function createChannel() {
        var c = document.createElement('div');
        c.className = 'channel';
        return c;
    }

    function setSpacer() {
        this.classList.add('spacer');
        return this;
    }

    //function updateButtons(seq) {
    //    // clear all buttons
    //    // iterate through actions, turn on buttons that corelate
    //    each(seq, function (action, index) {
    //        elements.buttons[action.step].classList.add('on');
    //    });
    //}

    function getActionWidth(stepLength) {
        return (stepLength * (config.buttons.width + (2*config.buttons.padding))) - (2*config.buttons.padding) + 'px';
    }

    return {
        on: on
    };
})();

// Create and choose action presets to load into the sequencer
// TODO: list all presets, include a save and new button
// TODO: change select option to show a * if edited
// TODO: wire up click on sequencer action items to save current preset into the sequence
// TODO: remove color from preset - get it from the action
// TODO: swatch editor
var actionEditor = (function (id, sequencer) {
    // actionDefs should be loaded from a config file
    var actionDefs = {
            setColor: {
                color:  {type: 'color', initial: '#FF6600'}
            },
            morphColor: {
                color: { type: 'color', initial: '#FF66FF'},
                endColor: { type: 'color', initial: '#FF0000'},
                type: { type: 'options', values: ['in', 'out']}
            }
        },
        actionStorage = storage('myActions'),
        defaultPresets = {
            Default: {
                action: 'setColor',
                options: {
                    color: '#00FF00'
                }
            }
        },
        editor = {
            preset: {
                name: 'Default',
                action: 'setColor',
                options: {
                    color: '#00FF00'
                }
            }
        },
        elements = {},
        events = {},
        locale = {
            labels: {
                pickDef: "Actions:",
                pickAction: "My Actions:"
            }
        },
        presetStore = storage('myPresets'),
        presetEditor = new dat.GUI({ autoPlace: false }),
        presetActionControllers = [],
        presetControllers = {},
        presetFolder;

    var presets = presetStore.get(defaultPresets),
        actions = actionStorage.get();

    onLoad(function () {
        elements[id] = document.getElementById(id);
        elements.actionTabs = document.getElementById('actionTabs');
        // list of presets
        elements.presetPicker = document.getElementById('presetPicker');
        //var list = elements.actionList = document.createElement('div');
        var form = elements.actionForm = document.createElement('div');

        var lbl = document.createElement('span');
        lbl.classList.add('label');
        lbl.innerHTML = locale.labels.pickDef;

        //Create and append select list
        //var s = elements.actionDefSelect = document.createElement('select');

        // save button
        //var b = document.createElement('div');

        //elements[id].appendChild(lbl);
        //elements[id].appendChild(s);
        //elements[id].appendChild(list);
        elements[id].appendChild(form);
        form.appendChild(renderEditorBar());
        form.appendChild(presetEditor.domElement);

        var actionNames = [];

        each(actionDefs, function (item, key) {
            actionNames.push(key);
        });

        renderPresets(elements.presetPicker);

        // controller for preset selector
        //presetEditor
        //    .add(editor.preset, 'name', presetNames)
        //        .onChange(function (name) {
        //            editor.preset = presets[name];
        //        }).listen();

        // controller for action selector
        presetControllers.action = presetEditor.add(editor.preset, 'action', actionNames);
        presetControllers.action.onChange(function (action) {
            var p = createPreset(action);
            p.name = editor.preset.name;
            presets[editor.preset.name] = p;
            editor.preset = presets[editor.preset.name];
            renderPresetEditor(editor.preset);
        });

        //presetEditor.onPresetChange(function (v) {
        //    initActionGui(v.action);
        //});

        //presetEditor.addColor(editor.preset, 'color');
        presetFolder = presetEditor.addFolder('Action Config');
        renderPresetEditor(editor.preset);

        //presetEditor.remember(preset);
        //presetEditor.revert();
        //s.addEventListener('change', onActionDefSelect);

        // fix stored actions if not loaded
        if (!actions) {
            actions = {};
            actionStorage.set(actions);
        }

        // then render them
        renderActions ();
    });

    sequencer.on('actionRemoved', function (e) {
        // TODO: ... not sure
    });
    sequencer.on('actionAdded', function (e) {
        //TODO: add coloring to the action
    });


    // TODO: Make these a mixin
    function trigger (name, args) {
        if (events[name]) events[name](args);
    }

    function on(name, callback) {
        events[name] = callback;
    }

    function renderPresets(target) {

        each(presets, function (item, key) {
            // render preset
            var el = document.createElement('div');
            el.id = key;
            el.innerHTML = key;
            el.classList.add('preset');
            // TODO: This currently throws an error when you go from a setColor preset to a morphColor preset
            el.addEventListener('click', onSelectPreset.bind(this, el, item));
            actionStyles[item.action](el, item.options);
            // add to picker list
            target.appendChild(el);
        });
    }


    function savePresets() {
        // save current form preset to be the current selected preset
        presetStore.set(presets);
        deleteChildren(elements.presetPicker);
        renderPresets(elements.presetPicker);
    }

    function onSelectPreset(el, preset) {
        if (debug) console.log('preset selected:' + JSON.stringify(preset));
        editor.preset = preset;
        renderPresetEditor(editor.preset);
    }

    function renderEditorBar () {
        var bar = document.createElement('div');
        var newPreset = document.createElement('div');
        var savePreset = document.createElement('div');
        bar.appendChild(newPreset);
        newPreset.innerHTML = 'New';
        newPreset.addEventListener('click', function () {
            var name = window.prompt("Enter new preset name:");
            presets[name] = createPreset('setColor');
            savePresets();
            editor.preset = presets[name];
        });

        savePreset.innerHTML = 'Save';
        savePreset.addEventListener('click', savePresets);
        bar.appendChild(savePreset);

        return bar;
    }

    function createPreset(action) {
        var a = actionDefs[action],
            p = {
                action: action,
                options: {}
            };

        // maps to the property values in the action
        var defaultMap = {
            color: 'initial',
            options: 'values'
        };

        each(a, function (item, key) {
            p.options[key] = item[defaultMap[item.type]];
        });
        return p;
    }

    function renderPresetEditor(preset) {
        var actionDef = actionDefs[preset.action];
        var f = presetFolder;
        // remove action controllers from datgui
        each(presetControllers.options, function (c) {
            f.remove(c);
        });

        if (!presetControllers.options) presetControllers.options = {};

        each(actionDef, function (item, key) {
            var c;
            if (item.type == 'color') {
                c = f.addColor(preset.options, key).listen();
            } else {
                if (item.type == 'options') {
                    c = f.add(editor.preset.options, key, item.values).listen();
                } else {
                    c = f.add(editor.preset.options, key).listen();
                }
            }
            presetControllers.options[key] = c;

        });
        f.open();
    }

    // render an action edit form into elements.actionForm
    //function onActionDefSelect(e) {
    //    var o = e.target.options[e.target.selectedIndex];
    //    var actionDef = actionDefs[o.text];
    //
    //    deleteChildren(elements.actionForm);
    //
    //    var settings = { };
    //
    //    each(actionDef, function (item, key) {
    //        if (item.type == 'color') {
    //            settings[key] = item.initial;
    //            presetEditor.addColor(settings, key);
    //        } else {
    //            if (item.type == 'options') {
    //                settings[key] = item.values[0];
    //                presetEditor.add(settings, key, item.values);
    //            } else {
    //                settings[key] = item;
    //                presetEditor.add(settings, key);
    //            }
    //        }
    //    });
    //
    //}

    function renderActions () {
        each(actions, function (action, key) {
            var a = document.createElement('div');
            a.innerHTML = key;
            if (action.color) a.style.backgroundColor = action.color;

            elements.actionList.appendChild(a);
        });
    }

    sequencer.on('actionClick', function (e) {
        if (!e.action.options) {
            e.action.options = {};
        }
        e.action.action = editor.preset.action;
        each(editor.preset.options, function (item, key) {
            e.action.options[key] = item;
        });

        // get the renderer and update the action with it.
        actionStyles[e.action.action](e.el, editor.preset.options);

        //actionStorage.set(actions);
    });


    editor.on = on;

    return editor;

})('presetEditor', xox);

//var actionTabs = (function (id) {
//
//    onLoad(function () {
//
//    });
//
//})('actionTabs');


//var presetPicker = (function () {
//
//
//
//
//    var picker = {
//        preset: {
//            action: 'setColor',
//            color: '#00FF00',
//            options: {}
//        },
//        on: on
//    };
//
//
//    function render() {
//        var select = createSelect(presets);
//        el.appendChild(select);
//    }
//
//    onLoad(function () {
//        elements.presetPicker = document.getElementById('presetPicker');
//        render();
//    });
//
//    return picker;
//})();
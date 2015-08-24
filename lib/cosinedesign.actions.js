/**
 * Created by Jim Ankrom on 7/18/2015.
 */
// Create and choose action presets to load into the sequencer
// TODO: list all presets, include a save and new button
// TODO: change select option to show a * if edited
// TODO: wire up click on sequencer action items to save current preset into the sequence
// TODO: remove color from preset - get it from the action
// TODO: swatch editor
var actionEditor = (function (id, sequencer, utils) {
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
        actionStorage = utils.cache.storage('myActions'),
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
        presetStore = utils.cache.storage('myPresets'),
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

    sequencer.on('stepRemoved', function (e) {
        // TODO: ... not sure
    });
    sequencer.on('stepAdded', function (e) {
        //TODO: add coloring to the action
    });
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

    utils.decorators.events(editor);

    return editor;

})(
    'presetEditor',
    cosinedesign.control,
    cosinedesign.utility
);

/**
 * Created by cosinezero on 8/23/2015.
 */
// Pattern controller    --------------------------------------------

(function (x0x, utils, svg, editor, services, actionDefs, config) {
    var actionController,
        patternController,
        patternListController,
        views = x0x.views;

    x0x.controllers = {};

    // TODO: Move these to inside the patternController
    var buttonSize = config.grid.size + (config.grid.border * 2);

    function createCell(value, parentTr, isTh) {
        var cell = utils.ui.create.element(isTh?'th':'td', parentTr);
        cell.innerText = value;
        return cell;
    }

    function createFormRow (label, input, parent) {
        var create = utils.ui.create;
        var tr = create.element('tr', parent);
        var cell = create.element('th', tr);
        cell.innerText = label;
        var field = create.element('td', tr);
        field.appendChild(input);
        return tr;
    }

    // TODO: this is definitely needing work
    function createButtonRow (buttons, parent, colspan) {
        var create = utils.ui.create;
        var tr = create.element('tr', parent);
        var td = create.element('td', tr);
        if (colspan) td.setAttribute('colspan', colspan);

        var d = create.element('div', td);
        d.style.width = '33%';
        d.style.display = 'inline-block';
        d = create.element('div', td);
        d.style.width = '33%';
        d.style.display = 'inline-block';

        utils.each(buttons, function (but) {
            var col = create.element('div', d);
            col.style.width = '50%';
            col.style.display = 'inline-block';
            col.appendChild(but);
        });
        d = create.element('div', td);
        d.style.width = '33%';
        d.style.display = 'inline-block';

        return tr;
    }
    //
    var demoPatternList = [{
            name: "test 1",
            author: "jim@gmail.com",
            camp: "DANCE CAMP",
            description: "",
            key: 325873057 // use date.now()
        },{
            name: "test 3",
            author: "jim@gmail.com",
            camp: "DANCE CAMP",
            description: "",
            key: 325873057
        },{
            name: "test 2",
            author: "jim@gmail.com",
            camp: "DANCE CAMP",
            description: "",
            key: 325873057
        },
            {
                name: "test 1",
                author: "jim@gmail.com",
                camp: "DANCE CAMP",
                description: "",
                key: 325873057 // use date.now()
            },{
                name: "test 3",
                author: "jim@gmail.com",
                camp: "DANCE CAMP",
                description: "",
                key: 325873057
            },{
                name: "test 2",
                author: "jim@gmail.com",
                camp: "DANCE CAMP",
                description: "",
                key: 325873057
            },
            {
                name: "test 1",
                author: "jim@gmail.com",
                camp: "DANCE CAMP",
                description: "",
                key: 325873057 // use date.now()
            },{
                name: "test 3",
                author: "jim@gmail.com",
                camp: "DANCE CAMP",
                description: "",
                key: 325873057
            },{
                name: "test 2",
                author: "jim@gmail.com",
                camp: "DANCE CAMP",
                description: "",
                key: 325873057
            },{
                name: "test 1",
                author: "jim@gmail.com",
                camp: "DANCE CAMP",
                description: "",
                key: 325873057 // use date.now()
            },{
                name: "test 3",
                author: "jim@gmail.com",
                camp: "DANCE CAMP",
                description: "",
                key: 325873057
            },{
                name: "test 2",
                author: "jim@gmail.com",
                camp: "DANCE CAMP",
                description: "",
                key: 325873057
            },{
                name: "test 1",
                author: "jim@gmail.com",
                camp: "DANCE CAMP",
                description: "",
                key: 325873057 // use date.now()
            },{
                name: "test 3",
                author: "jim@gmail.com",
                camp: "DANCE CAMP",
                description: "",
                key: 325873057
            },{
                name: "test 2",
                author: "jim@gmail.com",
                camp: "DANCE CAMP",
                description: "",
                key: 325873057
            }
        ];



    //-----------------------------------------------------------------------------------Pattern List
    patternListController = {
        patternList: [],// demoPatternList, //services.pattern.load('list'),
        actions: {
            list: function () {
                var ctrl = patternListController;
                var d = ctrl.elList = utils.ui.create.element('div', document.body);
                d.id = 'patternList';
                var title = utils.ui.create.element('div', d);
                title.innerHTML = "<h1>Load Pattern</h1><h3>Select a pattern:</h3>";

                d.className = 'dialog';

                var t = utils.ui.create.element('table', ctrl.elList);
                t.className = 'list';

                var h = utils.ui.create.element('tr', t);
                createCell('Name', h, 1);
                createCell('Bars', h, 1);
                createCell('Author', h, 1);
                createCell('Camp', h, 1);

                utils.each(ctrl.patternList, function (p) {
                    var r = utils.ui.create.element('tr', t);
                    r.className = 'list';
                    createCell(p.name, r);
                    createCell(p.bars, r);
                    createCell(p.author, r);
                    createCell(p.camp, r);

                    utils.ui.addClick(r, function () {
                        document.body.removeChild(d);
                        ctrl.actions.load(p.key);
                    });
                });

                utils.ui.align.center(views.bar.svg, d);
            },
            showSaveForm: function () {
                var create = utils.ui.create;
                var d = create.element('div', document.body);
                d.className = 'dialog';
                var title = utils.ui.create.element('div', d);
                title.innerHTML = "<h1>Save Pattern</h1><h3>Please enter the following:</h3>";

                var t = utils.ui.create.element('table', d);
                t.className = 'list';

                var form = {
                    name: create.input({ type: 'text'}),
                    author: create.input({ type: 'text'}),
                    camp: create.input({ type: 'text'})
                    },
                    labels = {
                        name: "Name",
                        author: "Author",
                        camp: "Camp"
                    },
                    buttons = {
                        butSave: create.input({
                            type: 'button',
                            value: 'OK',
                            events: {
                                click: function () {
                                    var model = {}, invalid = {}, hasErrors = false;
                                    // load data into model and validate
                                    utils.each(form, function (item, index, key) {
                                        if (!item.value) {
                                            hasErrors = true;
                                            invalid[key] = item;
                                        } else {
                                            model[key] = item.value;
                                        }
                                    });

                                    if (hasErrors) {
                                        var message = "Please enter the following information: \n";
                                        utils.each(invalid, function (item, index, key) {
                                            message += "\n- " + labels[key];
                                        });

                                        alert(message);
                                    } else {
                                        model.key = Date.now();
                                        patternListController.actions.save(model);
                                        document.body.removeChild(d);
                                    }
                                }
                            }
                        }),
                        butCancel: create.input({
                            type: 'button',
                            value: 'Cancel',
                            events: {
                                click: function () {
                                    document.body.removeChild(d);
                                }
                            }
                        })
                    };

                createFormRow("Name:", form['name'], t);
                createFormRow("Author:", form['author'], t);
                createFormRow("Camp:", form['camp'], t);
                createButtonRow(buttons, t, 2);

                utils.ui.align.center(views.bar.svg, d);
            },
            load: function (key) {
                var pattern = services.pattern.load(key);
            },
            save: function (model) {
                // TODO: save actionDefs

                var p = patternController.activePattern;
                model.bars = p.bars.length;

                patternListController.patternList.push(utils.clone(model));
                services.pattern.save('list', patternListController.patternList);


                model.pattern = patternController.activePattern;

                services.pattern.save(model.key, model);

                if (debug) console.log('pattern ' + model.key + ' saved!');
                alert('Pattern ' + model.name + ' saved!');
                return model.key;
            },
            upload: function () {
                alert('upload');
                // TODO: call server's upload method
                utils.api.post(
                    config.server.url + ':' + config.server.apiPort + config.server.api.pattern,
                    // TODO: Compress the active pattern before sending
                    patternController.activePattern.bars);
            }
        }
    };

    views.barSelect.on('barSelectorCreated', function (s, selectedBar, barIndex) {
        utils.ui.addClick(s, function () {
            views.barSelect.setActive(barIndex);
            var bar = views.bar;
            bar.bar = selectedBar;
            bar.clear();
            bar.render();
            // TODO: set the bar selector button to active
            // TODO: set the active sequence too
            // TODO: we also have to re-render the buttonBar...
            //
            //views.buttonBar.clear();
            //views.buttonBar.activeSequence = this.activeSequence;
            //views.buttonBar.position(bar);
            //views.buttonBar.render();
            setActiveSequence(getViewForSequence(patternController.activeSequenceIndex));
        });
    });

    // events - buttonBar; buttonCreated
    views.buttonBar.on('buttonCreated', function (s, stepIndex) {
        utils.ui.addClick(s, function () {
            // get action at activeSequence step
            var actionIndex = -1,
                sequenceView;

            var action = utils.find(patternController.activeSequence, function (a, i) {
                actionIndex = i;
                return a.step == stepIndex;
            });

            var previousAction;
            utils.each(patternController.activeSequence, function (a) {
                if (!previousAction) {
                    previousAction = a;
                }
                else {
                    if (a.step < stepIndex && a.step > previousAction.step) {
                        previousAction = a;
                    }
                }
            });

            sequenceView = views.bar.sequenceViews[patternController.activeSequenceIndex];

            // if step exists, then removeAction, else newAction
            if (action) {
                patternController.actions.removeAction(actionIndex);
                views.buttonBar.buttonOff(s, stepIndex);
            } else {
                var newAction = patternController.actions.newAction(stepIndex, previousAction);
                views.buttonBar.buttonOn(s, stepIndex);
            }

            // re-render the active sequence view
            sequenceView.position(sequenceView.startPosition);
            sequenceView.clear();
            sequenceView.init();
            sequenceView.render();
            views.bar.trigger('sequenceViewRendered', sequenceView);
            // TODO: We don't -need- to reset this as active, just figure a better way to keep it active
            setActiveSequence(sequenceView);

            //views.bar.render();
        });
    });

    views.barSelect.addBarClick = function () {

        // TODO: add new empty sequence for each in the previous bar
        var bars = patternController.activePattern.bars,
            select = views.barSelect;
        var len = bars.length;
        if (len == 8) {
            return;
        }

        // One bar becomes 2. 2 becomes 4. 4 becomes 8 (stop there)
        // so let's create a new bar for each existing bar
        var newBar;
        utils.each(bars, function (bar, index) {
            newBar = { sequences: [] };
            // iterate over the last bar's sequences and add empty sequence to each
            utils.each(bar.sequences, function (item) {
                newBar.sequences.push(utils.clone(item));
            });
            bars.push(newBar);
        });


        // Now render the lot
        select.clear();
        select.init();
        select.render();
        // Setting len as the active bar,
        // because that will effectively be the first new bar
        select.setActive(len);
        // TODO - have to set the bar to the view

        // render the new bar
        views.bar.clear();
        views.bar.bar = bars[len];
        views.bar.render();
        setActiveSequence(getViewForSequence(patternController.activeSequenceIndex));
    };

    function addEmptySequence() {
        var s = services.pattern.buildSequence(),
            bars = patternController.activePattern.bars;

        utils.each(bars, function (bar, index) {
            bar.sequences.push(utils.clone(s));
        });

        return s;
    }

    // Add sequence to current patter.
    views.buttonBar.addSequenceClick = function () {
        var b = views.bar,
            s = services.pattern.buildSequence();

        // set this as selected sequence
        patternController.activeSequence = addEmptySequence();

        // re-run init
        var sV = b.addSequenceView(s, patternController.activePattern.bars[0].sequences.length-1);

        b.renderView(sV);// { x: b.x, y: b.y });
        setActiveSequence(sV);

        views.buttonBar.move({x: b.x, y: sV.y + buttonSize + config.grid.border });

        // Initialize a new sequence view, and re-render?
        // TODO: This should point to the controller's reference to the barView, not to the x0x namespace view
        //          even tho they're the same thing, this is not the right coupling
//                    var seqView = x0x.buildSequenceView(b, s);
//                    b.sequenceViews.push(seqView);
//                    seqView.init();
//                    seqView.render();
        //b.render();
    };

    // TODO: Wire up action added, action removed events to views
//                views.bar.on('sequenceViewRendered', function (view) {
//                    // assign click handlers to the select sequence button
//                    utils.ui.addClick(view.select.button, function () {
//                        var b = views.bar;
//                        if (b.selectedSequenceView) {
//                            b.selectedSequenceView.select.button.style.fill = config.sequence.button.fill;
//                        }
//
//                        setActiveSequence(view);
//                    });
//                });

    views.bar.on('sequenceViewCreated', function (view) {
        view.on('render', patternController.onSequenceRendered);
        view.on('stepActionViewCreated', function (action, shape, sequenceView) {
            // assign click handler
            utils.ui.addClick(shape, function () {
                var active = utils.clone(patternController.activeAction);

                if (active.name) delete active.name;

                // merge the action information from activeAction
                // fixme: this probably leaves around garbage attributes
                utils.merge(action, active, true);

                // TODO: render action into shape
                actionDefs[active.type]
                    .render(views.actionList.defs, shape, active.options);

                // when you click on the action, that sequence should become active
                setActiveSequence(sequenceView);

                document.getElementById('debug').innerText = JSON.stringify(patternController.activePattern);
            });
        });
    });

    // TODO: this should be based on the sequence index
    function setActiveSequence(view) {
        var pc = patternController,
            b = views.bar,
            buttons = views.buttonBar;

        if (b.selectedSequenceView) {
            b.selectedSequenceView.select.button.style.fill = config.sequence.button.fill;
        }

        buttons.activeSequence = b.selectedSequence = view.sequence;
        buttons.update();
        b.selectedSequenceView = view;
        pc.activeSequence = view.sequence;
        pc.activeSequenceIndex = view.sequenceIndex;
        view.select.button.style.fill = config.sequence.selected.fill;

        // Remove Sequence
        if (!b.removeSequenceButton) {
            b.removeSequenceButton = svg.create.use(b.selectedSequenceView.svg, { id: 'removeItem'}, {
                    x: b.selectedSequenceView.x + config.grid.border,
                    y: b.selectedSequenceView.y + config.grid.border
                },
                null,
                {
                    stroke: config.commands.active.stroke,
                    fill: config.commands.active.fill
                });
            utils.ui.addClick(b.removeSequenceButton, confirmDeleteActiveSequence);
        }
        // disable if this is the last one
        if (!(pc.activePattern.bars[0].sequences.length-1)) {
            b.removeSequenceButton.style.stroke = config.commands.inactive.stroke;
        } else {
            b.removeSequenceButton.style.stroke = config.commands.active.stroke;
        }
        b.removeSequenceButton.y.baseVal.value = view.y + config.grid.border;
    }

    function confirmDeleteActiveSequence() {
        var pc = patternController;
        if (pc.activePattern.bars[0].sequences.length) {
            var r = confirm("Delete this sequence from the pattern? Doing so will remove it from all bars in this pattern.");
            if (r == true) {

                var bars = pc.activePattern.bars;
                var lastIndex = bars[0].sequences.length - 1;
                // delete the sequence from all bars
                utils.each(pc.activePattern.bars, function (bar) {
                    bar.sequences.splice(pc.activeSequenceIndex, 1);
                });
                // set next to active, or if that's the last sequence, use the prior one.
                // if it's zero do nothing
                if (pc.activeSequenceIndex == lastIndex && (lastIndex)) {
                    pc.activeSequenceIndex--;
                }
                lastIndex = pc.activeSequenceIndex;
                patternController.reset();
                patternController.init();
                var bb = views.buttonBar;

                views.buttonBar.move({x: bb.x, y: bb.y + config.grid.border});
                setActiveSequence(getViewForSequence(lastIndex));
                // TODO HERE re-render the pattern view
            }
        }
    }

    function getViewForSequence(index) {
        return views.bar.sequenceViews[index];
    }

    // Pattern Controller       -------------------------------------------
    patternController = x0x.controllers.pattern = {
        activeAction: {"type":"morphColor","options":{"color":"#fafafa","endColor":"#ff00f0","type":["in","out"]}},
        activeSequence: null,
        activePattern: null,
        // this is a STEP ACTION view, not "action"

        onSequenceRendered: function (view) {
            // assign click handlers to the select sequence button
            utils.ui.addClick(view.select.button, function () {
                var b = views.bar;
                if (b.selectedSequenceView) {
                    b.selectedSequenceView.select.button.style.fill = config.sequence.button.fill;
                }

                setActiveSequence(view);
            });
        },
        init: function () {
            // get the pattern, and activeSequence
            var pattern; //TODO: patternBank.get('default');

            if (!this.activePattern) {
                pattern = services.pattern.build({ name: "default" });
                //services.pattern.save();

                this.activePattern = pattern;
            }

            this.activeSequence = this.activePattern.bars[0].sequences[0];
            this.activeSequenceIndex = 0;
            var startPosition = { x:0, y:0},
                barSelect = views.barSelect,
                bar = views.bar,
                menu = views.menuBar;

            this.listPattern = svg.create.use(bar.svg, { id: 'listItems'}, { x: startPosition.x + config.grid.border, y: startPosition.y + config.grid.border });
            utils.ui.addClick(this.listPattern, patternListController.actions.list);

            barSelect.pattern = this.activePattern;
            barSelect.position(startPosition);
            barSelect.listPatternClick = patternListController.actions.list;
            barSelect.init();
            barSelect.render();

            // over one, down one
            menu.position({
                x: barSelect.x + config.grid.size + (config.grid.border*2),
                y: barSelect.y
            });
            menu.savePatternClick = patternListController.actions.showSaveForm;
            menu.uploadPatternClick = patternListController.actions.upload;
            menu.render();

            startPosition.y = barSelect.y;
            startPosition.x = 0;

            bar.bar = this.activePattern.bars[0];
            bar.position(startPosition);
            bar.render();

            //newSequenceButton.render();
            startPosition.y = views.bar.y;

            views.buttonBar.activeSequence = this.activeSequence;
            views.buttonBar.position(startPosition);
            views.buttonBar.render();

            // Find the sequence view and make it active
            setActiveSequence(getViewForSequence(0));
        },
        reset: function () {
            views.barSelect.clear();
            views.bar.clear();
            views.buttonBar.clear();
        },
        // these are CONTROLLER ACTIONS, not "actions" in the sequencer sense
        actions: {
            // TODO - new pattern
            newPattern: function () {},
            // TODO - select bar
            selectBar: function (barId) {},
            // TODO - new bar
            newBar: function () {},
            // TODO - new sequence (channel)
            newSequence: function () {},
            // TODO: something will need to toggle between new and remove
            // TODO - new action (clicked on button bar)
            newAction: function (stepId, clone) {
                // Add action
                var a = { step: stepId };
                a.name = clone.name;
                a.type = clone.type;
                if (clone.options) a.options = utils.merge({}, clone.options);
                patternController.activeSequence.push(a);
                // TODO: re-set prior action's length

                return a;
            },
            // TODO - remove action (clicked on button bar, action exists at that step
            removeAction: function (index) {
                patternController.activeSequence.splice(index, 1);
            },
            // TODO - assign action type
            // TODO: this should be what clicking on a rendered action should execute
            assignAction: function (action, options) {}
        }
    };
    // end pattern controller   -------------------------------------------



    // Action Controller        -------------------------------------------
    // Responsible for the list of available actions
    actionController = x0x.controllers.action = {
        editor: {}, // TODO: fill with editor
        init: function () {
            // TODO: uncomment the below when ready:
            //this.actions = services.actions.load();
            this.actionPresets = services.actions.load('presets') || [{
                    name: 'Go Black',
                    type: 'setColor',
                    options: {
                        color: "#000000"
                    }
                }, {
                    name: 'Strobe White',
                    type: 'strobe',
                    options: {
                        color: "#ffffff"
                    }
                }, {
                    name: 'Morph Color',
                    type: 'morphColor',
                    options: {
                        color1:  "#FFFFFF",
                        color2: "#000000"
                    }
                }, {
                    name: 'Morph Color',
                    type: 'morphColor',
                    options: {
                        color1:  "#FF0000",
                        color2: "#FF00FF"
                    }
                }, {
                    name: 'Morph Color',
                    type: 'morphColor',
                    options: {
                        color1: "#FF00FF",
                        color2: "#0000FF"
                    }
                }];

            if (!this.actionPresets) {
                this.actionPresets = [];
            }
            var listView = views.actionList;
            listView.actionDefs = actionDefs;
            listView.actions = this.actionPresets;
            listView.on('addActionCreated', function (svgButton) {
                utils.ui.addClick(svgButton, function () {
                    // create a new default action
                    var def = utils.find(actionDefs, function () {
                        return true;
                    });
                    actionController.actions.addNewAction({
                        type: def.type,
                        options: {}
                    });
                });
            });
            var activeActionShape;
            listView.on('actionViewCreated', function (action, shape) {
                // TODO: add double-click to edit functionality
                utils.ui.bind(shape, 'doubleclick', function () {
                   // TODO: load action into edit form
                });

                // Click on action in menu
                utils.ui.addClick(shape, function () {
                    if (patternController.activeAction === action) {
                        actionController.actions.editAction(action);
                    } else {
                        patternController.activeAction = action;

                        if (activeActionShape)
                            activeActionShape.style.stroke = config.actions.inactive.stroke;
                        shape.style.stroke = config.actions.active.stroke;
                        activeActionShape = shape;
                    }
                });
            });

            listView.init();
            listView.render();
        },
        actions: {
            editAction: function (action) {
                // launch the editor
                var ed = actionController.editor;
                ed.actionData = action;
                ed.editingAction = action;
                ed.render();
            },
            addNewAction: function (newAction) {
                // TODO: add a new action to this.actions
                // TODO: re-render the list
                // TODO: pop the action editor, with the new action
                var ed = actionController.editor;
                ed.clear();
                // do not need to clone here, newAction is already new...
                ed.actionData = newAction;
                ed.setType(newAction.type)
                    // launch editor with that action
                    .render();
            },
            saveAction: function (newAction) {
                var ed = actionController.editor;
                // if ed.editingAction exists, we need to modify that.

                if (ed.editingAction) {
                    // copy new action over ed.editingAction
                    utils.merge(ed.editingAction, newAction, true);
                } else {
                    // otherwise, we're adding.
                    actionController.actionPresets.push(utils.clone(newAction));
                }

                services.actions.save('presets', actionController.actionPresets);

                views.actionList
                    .clear()
                    .init()
                    .render();
            }
        }

    };
    var editorId = 'actionEditor';
    utils.extensions.lazyProperty(editorId, function () {
        return utils.ui.create.div(editorId);
    }, null, actionController);
    // end action controller    -------------------------------------------

    // Action Editor            -------------------------------------------
    // TODO: Refactor all this into an 'actionEditor'; this could even be a lazy property on the controller
    actionController.editor = (function () {
        var el = document.body.appendChild(actionController[editorId]),
            initialAction = utils.find(actionDefs, function () {
                return true;
            });

        var scope = {
            // This is a temp action like you would find in a sequence
            actionData: initialAction,
            actionDef: actionDefs[initialAction.type],
            actionOptions: {},
            svgAction: svg.create.svg({
                width: 200, height: 30
            }),
            svgShape: svg.create.shape({width: config.grid.size * 5, height: config.grid.size}),
            cancel: function () {
                this.editingAction = null;
                this.hide();
                return this;
            },
            setType: function (type) {
                this.actionDef = actionDefs[type];
                if (!this.actionData) this.actionData = {};
                this.actionData.type = type;
                //this.actionData.name = this.actionDef.name;
                // then get the new schema for the new action type and create some options for it
                var opt = this.actionData.options;
                this.actionData.options = {};
                // import schema into options, using old values if we have them, default if not.
                utils.each(this.actionDef.schema, function (item, index, key) {
                    scope.actionData.options[key] = opt[key] || item.default;
                });
                return this;
            },
            clear: function () {
                if (this.editor) this.editor.clear();
                this.actionData = null;
                this.editingAction = null;
                return this;
            },
            renderPreview: function () {
                // re-render the gradient view
                this.actionDef.render(views.actionList.defs, this.svgShape, this.actionData.options);
            },
            render: function () {
                var type = this.actionData.type;
                utils.ui.setSelectedValue(this.actionSelect, type);
                this.actionDef = actionDefs[type];
                this.renderPreview();
                // then re-run the editor stuff
                this.editor = editor.edit(this.actionDef.schema, this.actionData.options, editContainer);
                this.show();

                utils.ui.align.center(views.actionList.svg, el);
                return this;
            },
            show: function () {
                el.style.display = 'block';
                return this;
            },
            hide: function () {
                if (this.editor) this.editor.hide();
                el.style.display = 'none';
                return this;
            }
        };

        utils.each(actionDefs, function (item, index, key) {
            scope.actionOptions[key] = item.name;
        });
        scope.actionSelect = utils.ui.create.select(scope.actionOptions);

        // add svg to editor for rendering action
        el.appendChild(scope.svgAction);
        //scope.svgAction.appendChild(scope.svgDefs);
        scope.svgAction.appendChild(scope.svgShape);
        el.appendChild(scope.actionSelect);
        var editContainer = el.appendChild(document.createElement('div'));

        utils.ui.bind(scope.actionSelect, 'change', function (e) {
            // on change of actionselect, we need to re-run alllll of this over again.
            // first run editor.clear;
            scope.editor.clear();
            // set actionData.type to be the selected action type
            scope.setType(scope.actionSelect.options[scope.actionSelect.selectedIndex].value);
            scope.render();
        });

        scope.hide();

        // add save button
        el.appendChild(utils.ui.create.input({
            type: 'button',
            value: 'Save',
            events: {
                click: function () {
                    // TODO: If this is an existing action we should then overwrite it
                    // TODO: To preserve the existing action we should only operate on a fake action until save
                    // add a new action to actions
                    actionController.actions.saveAction(scope.actionData);
                    // TODO: then close the editor
                    scope.hide();
                }
            }
        }));
        el.appendChild(utils.ui.create.input({
            type: 'button',
            value: 'Cancel',
            events: {
                click: function () {
                    // Close the editor
                    scope.cancel();
                }
            }
        }));

        // TODO: should create this, or lazy load, but don't attemt to load it like this
        return scope;
    })();
})(
    cosine.xzerox,
    cosinedesign.utility,
    cosinedesign.svg,
    cosinedesign.editor,
    cosine.xzerox.services,
    cosine.treeOfLife.actions,
    cosine.xzerox.config
);
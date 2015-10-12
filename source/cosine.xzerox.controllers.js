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
    var i,
        buttonSize = config.grid.size + (config.grid.border * 2),
        offset = config.grid.border;

    patternListController = {
        actions: {
            list: function () {},
            save: function () {},
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
            var bar = views.bar;
            bar.bar = selectedBar;
            bar.clear();
            bar.render();
            // TODO: set the active sequence too
            // TODO: we also have to re-render the buttonBar...
            //
            //views.buttonBar.clear();
            //views.buttonBar.activeSequence = this.activeSequence;
            //views.buttonBar.position(bar);
            //views.buttonBar.render();
            setActiveSequence(getViewForSequence(0));
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

    // this could just be a 'addSequenceClick' event
    views.buttonBar.addSequenceClick = function () {
        var b = views.bar,
            s = [
                {step: 0},
                {step: 4},
                {step: 8},
                {step: 12}
            ];

        patternController.activePattern.bars[0].sequences.push(s);
        // set this as selected sequence
        patternController.activeSequence = s;
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
        var b = views.bar,
            buttons = views.buttonBar;

        if (b.selectedSequenceView) {
            b.selectedSequenceView.select.button.style.fill = config.sequence.button.fill;
        }

        buttons.activeSequence = b.selectedSequence = view.sequence;
        buttons.update();
        b.selectedSequenceView = view;
        patternController.activeSequence = view.sequence;
        patternController.activeSequenceIndex = view.sequenceIndex;
        view.select.button.style.fill = config.sequence.selected.fill;

        // Remove Sequence
        if (!b.removeSequenceButton) {
            b.removeSequenceButton = svg.create.use(b.selectedSequenceView.svg, { id: 'removeItem'}, { x: b.selectedSequenceView.x + config.grid.border, y: b.selectedSequenceView.y + config.grid.border });
        }
        b.removeSequenceButton.y.baseVal.value = view.y + config.grid.border;
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
            var pattern = ''; //TODO: patternBank.get('default');

            if (!pattern) {
                // TODO: Create a service default method, that calls build, then save
                pattern = services.pattern.build({ name: "default" });
                services.pattern.save();

                this.activePattern = pattern;
            }

            this.activeSequence = this.activePattern.bars[0].sequences[0];
            this.activeSequenceIndex = 0;
            var startPosition = { x:0, y:0},
                barSelect = views.barSelect,
                bar = views.bar,
                menu = views.menuBar;

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
            menu.savePatternClick = patternListController.actions.save;
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
            // TODO: NO! ALL WRONG! CAN'T NAME THIS ACTIONS!
            this.actionPresets = [{
                name: 'Go Black',
                type: 'setColor',
                options: {
                    color: "#000000"
                }
            },
                {
                name: 'Morph Color',
                type: 'morphColor',
                options: {
                    color1:  "#FFFFFF",
                    color2: "#000000"
                }
            },{
                name: 'Morph Color',
                type: 'morphColor',
                options: {
                    color1:  "#FF0000",
                    color2: "#FF00FF"
                }
            },{
                name: 'Morph Color',
                type: 'morphColor',
                options: {
                    color1:  "#FF00FF",
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
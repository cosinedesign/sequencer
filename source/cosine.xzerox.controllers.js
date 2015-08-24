/**
 * Created by cosinezero on 8/23/2015.
 */
// Pattern controller    --------------------------------------------

(function (x0x, utils, svg, config) {
    var patternController,
        views = x0x.views;

    x0x.controllers = {};

    // TODO: Move these to inside the patternController
    var i,
        buttonSize = config.grid.size + (config.grid.border * 2),
        offset = config.grid.border;


    // events - buttonBar; buttonCreated
    views.buttonBar.on('buttonCreated', function (s, stepIndex) {
        utils.ui.addClick(s, function (button) {
            // get action at activeSequence step
            var actionIndex = -1,
                sequenceView;

            var action = utils.find(patternController.activeSequence, function (a, i) {
                actionIndex = i;
                return a.step == stepIndex;
            });

            sequenceView = views.bar.sequenceViews[patternController.activeSequenceIndex];

            // if step exists, then removeAction, else newAction
            if (action) {
                patternController.actions.removeAction(actionIndex);
                views.buttonBar.buttonOff(s, stepIndex);
            } else {
                patternController.actions.newAction(stepIndex);
                views.buttonBar.buttonOn(s, stepIndex);
            }

            // re-render the active sequence view
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
        view.on('actionViewCreated', patternController.onActionViewCreated);
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
    }

    function getViewForSequence(index) {
        return views.bar.sequenceViews[index];
    }

    // Pattern Controller       -------------------------------------------
    patternController = x0x.controllers.pattern = {
        activeAction: {"action":"morphColor","options":{"color":"#fafafa","endColor":"#ff00f0","type":["in","out"]}},
        activeSequence: null,
        activePattern: null,
        onActionViewCreated: function (action, shape) {
            // assign click handler
            utils.ui.addClick(shape, function () {
                // merge the action information from activeAction
                utils.merge(action, this.activeAction);
                // TODO: render action into shape
                alert('click');
            });
        },
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
                pattern = x0x.buildPattern();
                x0x.patternBank.set('default', pattern);
                this.activePattern = pattern;

            }

            this.activeSequence = this.activePattern.bars[0].sequences[0];
            this.activeSequenceIndex = 0;
            var startPosition = { x:0, y:0 };
            views.bar.bar = this.activePattern.bars[0];
            views.bar.position(startPosition);
            views.bar.init();
            views.bar.render();

            //newSequenceButton.render();
            startPosition.y += views.bar.y;
            views.buttonBar.activeSequence = this.activeSequence;
            views.buttonBar.position(startPosition);
            views.buttonBar.render();

            // Find the sequence view and make it active
            setActiveSequence(getViewForSequence(0));
        },
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
            newAction: function (stepId, options) {
                // Add action
                var a = { step: stepId };
                patternController.activeSequence.push(a);
                // TODO: re-set prior action's length
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
})(
    cosine.xzerox,
    cosinedesign.utility,
    cosinedesign.svg,
    cosine.xzerox.config
);
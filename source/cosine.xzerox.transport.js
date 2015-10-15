/**
 * Created by cosinezero on 10/12/2015.
 */
// TODO: add 'phase' to modify tempo offset
// TODO: add midi API access to local devices...

var cosine = cosine || {};
cosine.xzerox = cosine.xzerox || {};
var transport = cosine.xzerox.transport = (function (utils, svg, tempo) {
    var clock = new tempo.Clock(500),
        elements,
        initialized = false,
        trackers = {
            cur: tempo.tracker(120),
            avg: tempo.tracker(120),
            cum: tempo.tracker(120)
        },
        activeTracker = null,
        intervals = {},
        pulse = 50;

        //ms= {
        //    cur: 500,
        //    avg: 500,
        //    cum: 500
        //},
        //
        //bpms = {
        //    cur: 128,
        //    avg: 128,
        //    cum: 128
        //},



    function init() {
        elements = {
            transport: document.getElementById('TreeOfLifeTransport'),
            modifier: document.getElementById('tempoModifier'),
            tapTempo: document.getElementById('tapTempo'),
            tempoDisplay:  document.getElementById('tempoDisplay'),
            labels: {
                tapTempo: document.getElementById('labelTap'),
                cur: document.getElementById('labelCur'),
                avg: document.getElementById('labelAvg'),
                cum: document.getElementById('labelCum')
            }
        };

        utils.ui.addClick(document.getElementById('nudgeUp'), function () {
            if (activeTracker) {
                activeTracker.clock.nudgeUp();
                event.stopPropagation();
            }
        });
        utils.ui.addClick(document.getElementById('nudgeDown'), function () {
            if (activeTracker) {
                activeTracker.clock.nudgeDown();
                event.stopPropagation();
            }
        });
        utils.ui.addClick(document.getElementById('bpmUp'), function () {
            if (activeTracker) {
                activeTracker.bpmUp();
                showTempo();
                event.stopPropagation();
            }
        });
        utils.ui.addClick(document.getElementById('bpmDown'), function () {
            if (activeTracker) {
                activeTracker.bpmDown();
                showTempo();
                event.stopPropagation();
            }
        });

        utils.ui.addClick(document.getElementById('closeTransport'), transport.hide);

        if (exports.svg) {
            utils.ui.align.center(exports.svg, elements.transport);
        }
        elements.bpms = utils.pack(elements.tempoDisplay.getElementsByClassName('bpm'), 'id');

        utils.each(elements.bpms, function (bpmDisplay, index, key) {
            var label = elements.labels[key];
            utils.ui.align.center(bpmDisplay, label);
            var t = trackers[key];

            t.clock.onTick(function () {
                beat(bpmDisplay);
            });

            // make this the only active item
            // and restart the interval when we click it
            // On click of the specific BPM display in transport...
            utils.ui.addClick(bpmDisplay, function () {
                // set that tracker to active
                activeTracker = t;
                // starts / restarts the clock... keeps interval the same
                t.clock.start();
                // stop all other clocks
                utils.each(trackers, function (tracker, index, k) {
                    if (!(key==k)) tracker.clock.stop();
                });

                // position the tempoModifier with translate
                var width = 100;
                var x = (width * (index+1))-width;
                elements.modifier.setAttribute('transform', 'translate(' + x + ',0)');
            });
        });

        var label = elements.labels['tapTempo'];
        utils.ui.align.center(elements.tapTempo, label);

        elements.tapTempo.addEventListener('click', (function () {
            //var x = new Date();
            var tempo = 120,

                lastClickTime = Date.now(), //x.getTime(),
                barClicks = [],
                avgClicks = [];

            return function () {
                //var d = new Date();
                var t = Date.now(); ///.getTime();
                var curMs = t - lastClickTime,
                    avgMs, cumMs;
                trackers.cur.ms = curMs;
                trackers.cur.clock.start();
                lastClickTime = t;
                if (curMs) {
                    barClicks.push(curMs);
                    avgMs = utils.avg(barClicks);
                    trackers.avg.ms = avgMs;
                    trackers.avg.clock.start();
                    avgClicks.push(avgMs);
                    cumMs = utils.avg(avgClicks);
                    trackers.cum.ms = cumMs;
                    trackers.cum.clock.start();
                }

                // restrict our averages...
                if (barClicks.length > 4) barClicks.shift();
                if (avgClicks.length > 4) avgClicks.shift();

                //render();
                showTempo();
                event.stopPropagation();
            };
        })());
        initialized = true;
    }

    function show() {
        if (!initialized) init();
        //render();
        elements.transport.style.display = "block";
    }
    function hide() {
        utils.each(trackers, function (t) {
            t.clock.stop();
        });
        elements.transport.style.display = "none";
        //utils.each(intervals, function (item) {
        //    clearInterval(item);
        //});
    }

    // show a series of divs with current, avg, overall
    function showTempo() {
        utils.each(trackers, function (t, index, key) {
            elements.labels[key].innerText = t.bpm; //tempo.msToBPM(item);
        });
    }

    function render() {
        showTempo();
        //utils.blend(elements.bpms, ms, function (el, m, key) {
        //    elements.labels[key]
        //        .innerText = bpms[key] = tempo.msToBPM(m);
        //
        //    //clearInterval(intervals[key]);
        //    //el.style.fill = "#ffcc33";
        //    //setTimeout(function () {
        //    //    el.style.fill = "";
        //    //}, pulse);
        //    //intervals[key] = setInterval(function () {
        //    //    beat(el);
        //    //}, m);
        //});
    }

    //// targetBpm is just the key to the bpm indicator, it is NOT a bpm, reconsider this naming
    //function run(targetBpm, ms) {
    //    // TODO: if we're nudging we need to shorten the next interval by exports.nudge amount
    //    // do we set a timeout at currentMs (+/-) nudge, which then continues an interval? Yes.
    //    // TODO: if we're changing the interval entirely we need to change that too
    //    intervals[targetBpm] = setInterval(function () {
    //        if (doNudge || doBpm) {
    //            clearInterval(targetBpm);
    //            if (doNudge) {
    //                setTimeout(run(targetBpm, ms), doNudge);
    //            } else if (doBpm) {
    //
    //            }
    //        }
    //
    //
    //        beat(el);
    //    }, ms);
    //}

    // pulse the div at specified time
    function beat(el) {
        el.style.fill = "#ffcc33";
        setTimeout(function () {
            el.style.fill = "";
        }, pulse);
    }

    var exports = {
        show: show,
        hide: hide
    };
    return exports;
})(
    cosinedesign.utility,
    cosinedesign.svg,
    cosine.xzerox.tempo
);
/**
 * Created by cosinezero on 10/12/2015.
 */
// TODO: add 'nudge' and 'drag', to shorten/lengthen tempo slightly
// TODO: add 'phase' to modify tempo offset
// TODO: add midi API access to local devices...

// TODO: clicking on a bpm element makes it 'active'



var cosine = cosine || {};
cosine.xzerox = cosine.xzerox || {};
var transport = cosine.xzerox.transport = (function (utils, svg, tempo) {
    var elements,
        initialized = false,
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
        intervals = {},
        pulse = 50;

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

        utils.ui.addClick(document.getElementById('nudgeUp'), nudgeUp);
        utils.ui.addClick(document.getElementById('nudgeDown'), nudgeDown);
        utils.ui.addClick(document.getElementById('bpmUp'), bpmUp);
        utils.ui.addClick(document.getElementById('bpmDown'), bpmDown);

        if (exports.svg) {
            utils.ui.align.center(exports.svg, elements.transport);
        }
        elements.bpms = utils.pack(elements.tempoDisplay.getElementsByClassName('bpm'), 'id');

        utils.each(elements.bpms, function (bpmDisplay, index, key) {
            var label = elements.labels[key];
            utils.ui.align.center(bpmDisplay, label);

            // TODO: make this the only active item
            // TODO: and restart the interval when we click it
            utils.ui.addClick(bpmDisplay, function () {
                exports.activeBpm = key;
                // first, clear this interval
                clearInterval(intervals[key]);
                // pulse this element to the beat
                intervals[key] = setInterval(function () {
                    beat(bpmDisplay);
                }, ms[key]);

                // fire one off now, do it nowwww
                beat(bpmDisplay);

                // stop all others
                utils.each(intervals, function (interval, index, k) {
                    if (!(key==k)) clearInterval(interval);
                });

                // TODO: position the tempoModifier with translate
                //svg.align.center(bpmDisplay, elements.modifier);
                var width = 100;
                var x = (width * (index+1))-width;
                elements.modifier.setAttribute('transform', 'translate(' + x + ',0)');

            });

        });

        var label = elements.labels['tapTempo'];
        utils.ui.align.center(elements.tapTempo, label);

        elements.tapTempo.addEventListener('click', (function () {
            var x = new Date();
            var tempo = 120,

                lastClickTime = x.getTime(),
                barClicks = [],
                avgClicks = [];

            return function () {
                var d = new Date();
                var t = d.getTime();
                ms.cur = t - lastClickTime;
                lastClickTime = t;
                if (ms.cur) {
                    barClicks.push(ms.cur);
                    ms.avg = utils.avg(barClicks);
                    avgClicks.push(ms.avg);
                    ms.cum = utils.avg(avgClicks);
                }
                if (barClicks.length > 4) barClicks.shift();
                if (avgClicks.length > 4) avgClicks.shift();

                utils.each(ms, function (item, key) {
                    clearInterval(intervals[key]);
                });

                render();
                //showTempo();
                event.stopPropagation();
            };
        })());
        initialized = true;
    }

    var bpmIncrement = 5, nudge = 10;
    function nudgeUp() {}
    function nudgeDown() {}
    function bpmUp() {}
    function bpmDown() {}

    function show() {
        if (!initialized) init();
        //render();
    }
    function hide() {
        utils.each(intervals, function (item) {
            clearInterval(item);
        });
    }

    // show a series of divs with current, avg, overall
    function showTempo() {
        utils.each(ms, function (item, index, key) {
            var label = elements.labels[key];
            label.innerText = tempo.msToBPM(item);
        });
    }

    function render() {
        utils.blend(elements.bpms, ms, function (el, m, key) {
            elements.labels[key]
                .innerText = bpms[key] = tempo.msToBPM(m);
            clearInterval(intervals[key]);
            el.style.fill = "#ffcc33";
            setTimeout(function () {
                el.style.fill = "";
            }, pulse);
            intervals[key] = setInterval(function () {
                beat(el);
            }, m);
        });
    }

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
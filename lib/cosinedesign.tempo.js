/**
 * Created by Jim Ankrom on 7/18/2015.
 */

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
/**
 * Created by Jim Ankrom on 7/18/2015.
 */

// TODO: wire up events by passing them in to IIFE

var cosine = cosine || {};
cosine.xzerox = cosine.xzerox || {};
cosine.xzerox.tempo = (function (utils) {
    return {
        msToBPM: utils.memoize(function (ms) {
            if (ms) {
                var t = 60000/ms;
                return Math.round(t*100)/100;
            } else {
                return ms;
            }
        }),
        tracker: function (bpm) {
            var self = this,
                t = {};

            // TODO create an ms property that when you set it, it updates the clock
            var _ms = 60000/bpm;
            var clock = new this.Clock(_ms);
            utils.extensions.property('ms', {
                get: function () {
                    return _ms;
                },
                set: function (value) {
                    // TODO reset clock
                    // DO NOT assign this to the t.bpm, you will get stack overflows
                    bpm = self.msToBPM(value);
                    _ms = value;
                    t.clock.duration(_ms);
                }
            }, null, t);
            utils.extensions.property('bpm', {
                get: function () {
                    return bpm;
                },
                set: function (value) {
                    bpm = value;
                    this.ms = 60000/bpm;
                }
            }, null, t);

            t.clock = clock;
            return t;
        },
        // a hopefully very accurate (low drift) clock
        // TODO: grant this the ability to shift multiple offsets to sync a few devices with varying latency
        Clock: function (tickDuration) {
            var // onTick callback
                _tick,
                currentTime,
                nextTime, // prediction when the next time should be
                offset,
                timeout;

            this.nudge = function (offset) {};

            this.stop = function () {
                clearTimeout(timeout);
            };

            this.start = function () {
                if (timeout) clearTimeout(timeout);
                currentTime = Date.now();
                nextTime = currentTime + tickDuration;
                timeout = setTimeout(tick, tickDuration);
                if (_tick) _tick();
            };

            this.duration = function (duration) {
                // try to set this RIGHT NOW
                if (timeout) clearTimeout(timeout);
                tickDuration = duration;
                nextTime = currentTime + duration;
                // find out how far off we are from new interval
                offset = (currentTime - nextTime);
                // maybe tick right now if we're really close
                if (offset < 10) {
                    if (_tick) _tick();
                    // update next time to be the really next time
                    nextTime = nextTime + tickDuration;
                } else {
                    // fire next shot!
                    timeout = setTimeout(tick, tickDuration-offset);
                }
            };

            this.onTick = function (callback) {
                _tick = callback;
            };

            // the re-entrant active clock
            function tick () {
                // To assess accuracy, we should watch currentTime...
                currentTime = Date.now();
                // find out how far off we are from expected interval
                offset = (currentTime - nextTime);
                // fire next shot!
                timeout = setTimeout(tick, tickDuration-offset);
                // update prediction
                nextTime = nextTime + tickDuration;
                // execute this tick
                if (_tick) _tick();
            }

            //this.start();
        }
    }
})(
    cosinedesign.utility
);
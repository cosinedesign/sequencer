/**
 * Created by Jim Ankrom on 7/18/2015.
 */

// TODO: wire up events by passing them in to IIFE

var cosine = cosine || {};
cosine.xzerox = cosine.xzerox || {};
var tempo = cosine.xzerox.tempo = (function (utils) {
    return {
        msToBPM: utils.memoize(function (ms) {
            if (ms) {
                var t = 60000/ms;
                return Math.round(t*100)/100;
            } else {
                return ms;
            }
        })
    }
})(
    cosinedesign.utility
);
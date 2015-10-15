/**
 * Created by cosinezero on 9/30/2015.
 */
var cosinedesign = cosinedesign || {};

// TODO: create number type that can convert between px, em, etc.

cosinedesign.graphics = (function (utils) {
    return {
        color: {
            decToHex: utils.memoize(function (d) {
                var h = Math.floor((+d)).toString(16);
                return h.length === 1 ? '0' + h : h;
            }),
            RGBtoHEX: function (rgb) {
                // CANNOT memoize this, rgb input is an object
                return '#' + this.decToHex(rgb.r) + this.decToHex(rgb.g) + this.decToHex(rgb.b);
            },
            HEXtoRGB: utils.memoize(function (hex) {
                // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
                var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
                hex = hex.replace(shorthandRegex, function (m, r, g, b) {
                    return r + r + g + g + b + b;
                });

                var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                return result ? {
                    r: parseInt(result[1], 16),
                    g: parseInt(result[2], 16),
                    b: parseInt(result[3], 16)
                } : null;
            }),
            /* accepts parameters
             * h  Object = {h:x, s:y, v:z}
             * OR
             * h, s, v
             */
            HSVtoRGB: function (h, s, v) {
                if (arguments.length === 1) {
                    s = h.s, v = h.v, h = h.h;
                }
                var hi = Math.floor(h / 60) % 6;

                var f = h / 60 - Math.floor(h / 60);
                var p = v * (1.0 - s);
                var q = v * (1.0 - (f * s));
                var t = v * (1.0 - ((1.0 - f) * s));
                var c = [
                    [v, t, p],
                    [q, v, p],
                    [p, v, t],
                    [p, q, v],
                    [t, p, v],
                    [v, p, q]
                ][hi];

                return {
                    h: h,
                    s: s,
                    v: v,
                    r: c[0] * 255,
                    g: c[1] * 255,
                    b: c[2] * 255
                };
            },
            // TODO: THIS CURRENTLY DOES NOT WORK RIGHT
            HSVtoRGB2: function (h, s, v) {
                var r, g, b, i, f, p, q, t;
                if (arguments.length === 1) {
                    s = h.s, v = h.v, h = h.h;
                }
                i = Math.floor(h * 6);
                f = h * 6 - i;
                p = v * (1 - s);
                q = v * (1 - f * s);
                t = v * (1 - (1 - f) * s);
                switch (i % 6) {
                    case 0:
                        r = v, g = t, b = p;
                        break;
                    case 1:
                        r = q, g = v, b = p;
                        break;
                    case 2:
                        r = p, g = v, b = t;
                        break;
                    case 3:
                        r = p, g = q, b = v;
                        break;
                    case 4:
                        r = t, g = p, b = v;
                        break;
                    case 5:
                        r = v, g = p, b = q;
                        break;
                }
                return {
                    r: Math.round(r * 255),
                    g: Math.round(g * 255),
                    b: Math.round(b * 255)
                };
            },
            /* accepts parameters
             * r  Object = {r:x, g:y, b:z}
             * OR
             * r, g, b
             */
            RGBtoHSV: function (r, g, b) {
                if (arguments.length === 1) {
                    g = r.g, b = r.b, r = r.r;
                }
                var max = Math.max(r, g, b), min = Math.min(r, g, b),
                    d = max - min,
                    h,
                    s = (max === 0 ? 0 : d / max),
                    v = max / 255;

                switch (max) {
                    case min:
                        h = 0;
                        break;
                    case r:
                        h = (g - b) + d * (g < b ? 6 : 0);
                        h /= 6 * d;
                        break;
                    case g:
                        h = (b - r) + d * 2;
                        h /= 6 * d;
                        break;
                    case b:
                        h = (r - g) + d * 4;
                        h /= 6 * d;
                        break;
                }

                return {
                    r: r,
                    g: g,
                    b: b,
                    h: Math.round(h * 360),
                    s: Math.round(s * 100),
                    v: Math.round(v * 100)
                };
            }
        }
    };
})(
    cosinedesign.utility
);
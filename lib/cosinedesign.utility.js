/**
 * Created by Jim Ankrom on 7/18/2015.
 */

var cosinedesign = cosinedesign || {};
cosinedesign.utility = {

    avg: function (values) {
        var sum = 0, length = values.length, i;
        for (i = 0; i < length; i++) {
            sum += values[i];
        }
        return sum / length;
    },
    // blend values of one object with values of another with callback
    blend: function (a, b, callback) {
        this.each(a, function (item, key) {
            callback(item, b[key], key);
        });
    },
    compare: function (a, b) {
        if (a < b) {
            return -1;
        }
        if (a > b) {
            return 1;
        }
        // a must be equal to b
        return 0;
    },
    // if short is true, and callback returns something, stop the loop.
    // returns first result if short is true, all results if short is false.
    each: function (items, callback, short) {
        var i, keys, key, l, item, map = [];

        if (!items) return;

        if (Array.isArray(items)) {
            l = items.length;
        } else {
            keys = Object.keys(items);
            l = keys.length;
        }

        for (i = 0; i < l; i++) {
            if (keys) {
                key = keys[i];
                item = callback(items[key], i, key);
            } else {
                item = callback(items[i], i);
            }

            if (item) {
                if (short) return item;
                map.push(item);
            }
        }
        if (map.length) return map;
    },
    find: function (items, filter, findAll) {
        return this.each(items, function (item, index) {
            if (filter(item, index)) return item;
        }, !findAll);
    },
    // Load source object values into destination object
    load: function (dest, src) {
        var item;
        for (item in src) {
            if (Object.prototype.hasOwnProperty.call(dest, item)) {
                dest[item] = src[item];
            }
        }
        return dest;
    },
    // Merge source object into destination object
    merge: function (dest, src) {
        var item;
        for (item in src) {
            if (!Object.prototype.hasOwnProperty.call(dest, item)) {
                dest[item] = src[item];
            }
        }
        return dest;
    },
    // pack array of objects into associative array based on propName
// - for an array of objects [{id: 'a', ...}, {id: 'b', ...}]
//     we should get an object {a: {id: 'a', ...}, b: {id: 'b', ...}}
    pack: function (els, prop) {
        var out = {};
        each(els, function (item) {
            var key = item[prop];
            if (key) out[key] = item;
        });
        return out;
    },
    sort: function (a, b, prop) {
        if (a[prop] < b[prop]) {
            return -1;
        }
        if (a[prop] > b[prop]) {
            return 1;
        }
        // a must be equal to b
        return 0;
    },
    // ------------------------------------------------------------------------------------------------
    // Cache namespace
    // ------------------------------------------------------------------------------------------------
    cache: {
        // Factory method that returns an object with access to localStorage for your value.
        storage: function (key) {
            return {
                get: function (defaultValue) {
                    var v = localStorage[key];
                    if (v) {
                        v = JSON.parse(v);
                    } else {
                        v = defaultValue;
                    }
                    return v;
                },
                set: function (value) {
                    localStorage[key] = JSON.stringify(value);
                }
            }
        }
    },
    collections: {
        list: function (seed) {
            var list;
            if (seed) list = seed;
            return {
                add: function (item, key) {
                    if (key) {
                        list[key] = item;
                    } else {
                        if (list && list.push) list.push(item);
                    }
                    return this;
                },
                addItems: function (items) {
                    cosinedesign.utility.each(items, function (item, index, key) {
                        if (key) {
                            if (!list) list = {};
                            list[key] = item;
                        } else {
                            if (!list) items = [];
                            list.push(item);
                        }
                    });
                    return this;
                },
                each: function (callback) {
                    return cosinedesign.utility.each(list, callback);
                }
            };
        }
    },
    decorators: {
        // Make target into an evented object
        events: function (target) {
            var targetEvents,
                utility = cosinedesign.utility;

            // add event handler for event
            target.on = function (eventName, handler) {
                if (!targetEvents) targetEvents = {};
                if (!targetEvents[eventName]) {
                    targetEvents[eventName] = utility.multicast(handler);
                } else {
                    targetEvents[eventName].add(handler);
                }
                return this;
            };

            // remove specific event
            target.off = function (eventName, callback) {
                doIfExists(eventName, function (handlers) {
                    handlers.remove(callback);
                });
            };

            // remove all events
            target.allOff = function () {
                targetEvents = {};
            };

            // enable the event
            target.enableEvent = function (eventName) {
                doIfExists(eventName, function (handlers) {
                    handlers.enable();
                });
            }

            // disable the event
            target.disableEvent = function (eventName) {
                doIfExists(eventName, function (handlers) {
                    handlers.disable();
                });
            }

            // trigger the event
            target.trigger = function (eventName) {
                var myEvent = eventName;
                [].splice.call(arguments, 0, 1); // slick hack to shift arguments "array" that isn't an array
                var thatArgs = arguments;
                doIfExists(myEvent, function (handlers) {
                    handlers.apply(target, thatArgs);
                });
                return this;
            };


            function doIfExists(eventName, action) {
                if (targetEvents) {
                    var handlers = targetEvents[eventName];
                    if (handlers) {
                        action(handlers);
                    }
                }
            }

            return target;
        }
    },
    extensions: {
        // add property to target object. Adopting a builder approach with options rather than multiple methods.
        // Options:
        // - lazyLoader
        // - get - getter function
        // - set - setter function
        // Config is the property definition object as described in Object.defineProperty documentation
        property: function (name, options, config, target) {
            // use call/apply's ability to set 'this' to avoid passing target
            // Hmm, is this dangerous because it might pollute extensions if target is not passed and call/apply is not used?
            if (!target) { target = this; }
            // ensure options
            options = options || {};
            var _value;
            // LazyLoader wrapper to support options get and set, and backing field
            function wrapLazyLoader(loader) {
                return function () {
                    if (options.get) {
                        _value = options.get.call(target);
                    }

                    if (!_value && loader) {
                        var result = loader(name);

                        // ensure set is called with target as this
                        if (options.set) {
                            options.set.call(target, result);
                        }

                        // set our backing field regardless
                        _value = result;
                    }
                    return _value;
                }
            }

            var propDef = config || {
                    enumerable: true,
                    configurable: true
                };

            if (options.lazyLoader) { propDef.get = wrapLazyLoader(options.lazyLoader); }
            else if (options.get) { propDef.get = options.get; }

            if (options.set) {
                propDef.set = options.set;
                //propDef.writable = true;
            }

            Object.defineProperty(target, name, propDef);
        },
        // Add a lazy-loaded property
        lazyProperty: function (propertyName, lazyLoader, setter, target) {
            if (!target) { target = this; }

            var options = {};
            if (lazyLoader) options.lazyLoader = lazyLoader;
            if (setter) options.set = setter;

            utils.extensions.property(propertyName, options, null, target);
        },
        // Add a property that caches jQuery objects for a given selector
        cachedJQueryProperty: function (propertyName, selector, readOnly, target) {
            if (!target) { target = this; }
            utils.extensions.lazyProperty(propertyName, function () {
                return $(selector);
            }, false, target);
        },

    },
    ui: {
        addClick: function (el, handler) {
            if (el && el.addEventListener) el.addEventListener('click', handler);
        },
        // assign an onload handler
        onLoad: function (callback) {
            if (document.readyState === 'complete') {
                callback();
            } else {
                window.addEventListener("load", callback);
            }
        },
        // Delete all child elements
        deleteChildren: function (e) {
            while (e.firstChild) {
                e.removeChild(e.firstChild);
            }
        },
        create: {
            select: function (options) {
                var s = document.createElement('select');

                each(options, function (item, i) {
                    s.appendChild(this.option(i, item));
                });
                return s;
            },
            option: function (value, text) {
                var o = document.createElement('option');
                o.value = value;
                o.text = text;
                return o;
            }
        }
    },
    // Multicast delegate inspired by .NET delegate
    multicast: function (callback) {
        var multicast = [], disabled;

        if (callback) multicast.push(callback);

        function invoke () {
            var i, len = multicast.length;
            if (!disabled) {
                for (i = 0; i < len; i++) {
                    multicast[i].apply(this, arguments);
                }
            }
        }

        // Add callback to the multicast
        function add (callback) {
            multicast.push(callback);
            return callback;
        }

        // Remove callback from the multicast
        function remove (callback) {
            var i, len = multicast.length;

            if (callback && len > 1) {
                for (i = 0; i < len; i++) {
                    if (multicast[i] === callback) {
                        multicast.splice(i, 1);
                        return;
                    }
                }
            } else {
                multicast = [];
            }
        }

        // Expose add method
        invoke.add = add;
        invoke.remove = remove;
        // Enable the multicast
        invoke.enable = function () {
            disabled = false;
        };
        // Disable the multicast
        invoke.disable = function () {
            disabled = true;
        };

        return invoke;
    }
};








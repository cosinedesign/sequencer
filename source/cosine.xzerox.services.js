/**
 * Created by Jim Ankrom on 8/30/2015.
 */

var cosine = cosine || {};
cosine.xzerox = cosine.xzerox || {};

cosine.xzerox.services = (function (utils) {

    // generic service, using an associative array (hash) for the container
    function generic (storeName) {
        var store = utils.cache.storage(storeName),
            local;

        // ensure storage exists, if not create
        function ensured () {
            return local || (local = store.get({}));
        }

        var service = {
            load: function (name) {
                return ensured()[name];
            },
            build: function () {
                // really should be overridden
                return {};
            },
            default: function (options) {
                if (this.build) {
                    var newItem = this.build(options);
                    this.save(options.name, newItem);
                }
            },
            save: function (name, model) {
                ensured()[name] = model;
                store.set(ensured());
                this.trigger('save');
            }
        };

        utils.decorators.events(service);

        return service;
    }

    var pattern = generic('xzerox.pattern');
    // Factories
    pattern.buildSequence = function () {
        return [
            {step: 0},
            {step: 4},
            {step: 8},
            {step: 12}
        ];
    };
    pattern.buildBar = function (options) {
        return {
            sequences: [
                // TODO: uh, wtf is options.sequence doing here anymore?
                this.buildSequence(options.sequence)//,
                //this.buildSequence(options.sequence),
                //this.buildSequence(options.sequence),
                //this.buildSequence(options.sequence)
            ]
        };
    };
    pattern.build = function (options) {
        options = options ||
            {
                sequence: {
                    steps: [4, 8, 12, 16]
                }
            };

        options.name = options.name || 'New Pattern';

        return {
            name: options.name,
            bars: [
                this.buildBar(options) //,
                //this.buildBar(options)
            ]
        };
    };

    var actionService = generic('xzerox.actions');

    return {
        pattern: pattern,
        actions: actionService
    }
})(
    cosinedesign.utility
);


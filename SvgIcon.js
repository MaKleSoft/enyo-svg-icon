(function() {
    var registered = {},
        loading = {},
        loaded = {};

    // Loads the svg source for a given file
    function loadSrc(src) {
        var req = new enyo.Ajax({url: src, handleAs: "xml", cacheBust: false});

        loading[src] = true;
        req.response(function(xhr, res) {
            srcLoaded(src, res);
        });
        req.go();
    }

    // Caches the loaded data and updates all registered elements with this source
    function srcLoaded(src, data) {
        loaded[src] = data;
        loading[src] = false;
        var ctrls = registered[src] || {};

        for (var id in ctrls) {
            ctrls[id].sourceLoaded();
        } 
    }

    // Registeres an element so it can be updated when its source data is loaded
    // Loads the data if it hasn't been loaded yet
    function register(ctrl) {
        var src = ctrl.get("src"),
            id = ctrl.get("id");

        registered[src] = registered[src] || {};
        registered[src][id] = ctrl;

        if (!loaded[src] && !loading[src]) {
            loadSrc(src);
        }
    }

    // Unregisteres an element
    function unregister(ctrl) {
        if (registered[ctrl.src]) {
            delete registered[ctrl.src][ctrl.id];
        }
    }

    enyo.kind({
        name: "SvgIcon",
        kind: "Control",
        tag: "svg",
        // We'll adopt these from the source svg if they are not explicity set on the control
        svgAttributes: ["version", "xmlns", "xmlns:xlink", "width", "height", "viewBox"],
        published: {
            // svg file to use as a souce for this element
            src: ""
        },
        create: enyo.inherit(function(sup) {
            return function() {
                sup.apply(this, arguments);
                // Register this element so it can be updated when its source has been loaded
                register(this);
                this.extractSourceAttributes();
            };
        }),
        destroy: enyo.inherit(function (sup) {
            return function() {
                unregister(this);
                sup.apply(this, arguments);
            };
        }),
        //* Applies the attributes from the source svg to this control
        extractSourceAttributes: function() {
            var src = loaded[this.src];
            if (src) {
                var svg = src.querySelector("svg"),
                    attrs = this.attributes;
                this.svgAttributes.forEach(function(attr) {
                    attrs[attr] = attrs[attr] || svg.getAttribute(attr);
                });
            }
        },
        sourceLoaded: function(doc) {
            this.extractSourceAttributes();
            this.render();
        },
        generateInnerHtml: function() {
            var doc = loaded[this.src],
                svg = doc && doc.querySelector("svg"),
                html = svg && svg.innerHTML || "";

            return html;
        }
    });
})();

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
    function register(src, ctrl) {
        registered[src] = registered[src] || {};
        registered[src][ctrl.get("id")] = ctrl;

        if (!loaded[src] && !loading[src]) {
            loadSrc(src);
        }
    }

    // Unregisteres an element
    function unregister(src, ctrl) {
        if (registered[src]) {
            delete registered[src][ctrl.get("id")];
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
        destroy: enyo.inherit(function (sup) {
            return function() {
                unregister(this.src, this);
                sup.apply(this, arguments);
            };
        }),
        srcChanged: function(oldSrc) {
            unregister(oldSrc, this);
            if (this.src) {
                // Register this element so it can be updated when its source has been loaded
                register(this.src, this);
                this.extractSourceAttributes();
                this.render();
            }
        },
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

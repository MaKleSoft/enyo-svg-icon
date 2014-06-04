(function() {
    var registered = {},
        loading = {},
        loaded = {};

    function loadSrc(src) {
        var req = new enyo.Ajax({url: src, handleAs: "xml", cacheBust: false});

        loading[src] = true;
        req.response(function(xhr, res) {
            srcLoaded(src, res);
        });
        req.go();
    }

    function srcLoaded(src, data) {
        loaded[src] = data;
        loading[src] = false;
        var ctrls = registered[src] || {};

        for (var id in ctrls) {
            ctrls[id].sourceLoaded();
        } 
    }

    function register(ctrl) {
        var src = ctrl.get("src"),
            id = ctrl.get("id");

        registered[src] = registered[src] || {};
        registered[src][id] = ctrl;

        if (!loaded[src] && !loading[src]) {
            loadSrc(src);
        }
    }

    function unregister(ctrl) {
        if (registered[ctrl.src]) {
            delete registered[ctrl.src][ctrl.id];
        }
    }

    enyo.kind({
        name: "SvgIcon",
        kind: "Control",
        tag: "svg",
        svgAttributes: ["version", "xmlns", "xmlns:xlink", "width", "height", "viewBox"],
        published: {
            src: ""
        },
        create: enyo.inherit(function(sup) {
            return function() {
                sup.apply(this, arguments);
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

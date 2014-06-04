(function() {
    var loaded = {};

    function loadSvg(file, success, fail) {
        var pat = /<svg.+?>([\w\W]*)<\/svg>/i,
            req = new enyo.Ajax({url: file});

        req.response(function(xhr, res) {
            var match = res.match(pat),
                svgData = match[0];

            loaded[file] = svgData;
            success(svgData);
        });
        req.go();
    }

    enyo.kind({
        name: "SvgIcon",
        kind: "Control",
        tag: "svg",
        published: {
            src: ""
        },
        generateHtml: function() {
            var html = loaded[this.src];

            if (!html) {
                loadSvg(this.src, this.parent.render.bind(this.parent));
                html = "<svg></svg>";
            }

            return html;
        }
    });
})();

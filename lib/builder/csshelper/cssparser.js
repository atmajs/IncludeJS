include.js({
    framework: 'net/uri'
}).done(function(w, $) {

    w.CssParser = {
        parse: function(baseuri, uri, content) {

            var regexp = new RegExp(/url[\s]*\(('|")?([^)'"]+)('|")?\)/gi);
            var imgbin = [];
            var match = regexp.exec(content);

            while (match) {
                if (!match[2]) {
                    console.error('NOT mATCHED', match);
                }
                console.log('match', match[2]);

                var imguri = new net.URI(match[2]);

                window.uri = imguri;

                imgbin.push({
                    mimeType: 'image/png',
                    href: match[2],
                    uri: imguri.isRelative() ? uri.combine(imguri) : imguri,
                    baseuri: uri
                });

                match = regexp.exec(content);
            }

            return imgbin;
        },
        replace: function(source, original, rewrite) {
            var start = 0,
                found = -1;
            while (~ (found = source.indexOf(original, found + 1))) {
                var before = source[found - 1];
                if (/[\s"'\(]/i.test(before) == false) continue;
                source = source.substring(0, found) + rewrite + source.substring(found + original.length);
            }
            return source;
        }
    }


}.bind(null, window, Zepto));
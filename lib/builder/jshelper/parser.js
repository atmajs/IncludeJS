include.js({
    framework: 'arr',
    lib: 'class'
}).done(function() {

    var w = window,
        regexp = {
            '\n\r': /[\n\r]/g
        },
        helper = {
            isInComment: function(S) {
                var islinecomment;
                for (var i = S.index - 1; i > 1; i--) {
                    var c = S.text[i];
                    if (islinecomment == null) {
                        if (c == '/' && S.text[i - 1] == '/') return true;
                        if (c == '\r' || c == '\n') islinecomment = false;
                    }
                    if (islinecomment == false) return false;
                }
                return false;
            }
        };


    var TextParser = Class({
        Construct: function(text) {
            this.text = text;
            this.index = 0;
            this.length = text.length;
            return this;
        },
        next: function() {
            this.index++;
            return this;
        },
        skipWhitespace: function() {
            for (; this.index < this.length; this.index++) {
                var code = this.text.charCodeAt(this.index);
                if (code !== 32 /*' '*/ && code !== 10 && code !== 13 && code !== 9) return this;
            }

            return this;
        },
        skipToChar: function(c) {
            var index = this.text.indexOf(c, this.index);
            if (index > -1) {
                this.index = index;
                if (this.text.charCodeAt(index - 1) !== 92 /*'\\'*/ ) {
                    return this;
                }
                this.next().skipToChar(c);
            }
            return this;

        },
        skipToAny: function(chars) {
            var r = regexp[chars];
            if (r == null) {
                console.error('Unknown regexp %s: Create', chars);
                r = (regexp[chars] = new RegExp('[' + chars + ']', 'g'));
            }

            r.lastIndex = this.index;
            var result = r.exec(this.text);
            if (result != null) {
                this.index = result.index;
            }
            return this;
        },
        skipTo: function(regexp) {
            regexp.lastIndex = this.index;
            var result = regexp.exec(this.text);
            if (result != null) {
                this.index = result.index;
            } else {
                this.index = this.length;
            }
            return this;
        },
        sliceToChar: function(c) {
            var start = this.index,
                isEscaped, index;

            while ((index = this.text.indexOf(c, this.index)) > -1) {
                this.index = index;
                if (this.text.charCodeAt(index - 1) !== 92 /*'\\'*/ ) {
                    break;
                }
                isEscaped = true;
                this.index++;
            }

            var value = this.text.substring(start, this.index);
            return isEscaped ? value.replace(regexp.escapedChar[c], c) : value;

            //-return this.skipToChar(c).template.substring(start, this.index);
        },
        sliceToAny: function(chars) {
            var start = this.index;
            return this.skipToAny(chars).text.substring(start, this.index);
        },
        sliceTo: function(regexp) {
            var start = this.index;
            return this.skipTo(regexp).text.substring(start, this.index);
        },
        eof: function() {
            return this.index > this.length - 1;
        },
        Char: function() {
            return this.text[this.index];
        }

    });


    var fns = {
        cfg: 1,
        from: 1,
        js: 1,
        load: 1,
        css: 1,
        lazy: 1
    }

    var go = {
        nameEnd: function(S) {
            S.skipTo(/[^\w]/g);
            return S.index;
        },
        commentEnd: function(S) {
            switch (S.next().Char()) {
            case '*':
                S.skipTo(/(\*\/)/g);
                S.index += 1;
                break;
            case '/':
                S.skipToAny('\n\r');
                break;
            default:
                return;
            }
        },
        blockEnd: function(S) {
            var start = S.Char(),
                counter = 1;

            var end = {
                '(': ')',
                '{': '}'
            }[start];

            if (end == null) throw new Error('Unknown Block Char %s at %d', start, S.index);

            S.next();
            for (; S.index < S.length; S.index++) {
                var c = S.Char();
                switch (c) {
                case '/':
                    go.commentEnd(S);
                    continue;
                case "'":
                case '"':
                    S.next().skipToChar(c);
                    continue;
                case end:
                    if (--counter == 0) return;
                    continue;
                case start:
                    ++counter;
                    continue;
                }
            }
        }
    }

    var Parser = {
        include: function(S, stream) {
            if (stream == null) stream = [];


            var buffer = [];
            buffer.push('include');
            for (; S.index < S.length; S.index++) {
                S.skipWhitespace();

                var _goout = false;
                switch (S.Char()) {
                case '/':
                    go.commentEnd(S);
                    break;
                case '.':
                    S.next().skipWhitespace();

                    var fnName = S.sliceTo(/[^\w]/g);

                    S.skipWhitespace();

                    if (S.Char() != '(') {
                        //throw new Error('ParseError at ' + S.index+  '. "(" expected, but ' + S.Char() + ' seen');
                        _goout = true;
                        break;
                    }

                    var start = S.index,
                        args;
                    go.blockEnd(S);

                    if (start + 1 == S.index) args = '';
                    else args = S.text.substring(start + 1, S.index);


                    //-console.log('args',fnName, args, S.text[S.index + 1]);
                    if (fns[fnName] != null) {

                        buffer.push('.');
                        buffer.push(fnName);
                        buffer.push('(');
                        buffer.push(args);
                        buffer.push(')');

                    }

                    break;
                case ';':
                    _goout = true;
                    break;
                default:
                    if (/[\w]/.test(S.Char())) {
                        --S.index;
                        _goout = true;
                    }
                    break;
                }

                if (_goout) break;
            }

            if (buffer.length > 1) {
                var args = [stream.length - 1, 0]
                Array.prototype.splice.apply(stream, args.concat(buffer));
            }

            return stream;
        }
    };

    window.Parser = Parser;

    w.JsParser = {
        parse: function(code) {
            var regexp = new RegExp(/(^include)|(([\s;\}]{1})include)/g),
                S = new TextParser(code),
                js = '';

            var includes = [];
            while (S.index < S.length) {


                if (S.skipTo(regexp).eof()) break;
                if (helper.isInComment(S)) {
                    S.next();
                    continue;
                }

                var start = S.index;
                S.next();
                go.nameEnd(S);

                includes.push(';');
                Parser.include(S, includes);


                var end = S.index;
                if (end > start) {
                    js += ';' + S.text.substring(start, end + 1);
                } else {
                    console.warn('Include is empty');
                }
            }

            //-console.log('parsed', includes.join(''));
            return includes.join('');
        }
    }


    w.HtmlParser = {
        parse: function(dir, html) {
            var doc = document.implementation.createHTMLDocument('');
            doc.documentElement.innerHTML = html;

            function getAll(name, attr) {

                return ruqq.arr(doc.querySelectorAll(name)).where(function(x) {
                    return !!x.getAttribute(attr) && /:\/\/|^\/\//.test(x.getAttribute(attr)) == false;
                }).map(function(x) {
                    return x.getAttribute(attr);
                });


            }

            var includes = [];


            function add(type, x) {
                var url, appuri;
                if (x[0] == '/') {
                    appuri = x;
                    url = dir + x.substring(1);
                } else {
                    appuri = '/' + x;
                    url = dir + x;
                }
                includes.push({
                    type: type,
                    url: url,
                    namespace: '',
                    appuri: appuri
                });
            }

            getAll('script', 'src').each(add.bind(this, 'js'));
            getAll('link', 'href').each(add.bind(this, 'css'));

            console.log('includes', includes);
            return includes;

        },
        create: function(solution, output) {
            var doc = document.implementation.createHTMLDocument('');
            doc.documentElement.innerHTML = solution.resource.source;


            function removeAll(elements, ifattr) {
                for (var i = 0; i < elements.length; i++) {
                    if (ifattr && !elements[i].getAttribute(ifattr)) continue;

                    elements[i].parentNode.removeChild(elements[i]);
                }
            }

            function createElement(name, attr) {
                var tag = document.createElement(name);
                for (var key in attr) {
                    tag[key] = attr[key];
                }
                return tag;
            }

            removeAll(doc.querySelectorAll('script'), 'src');
            removeAll(doc.querySelectorAll('link[rel=stylesheet]'));

            if (output.js) {
                doc.querySelector('head').appendChild(createElement('script', {
                    type: 'application/javascript',
                    src: 'script/build.release.js'
                }));
            }
            if (output.css) {
                doc.querySelector('head').appendChild(createElement('link', {
                    rel: 'stylesheet',
                    href: 'style/build.release.css'
                }));
            }
            if (output.xhr) {
                var tag = createElement('div', {
                    id: 'build.release.xhr',
                    style: 'display: none;'
                });
                tag.innerHTML = output.xhr;
                doc.querySelector('body').appendChild(tag);
            }


            var doctype = doc.doctype;
            doctype = "<!DOCTYPE " + doctype.name + (doctype.publicId ? ' PUBLIC "' + doctype.publicId + '"' : '') + (!doctype.publicId && doctype.systemId ? ' SYSTEM' : '') + (doctype.systemId ? ' "' + doctype.systemId + '"' : '') + '>';

            output.html = doctype + doc.documentElement.outerHTML;

            return doc.documentElement.outerHTML;
        }
    };



    //////$(document).ready(function() {
    //////   var source = "anyfn();\
    //////         ;include.js('a.js')\
    //////         /**loading js */ //other\
    //////         \
    //////             .js({\
    //////                 /** any */\
    //////                 net: '../test.js'\
    //////             }).css(['1.css','2.css'])\
    //////             .ready(function(){\
    //////                 console.log('DONE');\
    //////             });\
    //////             \
    //////         anyfn2(function(){\
    //////             include.done(function(){\
    //////                 any\
    //////             }).lazy({obj: 'lazy.js'});\
    //////         });";
    //////   
    //////   console.log('parsed', JsParser.parse(source));
    //////});
});
(function(w, $, mask) {

    var Helper = {
        resolveDom: function(compo, values) {
            if (compo.nodes != null) {
                return mask.renderDom(compo.nodes, values);
            }
            if (compo.attr.template != null) {
                var e;
                if (compo.attr.template[0] === '#') {
                    e = document.getElementById(compo.attr.template.substring(1));
                    if (e == null) {
                        console.error('Template Element not Found:', arg);
                        return null;
                    }
                }
                return mask.renderDom(e != null ? e.innerHTML : compo.attr.template, values);
            }
            return null;
        },
        resolveTemplate: function(compo) {
            if (compo.nodes != null) return compo.nodes;
            if (compo.attr.template != null) {
                var e;
                if (compo.attr.template[0] === '#') {
                    e = document.getElementById(compo.attr.template.substring(1));
                    if (e == null) {
                        console.error('Template Element not Found:', arg);
                        return null;
                    }
                }
                return e != null ? e.innerHTML : compo.attr.template;
            }
            console.error('Undefined Template', compo);
            return null;
        }
    }

    w.Compo = Class({
        Construct: function() {

        },
        render: function(values, container) {
            this.create(values);
            if (container) this.$.appendTo(container);
            return this;
        },
        create: function(values) {
            var elements = [];
            elements.appendChild = function(node) {
                elements.push(node);
            }
            mask.renderDom(Helper.resolveTemplate(this), values, elements);

            this.$ = $(elements);
            if (this.events != null) {
                for (var key in this.events) {
                    var fn = this.events[key],
                        parts = key.split(':');
                    
                    this.$.on(parts[0] || 'click', parts.splice(1).join(':'),fn.bind(this));
                }
            }
            if (this.compos != null) {
                for (var key in this.compos) {
                    if (typeof this.compos[key] !== 'string') continue;
                    var selector = this.compos[key],
                        info = selector.split(':');

                    this.compos[key] = Compo.selectors[info[0]](info.splice(1).join(':'), this);
                }
            }

            return this;
        },
        Static: {
            selectors: {
                '$': function(selector, compo) {
                    if (!selector) return compo.$;
                    var r = compo.$.find(selector);
                    return r.length > 0 ? r : compo.$.filter(selector);
                }
            },
            /**
             @default, global $ is used
             IDOMLibrary = {
             {fn}(elements) - create dom-elements wrapper,
             on(event, selector, fn) - @see jQuery 'on'
             }
             */
            setDOMLibrary: function(lib) {
                $ = lib;
            }
        }
    });

})(window, $, mask)
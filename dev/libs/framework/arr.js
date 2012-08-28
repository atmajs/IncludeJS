;
(function(r) {

    'use strict';



    function extend(target, source) {
        for (var key in source) if (source[key]) target[key] = source[key];
        return target;
    }

    /**
     *  ~1: check(item, compareFunction);
     *  ~2: check(item, '>|<|>=|<=|==', compareToValue);
     *  ~3: check(item, propertyNameToCompare, '>|<|>=|<=|==', compareToValue);
     */

    function check(item, arg1, arg2, arg3) { /** get value */

        if (typeof arg1 === 'function') return arg1(item) ? item : null;

        var value, compareToValue, comparer;
        //if (arguments.length == 3) {
        //    value = item;
        //    comparer = arg1;
        //    compareToValue = arg2;
        //} else if (arguments.length == 4) {
        value = arg1 != null ? Object.getProperty(item, arg1) : item;
        comparer = arg2;
        compareToValue = arg3;
        //}
        switch (comparer) {
        case '>':
            return value > compareToValue ? item : null;
        case '<':
            return value < compareToValue ? item : null;
        case '>=':
            return value >= compareToValue ? item : null;
        case '<=':
            return value <= compareToValue ? item : null;
        case '!=':
            return value != compareToValue ? item : null;
        case '==':
            return value == compareToValue ? item : null;
        }
        console.error('InvalidArgumentException: linq.js:check', arguments);
        return null;
    };

    var arr = {
        /**
         * @see check
         */
        where: function(items, arg1, arg2, arg3) {
            var array = [];
            if (items == null) return array;
            var argsLength = arguments.length;

            for (var item, i = 0, length = items.length; item = items[i], i < length; i++) {
                if (check(item, arg1, arg2, arg3) != null) array.push(item);
            }

            return array;
        },
        each: Array.prototype.forEach ?
        function(items, fn) {
            if (items == null) return items;
            
            items.forEach(fn);
            return items;
        } : function(items, func) {
            if (items == null) return items;
            for (var item, i = 0, length = items.length; item = items[i], i < length; i++) func(item);
            return items;
        },
        remove: function(items, arg1, arg2, arg3) {
            for (var item, i = 0; item = items[i], item != null; i++) {
                if (check(item, arg1, arg2, arg3) != null) {
                    items.splice(i, 1);
                    i--;
                }
            }
            return items;
        },
        invoke: function() {
            var args = Array.prototype.slice.call(arguments);
            var items = args.shift(),
                method = args.shift(),
                results = [];
            for (var i = 0; i < items.length; i++) {
                if (typeof items[i][method] == 'function') {
                    results.push(items[i][method].apply(items[i], args));
                } else {
                    results.push(null);
                }
            }
            return results;
        },
        /**
         * @see where()
         * Last Argument is default value
         */
        first: function(items, arg1, arg2, arg3) {
            for (var item, i = 0; item = items[i], i < items.length; i++) if (check(items[i], arg1, arg2, arg3) != null) return items[i];
            return null;
        },
        any: function(items, arg1, arg2, arg3) {
            for (var item, i = 0; item = items[i], i < items.length; i++) if (check(items[i], arg1, arg2, arg3) != null) return true;
            return false;
        },
        isIn: function(items, checkValue) {
            for (var item, i = 0; item = items[i], i < items.length; i++) if (checkValue == item) return true;
            return false;
        },
        map: Array.prototype.map ?
        function(items, func) {
            if (items == null) return [];
            return items.map(func)
        } : function(items, func) {
            var agg = [];
            if (items == null) return agg;
            for (var x, i = 0; x = items[i], i < items.length; i++) agg.push(func(x, i));
            return agg;
        },
        /**
         * @arg arg - function (return value to select) || property name to select
         */
        select: function(items, arg) {
            if (items == null) return [];
            var arr = [];
            for (var item, i = 0; item = items[i], i < items.length; i++) {
                if (typeof arg === 'string') {
                    arr.push(item[arg]);
                } else if (typeof arg === 'function') {
                    arr.push(arg(item));
                }
            }
            return arr;
        },
        distinct: function(items, compareF) {
            var array = [];
            if (items == null) return array;

            var length = items.length;
            for (var i = 0; i < length; i++) {
                var unique = true;
                for (var j = 0; j < array.length; j++) {
                    if ((compareF && compareF(items[i], array[j])) || (compareF == null && items[i] == array[j])) {
                        unique = false;
                        break;
                    }
                }
                if (unique) array.push(items[i]);
            }
            return array;
        }
    };

    r.arr = function(items) {
        return new Expression(items);
    }

    extend(r.arr, arr);

    function Expression(items) {
        this.items = items;
    }

    function extendClass(method) {
        Expression.prototype[method] = function() {
            var args = Array.prototype.slice.call(arguments);
            args.unshift(this.items);

            var result = arr[method].apply(this, args);
            if (result instanceof Array) {
                this.items = result;
                return this;
            }
            return this;
        };
    }
    for (var method in arr) {
        extendClass(method);
    }

})(include.promise('ruqq'));
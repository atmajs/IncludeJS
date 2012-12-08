var LazyModule = {
	create: function(xpath, code) {
		var arr = xpath.split('.'),
			obj = global,
			module = arr[arr.length - 1];
		while (arr.length > 1) {
			var prop = arr.shift();
			obj = obj[prop] || (obj[prop] = {});
		}
		arr = null;

		Object.defineProperty(obj, module, {
			get: function() {

				delete obj[module];
				try {
					var r = __eval(code, global.include);
					if (!(r == null || r instanceof Resource)){
						obj[module] = r;
					}
				} catch (error) {
					error.xpath = xpath;
					Helper.reportError(error);
				} finally {
					code = null;
					xpath = null;
					return obj[module];
				}
			}
		});
	}
};
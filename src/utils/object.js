function obj_inherit(target /* source, ..*/ ) {
	if (typeof target === 'function') {
		target = target.prototype;
	}
	var i = 1,
		imax = arguments.length,
		source, key;
	for (; i < imax; i++) {

		source = typeof arguments[i] === 'function'
			? arguments[i].prototype
			: arguments[i];

		for (key in source) {
			target[key] = source[key];
		}
	}
	return target;
}
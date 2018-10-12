export function obj_inherit (target /* source, ..*/ ) {
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
};

export function obj_getProperty (obj, property) {
	var chain = property.split('.'),
		length = chain.length,
		i = 0;
	for (; i < length; i++) {
		if (obj == null) 
			return null;
		
		obj = obj[chain[i]];
	}
	return obj;
};

export function obj_setProperty (obj, property, value) {
	var chain = property.split('.'),
		imax = chain.length - 1,
		i = -1,
		key;
	while ( ++i < imax ) {
		key = chain[i];
		if (obj[key] == null) 
			obj[key] = {};
		
		obj = obj[key];
	}
	obj[chain[i]] = value;
};

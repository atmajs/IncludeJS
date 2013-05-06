function arr_invoke(arr, args, ctx) {

	if (arr == null || arr instanceof Array === false) {
		return;
	}

	for (var i = 0, x, length = arr.length; i < length; i++) {
		if (typeof arr[i] === 'function') {
			args != null ? x.apply(ctx, args) : x();
		}
	}

}

function arr_ensure(obj, xpath) {
	if (!xpath) {
		return obj;
	}
	var arr = xpath.split('.'),
		imax = arr.length - 1,
		i = 0,
		key;

	for (; i < imax; i++) {
		key = arr[i];
		obj = obj[key] || (obj[key] = {});
	}

	key = arr[imax];
	return obj[key] || (obj[key] = []);
}
function arr_invoke(arr, args, ctx) {

	if (arr == null || arr instanceof Array === false) {
		return;
	}

	for (var i = 0, length = arr.length; i < length; i++) {
		if (typeof arr[i] !== 'function') {
			continue;
		}
		if (args == null) {
			arr[i].call(ctx);
		}else{
			arr[i].apply(ctx, args);
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

function arr_indexOf (arr, fn) {
	if(arr == null) return -1;
	var imax = arr.length,
		i = -1;
	while(++i < imax) {
		if (fn(arr[i], i)) return i;
	}
	return -1;
}
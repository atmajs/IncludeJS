function fn_proxy(fn, ctx) {
	
	return function(){
		fn.apply(ctx, arguments);
	};
	
}

function fn_doNothing(fn) {
	typeof fn === 'function' && fn();
}
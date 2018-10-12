export function fn_proxy(fn, ctx) {
	
	return function(){
		fn.apply(ctx, arguments);
	};
	
}

export function fn_doNothing(fn) {
	typeof fn === 'function' && fn();
}
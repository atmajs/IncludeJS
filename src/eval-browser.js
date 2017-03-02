function __eval(source, include) {
	"use strict";
	/* if !DEBUG
	try {
	*/
		return eval.call(window, source);

	/* if !DEBUG
	} catch (error) {
		error.url = include && include.url;
		console.error(error);
	}
	*/
}
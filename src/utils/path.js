function path_getDir(url) {
	var index = url.lastIndexOf('/');
	return index === -1 ? '' : url.substring(index + 1, -index);
}

function path_resolveCurrent() {

	if (document == null) {
		return typeof module === 'undefined'
			? '' 
			: path_win32Normalize(module.parent.filename);
	}
	var scripts = document.getElementsByTagName('script'),
		last = scripts[scripts.length - 1],
		url = last && last.getAttribute('src') || '';
		
	return (url[0] === '/') ? url : '/' + url;
}

function path_win32Normalize(path){
	path = path.replace(/\\/g, '/');
	if (path.substring(0, 5) === 'file:'){
		return path;
	}

	return 'file:///' + path;
}

function path_resolveUrl(url, parent) {
	if (cfg.path && url[0] === '/') {
		url = cfg.path + url.substring(1);
	}

	switch (url.substring(0, 5)) {
		case 'file:':
		case 'http:':
			return url;
	}

	if (url.substring(0, 2) === './') {
		url = url.substring(2);
	}


	if (url[0] === '/') {
		if (isWeb === false || cfg.lockedToFolder === true) {
			url = url.substring(1);
		}
	} else if (parent != null && parent.location != null) {
		url = parent.location + url;
	}


	while (url.indexOf('../') !== -1) {
		url = url.replace(reg_subFolder, '');
	}

	return url;
}

function path_isRelative(path) {
	var c = path.charCodeAt(0);
	
	switch (c) {
		case 47:
			// /
			return false;
		case 102:
			// f
		case 104:
			// h
			return /^file:|https?:/.test(path) === false;
	}
	
	return true;
}

function path_getExtension(path) {
	var query = path.indexOf('?');
	if (query === -1) {
		return path.substring(path.lastIndexOf('.') + 1);
	}
	
	return path.substring(path.lastIndexOf('.', query) + 1, query);
}
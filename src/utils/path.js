function path_getDir(url) {
	var index = url.lastIndexOf('/');
	return index === -1 ? '' : url.substring(index + 1, -index);
}

// @TODO - implement url resolving of a top script
function path_resolveCurrent() {
	if (document == null) {
		return '';
	}
	var scripts = document.getElementsByTagName('script'),
		last = scripts[scripts.length - 1],
		url = last && last.getAttribute('src') || '';
		
	return (url[0] === '/') ? url : '/' + url;
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
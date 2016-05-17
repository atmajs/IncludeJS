var res_groupByType;
(function(){
	res_groupByType = function(arr){
		var pckg = {}, imax = arr.length, i = -1;
		while (++i < imax) {
			var path = arr[i];
			var ext = getExt(path);
			var type = getType(ext);
			append(pckg, type, path);
		}
		return pckg;
	};

	var rgxExt = /\.([\w]+)($|\?|:)/
	function getExt(path) {
		var match = rgxExt.exec(path);
		if (match == null) {
			return 'js';
		}
		return match[1];
	}
	function getType (ext) {
		return _types[ext] || 'load';
	}
	function append(pckg, type, path) {
		var arr = pckg[type];
		if (arr == null) {
			arr = pckg[type] = [];
		}
		arr.push(path);
	};
	var _types = {
		'js': 'js',
		'es6': 'js',
		'css': 'css',
		'less': 'css',
		'sass': 'css',
		'json': 'ajax',
		'mask': 'mask',
	};
}());
var res_groupByType;
(function(){
	res_groupByType = function(arr){
		var pckg = {}, imax = arr.length, i = -1;
		while (++i < imax) {
			var path = arr[i];
			var type = PathResolver.getType(path);
			append(pckg, type, path);
		}
		return pckg;
	};
	function append(pckg, type, path) {
		var arr = pckg[type];
		if (arr == null) {
			arr = pckg[type] = [];
		}
		arr.push(path);
	}
}());
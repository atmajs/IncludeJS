var LoadBundleParser = {
	process: function(source, res){
		var div = document.createElement('div');
		div.innerHTML = source;
		IncludeLib.loadBags.push(div);
		return null;
	}
};


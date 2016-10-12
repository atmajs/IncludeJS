var JSONParser = {
	process: function(source, res){
		try {
			return JSON.parse(source);
		} catch(error) {
			console.error(error, source);
			return null;
		}
	}
};


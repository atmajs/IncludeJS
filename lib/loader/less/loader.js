include.js('less-min.js').done(function() {

	include.exports = {
		process: function(source, resource) {

			var url = resource.url,
				parser = new less.Parser({
				filename: url,
				paths: ['./' + resource.location]
			}),
				css;


			parser.parse(source, function(error, tree) {
				if (error) {
					console.error(url, error);
					return;
				}
				try {
					css = tree.toCSS();
				} catch(error){
					console.error(url, error);
				}
			});

			return css;
		}
	};

});

(function(){

	// using https://github.com/nodeca/js-yaml

	var YAML;


	include.exports = {
		process: function(source, res) {
			
			var YAML = require('yamljs')

			source = source
				.replace(/\t/g, '  ');
				

			try {
				return YAML.parse(source);
			} catch (error) {
				console.error(error, source);
				return null;
			}
		}
	};


	if (typeof require === 'function'){
		YAML = require('yamljs');
		return;
	}

	include
		.js('js-yaml.min.js')
		.done(function(resp) { YAML = jsyaml; });
}());
include
	.js('./traceur.js')
	.done(function(resp){

		var Traceur = resp.traceur || window.traceur;
		
		include.exports = {
			process: function(content, resource){
				
				var file = new Traceur
						.syntax
						.SourceFile(resource.url, content),
						
					reporter = new Traceur
						.util
						.ErrorReporter(),
						
					tree = Traceur
						.codegeneration
						.Compiler
						.compileFile(reporter, file);
				
				var jscode = Traceur.outputgeneration.TreeWriter.write(tree)

				
				return jscode;
			}
		};
		
	});
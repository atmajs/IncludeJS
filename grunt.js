module.exports = function(grunt) {
	"use strict";

	// Project configuration.
	grunt.initConfig({
		concat: {
			dist: {
				src: ['src/intro.js.txt',
						'src/1.scope-vars.js', 
						'src/2.Helper.js',
						'src/2.Routing.js',
						'src/3.Events.js', 
						'src/4.IncludeDeferred.js', 
						'src/5.Include.js', 
						'src/6.ScriptStack.js',
						'src/7.CustomLoader.js',
						'src/8.LazyModule.js',
						'src/9.Resource.js',
						'src/10.export.js',						
						'src/outro.js.txt'],
				dest: 'lib/include.js'
			},
			distReload:{
				src: 'src/20.Autoreload.js',
				dest: 'lib/include.autoreload.js'
			},
			distNode: {
				src: ['src/intro.js.txt',
						'src/1.scope-vars.js', 
						'src/2.Helper.js',
						'src/2.Routing.js',
						'src/3.Events.js', 
						'src/4.IncludeDeferred.js', 
						'src/5.Include.js', 
						'src/6.ScriptStack.js',
						'src/7.CustomLoader.js',
						'src/8.LazyModule.js',
						'src/9.Resource.js',
						'src/10.export.js',
						'src/11.node.js',						
						'src/outro.js.txt'],
				dest: 'lib/include.node.js'
			}
		},
		min: {
			dist: {
				src: ['lib/include.js'],
				dest: 'lib/include.min.js'
			}
		},
		lint: {
			files: ['grunt.js', 'lib/include.js']
		},
		watch: {
			scripts: {
				files: '<config:concat.dist.src>',
				tasks: 'default'
			}
		},
		jshint: {
			options: {
				curly: true,
				eqeqeq: false,
				immed: true,
				latedef: true,
				newcap: false,
				noarg: true,
				sub: true,
				undef: true,
				boss: false,
				eqnull: true,
				node: true,
				es5: true,
				strict: true,
				smarttabs: true,
				expr: true,
				evil: true
			},
			globals: {
				window: false,
				document: false,
				XMLHttpRequest: false,
				IncludeRewrites: false,
				Class: false
			}
		}
	});

	// Default task.
	grunt.registerTask('default', 'concat min lint');

};
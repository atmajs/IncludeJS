var config = module.exports;



 config["include.dom"] = {
     env: "browser",
	 rootPath: "../",
     sources: [
         "lib/include.js"		 
     ],	 
	 resources: [
			"test/**/*.js"
			
		],
	 tests: [
         "test/*-dom.js"
     ]
 };


config["include.node"] = {
    env: "node",
    rootPath: "../",
    sources: [
        "lib/include.node.js"
    ],
    tests: [
        "test/*-node.js"
    ]
};


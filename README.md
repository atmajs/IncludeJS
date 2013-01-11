<h3>IncludeJS</h3>
<hr/>
<img src="https://travis-ci.org/tenbits/IncludeJS.png?branch=master" alt="Build Status" />
<h6>Resource Loader</h6>


Features:
<ul>
	<li>Scripts, Styles, Ajax</li>
	<li>All resources can be combined (scripts/styles/images/etc.) afterwards (but not necessary) with 
		<a href='https://github.com/tenbits/IncludeJS.Builder' target='_blank'>IncludeJS.Builder</a></li>
	<li>
		Inline Dependency Declaration
		<i>No external files, as package.json or config.js</i>
	</li>
	<li>Can be loaded any script file. <i>No prerequests for module definition</i></li>
	<li>
		Routing
		<code>
			include.routes({ controller: '/src/controllers/{0}.js' }); 
			/* ... */
			include.js({controller: 'user' });
		</code>
	</li>
	<li>
		Parameterized include
		<p>
			<code>include.js({ compo: 'myCompo?color=green' });</code>
			<tt>myCompo.js :</tt>
			<code>document.body.style.backgroundColor = include.iparams.color</code>
		</p>
	</li>
	<li>
		Module Exports 
		<p>
			<i><tt>myScript.js</tt></i>
			<code>include.exports = { logMe: console.log.bind(console, 'Me') }</code>			
		</p>
	</li>
	<li>
		Javascript Aliases
		<p>
			<code>
				include.js('myScript.js::Logger').done(function(response){
					response.Logger.logMe();
				});
			</code>
			<i>or without alias:</i>
			<code>
				include.js('myScript.js').done(function(response){
					response.myScript.logMe();
				});
			</code>
		</p>
	</li>
	<li>
		Custom Loader Support
		<p>
			Already implemented <b>*.coffee</b> and <b>*.less</b>
		</p>
		<i>
			IncludeJS.Builder will compile coffeescript and less to javascript and css for better "release" performance
		</i>		
	</li>
	<li>
		Lazy Modules
		<i>Scripts will be evaluated only when you needs them</i>
	</li>
	<li> Browser and nodejs</li>
	<li> Performance </li>
	<li> No dependencies </li>
</ul>

<p><a href='http://libjs.it/#/include/api'>API</a></p>

<p><i>IncludeJS is part of <a href='http://libjs.it'> LibJS Project </a></i></p>




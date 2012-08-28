
var dfr = function() {
   console.log('main.js done')
   this.resolved = true;
   this.callback && this.callback();
}
dfr.done = function(callback) {
   return this.resolved ? callback() : this.callback = callback;
}


include.js(['/net/uri.js', '/dom/zepto.js','/jshelper/builder.js']).done(dfr)


window.main = function(action) {

   dfr.done(function() {
      if (action.args.length) {
         var uri = new window.net.URI(action.args[0]);
         Builder.process(uri.extension, uri.toString());
         return;
      }

      terminal.promt('Enter the file to be minified:', function(data) {
         console.log('>>data', data);
      });

   });
}



void
function() {
    window.onerror = function() {
        console.warn('Error', arguments);
    }
    
    window.app = {
        service:function(name, action,data){
            switch(action){
                case 'file/save':
                    //console.log('server',data.content);
                    break;
            }
        }
    }
   
    include.cfg({
        lib: 'file:///c:/development/libjs/{name}/lib/{name}.js',
        framework: 'file:///c:/development/libjs/framework/lib/{name}.js',
        beauty: '/beauty/{name}.js'
    });
    
    
    
    
    
    include.js({
        lib: ['mask','compo'],
        framework: ['events'],
        beauty: ['html', 'css', 'js'],
        '': 'main.js'
    }).ready(function(w,r) {

        console.log('index loaded');
        console.timeEnd('IndexLoad');
    
        var App = Class({
            Extends: Compo,
            attr: {
                template: '#layout'
            },
            compos: {
                input: '$:input',
                button: '$:button',
                tbJs: '$:.panels > div:nth-child(1) > textarea',
                tbCss: '$:.panels > div:nth-child(2) > textarea',
                tbLoad: '$:.panels > div:nth-child(3) > textarea',
                tbHtml: '$:.panels > div:nth-child(4) > textarea',
                tbImages: '$:.panels > div:nth-child(5) > textarea',
                overlay: '$:.overlay',
                chbMinify: '$:input[type=checkbox]'
                
            },
            events: {
                'mousedown: .tab > .header > div:not(.active)' : function(e){
                    $(e.target).parent().children().removeClass('active');
                    var $item = $(e.target).addClass('active'),
                        index = $item.index() + 1,
                        $panels = $item.closest('.tab').children('.panels');
                        
                    $panels.children().removeClass('active');
                    $panels.children('div:nth-child(' + index + ')').addClass('active');
                    
                },
                'click: button:enabled': function(e){
                    app.toggleProgress(1);
                    Builder.process('html', this.compos.input.val(), this.compos.chbMinify.prop('checked'));
                    
                    console.log('e.current', e.currentTarget);
                    //-$(e.currentTarget).prop('disabled', true);
                    
                }
            },
            toggleProgress: function(status){                
                this.compos.overlay.css('display', status ? 'table' : 'none');
            }
        });
        
        var app = new App;
        app.render({},document.body);
        
        r.events.bind('builder.done', function(output){
            
            var js = output.js;
            if (!solution.minify) js = js_beautify(output.js);
            app.compos.tbJs.val(js);
            
            var css = output.css;
            if (css && !solution.minify) css = css_beautify(output.css);
            app.compos.tbCss.val(css || 'No Css');
            app.compos.tbLoad.val(output.xhr && style_html(output.xhr) || 'No XMLHttp* Load requests');
            app.compos.tbHtml.val(output.html && style_html(output.html) || 'No HTML');
            
            
            var images = [];
            ruqq.arr.each(output.images, function(x){
                images.push(x.uri.toString());                
            });
            
            app.compos.tbImages.val(images.length ? images.join('\r\n') : 'No Images');            
            app.toggleProgress(0);
        });
        
        //var url = 'file:///c:/Development/libjs/compo/notification/lib/notification.js'
        var url = 'index.html';
        //var url = 'file:///c:/Development/libjs/include/index.test.html';
        
        //app.toggleProgress(1);
        //Builder.process('html',url, false);
        
    }.bind(this, window, include.promise('ruqq')));
}();























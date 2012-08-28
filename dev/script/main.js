window.onerror = function(msg, url, l) {
    var e = {
        message: msg,
        fileName: url,
        lineNumber: l
    };
    console.log('window.onerror', msg, arguments);

}


void
function() {





    include.cfg({
        lib: '/dev/libs/{name}/{name}.js'
    }) //    
    .js({
        lib: ['mask', 'prism'],
        '': '/dev/script/jquery.js'
    }) //
    .css('/dev/libs/prism/prism.css') //
    .done(function() {
        mask.registerHandler('prism', Class({
            render: function(values, container) {

                mask.renderDom("pre.language-#{language} > code.language-#{language}", this.attr, container);
                container = container.querySelector('code');

                $.get(this.attr.src).then(function(response) {
                    container.innerHTML = response;
                    Prism.highlightElement(container.parentNode);
                });
            }
        }));
    }) //
    .ready(function() {
        
        document.body.appendChild(mask.renderDom($('#layoutMask').html(), {}));
        
        $('#navi').on('click','span:not(.active)', function(){
            var id = $(this).parent().children().removeClass('active').end().end().addClass('active').data('id');
            $('.view').addClass('hidden').filter('#' + id).removeClass('hidden');
        });
    });

}();
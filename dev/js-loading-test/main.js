
document.addEventListener('DOMContentLoaded', function(){
   
   
   
    setTimeout(function(){
        console.time('JS Eval');
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4){
                eval(xhr.responseText);
                console.timeEnd('JS Eval');
            }
        }
        xhr.open('GET', 'ext.js', true);
        xhr.send();
        
    }, 1000);
    
    
    setTimeout(function(){
       console.time('JS Emb');
       
       eval(document.querySelector('#emb').innerHTML);
       
       console.timeEnd('JS Emb');
       
    }, 2000);
   
   setTimeout(function(){
    console.time('JS Load');   
    var tag = document.createElement('script');
    tag.type = 'application/javascript';
    tag.src = 'ext.js';
    document.querySelector('head').appendChild(tag);
   }, 3000); 
    
});
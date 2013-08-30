
function path_getFile(url) {
    
    url = url
        .replace('file://', '')
        .replace(/\\/g, '/')
        .replace(/\?[^\n]+$/, '');
    
    if (/^\/\w+:\/[^\/]/i.test(url)){
        // win32 drive
        return url.substring(1);
    }
    
    return url;
}

function path_getDir(url) {
    return url.substring(0, url.lastIndexOf('/'));
}
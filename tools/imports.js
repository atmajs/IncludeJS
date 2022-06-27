module.exports = {
    write (file) {
        let str = `Promise.resolve().then(function () { return require(resource.url); })`;
        file.content = file.content.replace(str, 'import(resource.url)');
    }
}

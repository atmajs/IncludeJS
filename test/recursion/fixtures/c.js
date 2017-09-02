include
.js('./a.js')
.done(resp => {
    console.log('C', resp);

    include.exports = {
        c: true
    };
})
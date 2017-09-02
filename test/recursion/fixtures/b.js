include
.js('./c.js')
.done(resp => {
    console.log('B', resp);

    include.exports = {
        b: true
    };
})
require('../../../lib/include.node.js');


include
    .js('./b.js')
    .done(resp => {
        console.log('A', resp);

        include.exports = {
            a: true
        };
    })
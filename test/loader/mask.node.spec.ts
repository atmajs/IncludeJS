import { includeLib } from '../lib';


global.mask = require('maskjs');

let include = includeLib
    .instance(`file://${__filename}`);



UTest({
    'loads mask'(done) {

        include
            .mask('../letter/letter.mask')
            .done(function (resp) {
                var compo = global.mask.getHandler('Letter');
                notEq_(compo, null);
                notEq_(resp.mask.letter.Letter, null);
                done();
            });

    }
});

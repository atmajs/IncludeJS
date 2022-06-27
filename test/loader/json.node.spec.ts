
import { includeLib } from '../lib';

let include = includeLib
    .instance(`file://${__filename}`);

UTest({
    'loads json' (done) {
        include.load('../letter/letter.json').done(function(resp){
            eq_(resp.load.letter.a, 'A');
            done();
        });
    }
})

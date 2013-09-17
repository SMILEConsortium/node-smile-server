var assert = require('assert');

var Persisteus = require('../../lib/smile/persisteus').Persisteus;

exports.testPersisteusConstructor = function(test) {
    test.expect(1);
    var aPersisteus = new Persisteus();
    test.equal(true, aPersisteus !== null);
    test.done();
};

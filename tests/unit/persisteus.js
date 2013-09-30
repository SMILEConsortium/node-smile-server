var assert = require('assert');

var Persisteus = require('../../lib/smile/persisteus').Persisteus;

exports.testPersisteusConstructor = function(test) {
    test.expect(3);
    var aPersisteus = new Persisteus();
    test.equal(true, aPersisteus !== null);
    test.ok(aPersisteus.DB != null);
    test.ok(aPersisteus.CONFIG != null);
    test.done();
};

exports.testGetInfo = function(test) {
    test.expect(2);
    var aPersisteus = new Persisteus();
    test.equal(true, aPersisteus !== null);
    test.ok(aPersisteus.getInfo() == null);
    test.done();
};

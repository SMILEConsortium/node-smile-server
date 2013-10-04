var assert = require('assert');

var Persisteus = require('../../lib/smile/persisteus').Persisteus;

var sessiondata = {
    "NAME": "test2",
    "Q": "asdfgh",
    "A": "2",
    "IP": '10.0.2.16',
    "O4": "f",
    "O3": "d",
    "O2": "s",
    "O1": "a",
    "TYPE": 'QUESTION'
};

exports.testPersisteusConstructor = function(test) {
    test.expect(3);
    var aPersisteus = new Persisteus();
    test.equal(true, aPersisteus !== null);
    test.ok(aPersisteus.DB != null);
    test.ok(aPersisteus.CONFIG != null);
    test.done();
};

// XXX This sucks for testing ... switch to vows or something else
exports.testMethodCalls = function(test) {
    test.expect(3);
    var aPersisteus = new Persisteus();
    test.equal(true, aPersisteus !== null);
    test.ok(aPersisteus.logInfo() == null);
    test.ok(aPersisteus.putSession(sessiondata, function callback(err, data) { console.log('putSession success'); }) == null);
    test.ok(aPersisteus.exportDocs('/tmp/foo.json', function callback(err, data) { console.log('export success'); }) == null);
    test.done();
};
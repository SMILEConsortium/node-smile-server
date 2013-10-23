var assert = require('assert');
var vows = require('vows');

var Persisteus = require('../../lib/smile/persisteus').Persisteus;
var persisteus;
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
var suite = vows.describe('Tests "IQ Data Persistence Local/Remote Online/Offline Using Persisteus.js"');

suite.addBatch({
	"Verify Contructor" : function() {
		persisteus = new Persisteus();
	}
});


suite.addBatch({
    "Verify the persisteus object" : {
        topic : new(Persisteus),
        'Exists': function (pers) {
            assert.isTrue (pers != null);
        },
        'Has CONFIG': function (pers) {
            assert.isTrue (pers.CONFIG != null);
        },
        'Exists': function (pers) {
            assert.isTrue (pers != null);
        }
    }
});

/*
suite.addBatch({
    "Verify CRUD for Sessions" : {
        topic : pers,
        'Exists': function (pers) {
        	aPersisteus.putSession(sessiondata, function callback(err, data) { console.log('putSession success'); })
            assert.isTrue (pers != null);
        },
        'Has CONFIG': function (pers) {
            assert.isTrue (pers.CONFIG != null);
        },
        'Exists': function (pers) {
            assert.isTrue (pers != null);
        }
    }
});

suite.addBatch({
    "Verify Utility functions" : {
        topic : new(Persisteus),
        'Exists': function (pers) {
            assert.isTrue (pers.logInfo() == null);
        }
    }
});

*/
/*


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
*/
suite.run();
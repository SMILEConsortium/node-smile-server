assert = require('assert');
vows = require('vows');
request = require('request');
app = require('../../smileplug');

PORT = 3001;
BASE_URL = "http://localhost:" + PORT;

HEADERS_JSON = {
    'Content-Type' : 'application/json'
};

var suite = vows.describe('Tests "Rating Metadata"');

var defaultMetadata = {
    1 : "very bad question",
    2 : "bad question",
    3 : "regular question",
    4 : "good question",
    5 : "fantastic question"
};

var testMetadata = {
    1 : "very bad question test",
    2 : "bad question test",
    3 : "regular question test",
    4 : "good question test",
    5 : "fantastic question test"
};

suite.addBatch({
    "startup" : function() {
        app.runServer(PORT);
    }
});

suite.addBatch({
    "A GET to /smile/metadata/rating should return the default metadata" : {
        topic : function() {
            request({
                uri : BASE_URL + '/smile/metadata/rating',
                method : 'GET'
            }, this.callback);
        },
        "should have the default metadata" : function(err, res, body) {
            assert.equal(JSON.stringify(defaultMetadata), res.body);
        },
    }
});

suite.addBatch({
    "A PUT to /smile/metadata/rating with metadata" : {
        topic : function() {
            request({
                uri : BASE_URL + '/smile/metadata/rating',
                method : 'PUT',
                headers : HEADERS_JSON,
                body : JSON.stringify(testMetadata),
            }, this.callback);
        },
        "should respond with 200" : function(err, res, body) {
            assert.equal(res.statusCode, 200);
        },
        "should answer with ok" : function(err, res, body) {
            assert.equal(res.body, "OK");
        },
    }
});

suite.addBatch({
    "A GET to /smile/metadata/rating should return the correct metadata" : {
        topic : function() {
            request({
                uri : BASE_URL + '/smile/metadata/rating',
                method : 'GET'
            }, this.callback);
        },
        "should have registered the questions" : function(err, res, body) {
            assert.equal(JSON.stringify(testMetadata), res.body);
        },
    }
});

suite.addBatch({
    "shutdown" : function() {
        app.close();
    }
});

suite.run();

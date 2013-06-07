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
    1 : "Low Quality Question",
    2 : "Adequate Question",
    3 : "Average Question",
    4 : "Good Question",
    5 : "High Quality Question"
};

var testMetadata = {
        1 : "Low Quality Question test",
        2 : "Adequate Question test",
        3 : "Average Question test",
        4 : "Good Question test",
        5 : "High Quality Question test"
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

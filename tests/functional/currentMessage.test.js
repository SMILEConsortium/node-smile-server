assert = require('assert');
vows = require('vows');
request = require('request');
app = require('../../smileplug');

PORT = 3001;
BASE_URL = "http://localhost:" + PORT;

HEADERS = {
    'Content-Type': 'application/json'
};

var url = BASE_URL + "/smile/currentmessage";
var bodyContent = {};

var suite = vows.describe('Tests currentmessage');

suite.addBatch({
    "startup": function() {
        app.runServer(PORT);
    }
});

suite.addBatch({
    "A PUT to /smile/currentmessage without data": {
        topic: function() {
            request({
                uri: url,
                method: 'PUT',
                headers: HEADERS,
                body: JSON.stringify(bodyContent)
            }, this.callback);
        },
        "should respond with 200": function(err, res, body) {
            assert.equal(res.statusCode, 200);
        },
        "should answer with ok": function(err, res, body) {
            assert.equal(res.body, "OK");
        }
    }
}).addBatch({
        "A GET to /smile/currentmessage": {
            topic: function() {
                request({
                    uri: url,
                    method: 'GET'
                }, this.callback);
            },
            "should have supplied data": function(err, res, body) {
                assert.equal(res.body, JSON.stringify(bodyContent));
            }
        }
    }).addBatch({
        "A GET to /JunctionServerExecution/current/MSG/smsg.txt": {
            topic: function() {
                request({
                    uri: BASE_URL + "/JunctionServerExecution/current/MSG/smsg.txt",
                    method: 'GET'
                }, this.callback);
            },
            "should have supplied data": function(err, res, body) {
                assert.equal(res.body, JSON.stringify(bodyContent));
            }
        }
    });

bodyContent = {
    "PING": "PONG"
};

suite.addBatch({
    "A PUT to /smile/currentmessage with data": {
        topic: function() {
            request({
                uri: url,
                method: 'PUT',
                headers: HEADERS,
                body: JSON.stringify(bodyContent)
            }, this.callback);
        },
        "should respond with 200": function(err, res, body) {
            assert.equal(res.statusCode, 200);
        },
        "should answer with ok": function(err, res, body) {
            assert.equal(res.body, "OK");
        }
    }
}).addBatch({
        "A GET to /smile/currentmessage": {
            topic: function() {
                request({
                    uri: url,
                    method: 'GET'
                }, this.callback);
            },
            "should have supplied data": function(err, res, body) {
                assert.equal(res.body, JSON.stringify(bodyContent));
            }
        }
    }).addBatch({
        "A GET to /JunctionServerExecution/current/MSG/smsg.txt": {
            topic: function() {
                request({
                    uri: BASE_URL + "/JunctionServerExecution/current/MSG/smsg.txt",
                    method: 'GET'
                }, this.callback);
            },
            "should have supplied data": function(err, res, body) {
                assert.equal(res.body, JSON.stringify(bodyContent));
            }
        }
    });

suite.addBatch({
    "shutdown": function() {
        app.close();
    }
});
suite.run();

assert = require('assert');
vows = require('vows');
request = require('request');
app = require('../../smileplug');

PORT = 3001;
BASE_URL = "http://localhost:" + PORT;

HEADERS = {
    'Content-Type': 'application/json'
};

var MESSAGE_START_MAKE_QUESTION = JSON.stringify({
    'TYPE': 'START_MAKE'
});

function configureBatch(suite, context, uri, bodyContent) {
    var url = BASE_URL + uri;
    return suite.addBatch({
        context: {
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
            context: {
                topic: function() {
                    request({
                        uri: BASE_URL + "/smile/currentmessage",
                        method: 'GET',
                    }, this.callback);
                },
                "should have supplied data": function(err, res, body) {
                    assert.equal(res.body, MESSAGE_START_MAKE_QUESTION);
                }
            }
        }).addBatch({
            context: {
                topic: function() {
                    request({
                        uri: BASE_URL + "/JunctionServerExecution/current/MSG/smsg.txt",
                        method: 'GET'
                    }, this.callback);
                },
                "should have supplied data": function(err, res, body) {
                    assert.equal(res.body, MESSAGE_START_MAKE_QUESTION);
                }
            }
        });
};

var suite = vows.describe('Tests "Start Make Question"');
suite.addBatch({
    "startup": function() {
        app.runServer(PORT);
    }
});
suite = configureBatch(suite, "A PUT to /smile/startmakequestion without data",
    "/smile/startmakequestion", {});
suite = configureBatch(suite, "A PUT to /smile/startmakequestion with data",
    "/smile/startmakequestion", {
        "PING": "PONG"
    });
suite.addBatch({
    "shutdown": function() {
        app.close();
    }
});
suite.run();

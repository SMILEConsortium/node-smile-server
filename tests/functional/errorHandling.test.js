assert = require('assert');
vows = require('vows');
request = require('request');
app = require('../../smileplug');

PORT = 3001;
BASE_URL = "http://localhost:" + PORT;

HEADERS_JSON = {
    'Content-Type': 'application/json'
};

HEADERS_FUBAR = {
    'Content-Type': 'application/fubar'
};

HEADERS_URLENCODED = {
    'Content-Type': 'application/x-www-form-urlencoded'
};

HEADERS_URLENCODED2 = {
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
};

var suite = vows.describe('Tests "Error Handling"');

suite.addBatch({
    "startup": function() {
        app.runServer(PORT);
    }
});

suite.addBatch({
    "A GET to /smile/student/id/status should return not found": {
        topic: function() {
            request({
                uri: BASE_URL + '/smile/student/172.16.129.242/status',
                method: 'GET'
            }, this.callback);
        },
        "should respond with 404": function(err, res, body) {
            assert.equal(res.statusCode, 404);
        },
        "should return not found message in JSON format": function(err, res, body) {
            assert.equal(res.body, JSON.stringify({
                "message": "Student does not exist: 172.16.129.242"
            }));
        },
    }
});

suite.addBatch({
    "A GET to /smile/question/id should return not found": {
        topic: function() {
            request({
                uri: BASE_URL + '/smile/question/someone',
                method: 'GET'
            }, this.callback);
        },
        "should respond with 404": function(err, res, body) {
            assert.equal(res.statusCode, 404);
        },
        "should return not found message in JSON format": function(err, res, body) {
            assert.equal(res.body, JSON.stringify({
                "message": "There are no questions associated with: someone"
            }));
        },
    }
});

suite.addBatch({
    "A GET to /JunctionServerExecution/current/0.html should return not found": {
        topic: function() {
            request({
                uri: BASE_URL + '/JunctionServerExecution/current/0.html',
                method: 'GET'
            }, this.callback);
        },
        "should respond with 404": function(err, res, body) {
            assert.equal(res.statusCode, 404);
        },
        "should return not found message in JSON format": function(err, res, body) {
            assert.equal(res.body, JSON.stringify({
                "message": "Question not found: 0"
            }));
        },
    }
});

suite.addBatch({
    "A GET to /JunctionServerExecution/current/0.jpg should return an image": {
        topic: function() {
            request({
                uri: BASE_URL + '/JunctionServerExecution/current/0.jpg',
                method: 'GET'
            }, this.callback);
        },
        "should respond with 404": function(err, res, body) {
            assert.equal(res.statusCode, 404);
        },
        "should return not found message in JSON format": function(err, res, body) {
            assert.equal(res.body, JSON.stringify({
                "message": "Question not found: 0"
            }));
        },
    }
});

suite.addBatch({
    "A GET to /JunctionServerExecution/current/MSG/10.0.2.15.txt should return 404": {
        topic: function() {
            request({
                uri: BASE_URL + '/JunctionServerExecution/current/MSG/10.0.2.15.txt',
                method: 'GET'
            }, this.callback);
        },
        "should respond with 404": function(err, res, body) {
            assert.equal(res.statusCode, 404);
        },
        "should return not found message in JSON format": function(err, res, body) {
            assert.equal(res.body, JSON.stringify({
                "message": "Student does not exist: 10.0.2.15"
            }));
        },
    }
});

suite.addBatch({
    "A GET to /nonexistenturl should return not found": {
        topic: function() {
            request({
                uri: BASE_URL + '/nonexistenturl',
                method: 'GET'
            }, this.callback);
        },
        "should respond with 404": function(err, res, body) {
            assert.equal(res.statusCode, 404);
        },
        "should return not found message in JSON format": function(err, res, body) {
            assert.equal(res.body, JSON.stringify({
                "message": "The requested URL /nonexistenturl was not found on this server."
            }));
        },
    }
});

suite.addBatch({
    "A PUT to /smile/currentmessage with empty body": {
        topic: function() {
            request({
                uri: BASE_URL + '/smile/currentmessage',
                method: 'PUT',
                body: null,
                headers: HEADERS_JSON
            }, this.callback);
        },
        "should respond with 500": function(err, res, body) {
            assert.equal(res.statusCode, 500);
        },
        "should return error message in JSON format": function(err, res, body) {
            assert.equal(res.body, JSON.stringify({
                "message": "PUT with empty data is not allowed."
            }));
        },
    }
});

suite.addBatch({
    "A PUT to /smile/currentmessage with no headers": {
        topic: function() {
            request({
                uri: BASE_URL + '/smile/currentmessage',
                method: 'PUT',
                body: null
            }, this.callback);
        },
        "should respond with 500": function(err, res, body) {
            assert.equal(res.statusCode, 500);
        },
        "should return error message in JSON format": function(err, res, body) {
            assert.equal(res.body, JSON.stringify({
                "message": "Missing content-type header"
            }));
        },
    }
});

suite.addBatch({
    "A PUT to /smile/currentmessage with invalid content-type header": {
        topic: function() {
            request({
                uri: BASE_URL + '/smile/currentmessage',
                method: 'PUT',
                headers: HEADERS_FUBAR,
                body: null
            }, this.callback);
        },
        "should respond with 500": function(err, res, body) {
            assert.equal(res.statusCode, 500);
        },
        "should return error message in JSON format": function(err, res, body) {
            assert.equal(res.body, JSON.stringify({
                "message": "Invalid content-type: application/fubar"
            }));
        },
    }
});

suite.addBatch({
    "After a PUT with empty body the server should stay up": {
        topic: function() {
            request({
                uri: BASE_URL + '/smile',
                method: 'GET'
            }, this.callback);
        },
        "should respond with 200": function(err, res, body) {
            assert.equal(res.statusCode, 200);
        },
        "should return ok": function(err, res, body) {
            assert.equal(res.body, 'OK');
        },
    }
});

suite.addBatch({
    "A PUT to /smile/question with garbage should return error": {
        topic: function() {
            request({
                uri: BASE_URL + '/smile/question',
                method: 'PUT',
                body: JSON.stringify({
                    TYPE: 'FOO'
                }),
                headers: HEADERS_JSON
            }, this.callback);
        },
        "should respond with 500": function(err, res, body) {
            assert.equal(res.statusCode, 500);
        },
        "should return error message in JSON format": function(err, res, body) {
            assert.equal(res.body, JSON.stringify({
                "message": "Unrecognized type: FOO"
            }));
        },
    }
});

var question = {
    "NAME": "default.15",
    "Q": "asdfgh",
    "A": "2",
    "IP": '10.0.2.15',
    "O4": "a",
    "O3": "s",
    "O2": "d",
    "O1": "f",
    "TYPE": 'QUESTION'
};

suite.addBatch({
    "A PUT to /smile/question with nonexistent student": {
        topic: function() {
            request({
                uri: BASE_URL + '/smile/question',
                method: 'PUT',
                headers: HEADERS_JSON,
                body: JSON.stringify(question),
            }, this.callback);
        },
        "should respond with 500": function(err, res, body) {
            assert.equal(res.statusCode, 500);
        },
        "should return error message in JSON format": function(err, res, body) {
            assert.equal(res.body, JSON.stringify({
                "message": "The question provided refers to nonexistent student: 10.0.2.15, name=default.15"
            }));
        },
    }
});

var studentNoIP = "MSG=%7B%22TYPE%22%3A%22HAIL%22%2C%22NAME%22%3A%22test%22%7D";

suite.addBatch({
    "A POST to /JunctionServerExecution/pushmsg.php with no IP": {
        topic: function() {
            request({
                uri: BASE_URL + '/JunctionServerExecution/pushmsg.php',
                method: 'POST',
                headers: HEADERS_URLENCODED,
                body: studentNoIP,
            }, this.callback);
        },
        "should respond with 500": function(err, res, body) {
            assert.equal(res.statusCode, 500);
        },
        "should answer with ok": function(err, res, body) {
            assert.equal(res.body, JSON.stringify({"message": "Student registration message must contain a valid IP property."}));
        },
    }
});

suite.addBatch({
    "A POST to /JunctionServerExecution/pushmsg.php with no IP using proper URLENCODED headers": {
        topic: function() {
            request({
                uri: BASE_URL + '/JunctionServerExecution/pushmsg.php',
                method: 'POST',
                headers: HEADERS_URLENCODED2,
                body: studentNoIP,
            }, this.callback);
        },
        "should respond with 500": function(err, res, body) {
            assert.equal(res.statusCode, 500);
        },
        "should answer with ok": function(err, res, body) {
            assert.equal(res.body, JSON.stringify({"message": "Student registration message must contain a valid IP property."}));
        },
    }
});


suite.addBatch({
    "A GET to index.html": {
        topic: function() {
            request({
                uri: BASE_URL + '/index.html',
                method: 'GET'
            }, this.callback);
        },
        "should respond with 200": function(err, res, body) {
            assert.equal(res.statusCode, 200);
        },
    }
});

suite.addBatch({
    "shutdown": function() {
        app.close();
    }
});

suite.run();

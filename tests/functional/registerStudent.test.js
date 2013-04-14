assert = require('assert');
vows = require('vows');
request = require('request');
app = require('../../smileplug');

PORT = 3001;
BASE_URL = "http://localhost:" + PORT;

HEADERS_JSON = {
    'Content-Type': 'application/json'
};

HEADERS_ENCODED = {
    'Content-Type': 'application/x-www-form-urlencoded'
};

var msgOK = "MSG=%7B%22TYPE%22%3A%22HAIL%22%2C%22IP%22%3A%22172.16.129.242%22%2C%22NAME%22%3A%22test%22%7D";
var msgOK2 = "MSG=%7B%22TYPE%22%3A%22HAIL%22%2C%22IP%22%3A%22172.16.129.243%22%2C%22NAME%22%3A%22test2%22%7D";


var student = {
    "name": "test",
    "ip": "172.16.129.242",
    "status": {"made": false, "solved": false},
    "answers": [],
    "ratings": [],
    "score": 0
};
var student2 = {
    "name": "test2",
    "ip": "172.16.129.243",
    "status": {"made": false, "solved": false},
    "answers": [],
    "ratings": [],
    "score": 0
};

var studentId = '172.16.129.242';
var studentId2 = '172.16.129.243';

var students = {};
students["172.16.129.242"] = student;

var suite = vows.describe('Tests "Register Student"');
var url = BASE_URL + '/JunctionServerExecution/pushmsg.php';

suite.addBatch({
    "startup": function() {
        app.runServer(PORT);
    }
});

suite.addBatch({
    "A POST to /JunctionServerExecution/pushmsg.php with data": {
        topic: function() {
            request({
                uri: url,
                method: 'POST',
                headers: HEADERS_ENCODED,
                body: msgOK,
            }, this.callback);
        },
        "should respond with 200": function(err, res, body) {
            assert.equal(res.statusCode, 200);
        },
        "should answer with ok": function(err, res, body) {
            assert.equal(res.body, "OK");
        },
    }
});

suite.addBatch({
    "A GET to /smile/student should return the posted student": {
        topic: function() {
            request({
                uri: BASE_URL + '/smile/student',
                method: 'GET'
            }, this.callback);
        },
        "should have registered the student": function(err, res, body) {
            assert.equal(res.body, JSON.stringify(students));
        },
    }
});

suite.addBatch({
    "A POST to /JunctionServerExecution/pushmsg.php with data": {
        topic: function() {
            request({
                uri: url,
                method: 'POST',
                headers: HEADERS_ENCODED,
                body: msgOK2,
            }, this.callback);
        },
        "should respond with 200": function(err, res, body) {
            assert.equal(res.statusCode, 200);
        },
        "should answer with ok": function(err, res, body) {
            assert.equal(res.body, "OK");
        },
    }
});
suite.addBatch({
    "A GET to /smile/student should return the posted student": {
        topic: function() {
            request({
                uri: BASE_URL + '/smile/student',
                method: 'GET'
            }, this.callback);
        },
        "should have registered the student": function(err, res, body) {
            students["172.16.129.243"] = student2;
            assert.equal(res.body, JSON.stringify(students));
        },
    }
});
suite.addBatch({
    "A GET to /smile/student/id/status should return the posted student": {
        topic: function() {
            request({
                uri: BASE_URL + '/smile/student/172.16.129.242/status',
                method: 'GET'
            }, this.callback);
        },
        "student should have status": function(err, res, body) {
            assert.equal(res.body, JSON.stringify({"made": false, "solved": false}));
        },
    }
});
suite.addBatch({
    "A GET to /JunctionServerExecution/current/MSG/IP.txt should return the posted student": {
        topic: function() {
            request({
                uri: BASE_URL + '/JunctionServerExecution/current/MSG/172.16.129.242.txt',
                method: 'GET'
            }, this.callback);
        },
        "student should have status": function(err, res, body) {
            assert.equal(res.body, JSON.stringify({"NAME": "test", "MADE": "N", "SOLVED": "N"}));
        },
    }
});

suite.addBatch({
    "shutdown": function() {
        app.close();
    }
});

suite.run();

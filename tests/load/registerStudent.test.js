var assert = require('assert');
var vows = require('vows');
var request = require('request');
var app = require('../../smileplug');
var logger = require('nlogger').logger(module);
var util = require('util');

PORT = 80;
LOAD_TEST_SIZE = 60;
BASE_URL = "http://localhost:" + PORT;

HEADERS_JSON = {
    'Content-Type': 'application/json'
};

HEADERS_ENCODED = {
    'Content-Type': 'application/x-www-form-urlencoded'
};
//
// Students are encoded here as:
// MSG={"TYPE":"HAIL","IP":"172.16.129.242","NAME":"test"}
var msgOK = "MSG=%7B%22TYPE%22%3A%22HAIL%22%2C%22IP%22%3A%22172.16.129.242%22%2C%22NAME%22%3A%22test%22%7D";
var msgOK2 = "MSG=%7B%22TYPE%22%3A%22HAIL%22%2C%22IP%22%3A%22172.16.129.243%22%2C%22NAME%22%3A%22test2%22%7D";
var studentseq = 1;

var students = {"172.16.129.242": {"name": "test", "ip": "172.16.129.242", "status": {"made": false, "solved": false}, "answers": [], "ratings": [], "score": 0}, "172.16.129.243": {"name": "test2", "ip": "172.16.129.243", "status": {"made": false, "solved": false}, "answers": [], "ratings": [], "score": 0}};
var hailmessages = [];

for (var i = 0; i < LOAD_TEST_SIZE; i++) {
    hailmessages.push(generateEncodedHail());
    logger.info('Generated: ' + hailmessages[i]);
}
// TODO:  We probably could use this to then generate the Hail message
// For now let's stick with generating the hail requests directly 
/*
 for (var i = 0; i < LOAD_TEST_SIZE; i ++) {
 students[i] = generateStudent();
 logger.info('Generated: ' + JSON.stringify(students[i]));
 }
 */
var suite = vows.describe('Tests "Register ' + LOAD_TEST_SIZE + ' Student"');
var url = BASE_URL + '/JunctionServerExecution/pushmsg.php';

suite.addBatch({
    "startup": function() {
        // Assume we only run on port 80 for production/rc server testing
        if (PORT != 80) {
            app.runServer(PORT);
        }
    }
});

suite.addBatch({
    "A POST to /JunctionServerExecution/pushmsg.php with data": {
        topic: function() {
            for (var i = 0; i < LOAD_TEST_SIZE; i++) {
                request({
                    uri: url,
                    method: 'POST',
                    headers: HEADERS_ENCODED,
                    body: hailmessages[i],
                }, this.callback);
            }
        },
        "should respond with 200": function(err, res, body) {
            assert.equal(res.statusCode, 200);
        },
        "should answer with ok": function(err, res, body) {
            assert.equal(res.body, "OK");
        }
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
        }
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
            assert.equal(res.body, JSON.stringify(students[0]));
        }
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
        }
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
            // students["172.16.129.243"] = student2;
            assert.equal(res.body, JSON.stringify(students[1]));
        }
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
        }
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
        }
    }
});

suite.addBatch({
    "shutdown": function() {
        if (PORT != 80) {
            app.close();
        }
    }
});

suite.run();

function generateEncodedHail() {
    var key = "MSG";
    var encodedmsg;
    var template = '{"TYPE":"HAIL","IP":"192.168.1.%s","NAME":"test%s"}';
    encodedmsg = key + '=' + encodeURIComponent(util.format(template, studentseq, studentseq));
    studentseq++;
    return encodedmsg;
}

function generateStudent() {
    var newstudent = {
        "name": "test" + studentseq,
        "ip": "172.16.129." + studentseq,
        "status": {"made": false, "solved": false},
        "answers": [],
        "ratings": [],
        "score": 0
    };
    studentseq++;
    return newstudent;
}

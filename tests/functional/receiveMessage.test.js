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

var questionOwner = 'default.15';
var question = {
    "NAME": "default.15",
    "Q": "qwerty",
    "A": "3",
    "IP": '10.0.2.15',
    "O4": "r",
    "O3": "e",
    "O2": "w",
    "O1": "q",
    "TYPE": 'QUESTION'
};

var encodedQuestion = 'MSG=%7B%22NAME%22%3A%22default.15%22%2C%22Q%22%3A%22qwerty%22%2C%22A%22%3A%223%22%2C%22IP%22%3A%2210.0.2.15%22%2C%22O4%22%3A%22r%22%2C%22O3%22%3A%22e%22%2C%22O2%22%3A%22w%22%2C%22O1%22%3A%22q%22%2C%22TYPE%22%3A%22QUESTION%22%7D';

var suite = vows.describe('Tests "Receive Questions"');
var url = BASE_URL + '/JunctionServerExecution/pushmsg.php';

suite.addBatch({
    "startup": function() {
        app.runServer(PORT);
    }
});

var encodedStudent1 = "MSG=%7B%22TYPE%22%3A%22HAIL%22%2C%22IP%22%3A%2210.0.2.15%22%2C%22NAME%22%3A%22test%22%7D";
suite.addBatch({
    "Register Student 1": {
        topic: function() {
            request({
                uri: BASE_URL + "/JunctionServerExecution/pushmsg.php",
                method: 'POST',
                headers: HEADERS_ENCODED,
                body: encodedStudent1,
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
    "A POST to /JunctionServerExecution/pushmsg.php with question": {
        topic: function() {
            request({
                uri: url,
                method: 'POST',
                headers: HEADERS_ENCODED,
                body: encodedQuestion,
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
    "A GET to /smile/question/default.15 should return the posted question": {
        topic: function() {
            request({
                uri: BASE_URL + '/smile/question/' + questionOwner,
                method: 'GET'
            }, this.callback);
        },
        "should have registered the question": function(err, res, body) {
            assert.equal(res.body, JSON.stringify([ question ]));
        },
    }
});

var questionTeacher = {
    "NAME": "teacher",
    "Q": "zxcv",
    "A": "4",
    "IP": '10.0.2.20',
    "O4": "z",
    "O3": "x",
    "O2": "c",
    "O1": "v",
    "TYPE": 'QUESTION'
};

suite.addBatch({
    "Insert teacher question": {
        topic: function() {
            request({
                uri: BASE_URL + "/smile/question",
                method: 'PUT',
                headers: HEADERS_JSON,
                body: JSON.stringify(questionTeacher)
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
    "A GET to /smile/question should return a list containing the posted question": {
        topic: function() {
            request({
                uri: BASE_URL + '/smile/question',
                method: 'GET'
            }, this.callback);
        },
        "should have registered the question": function(err, res, body) {
            var obj = {};
            obj[questionOwner] = [ question ];
            obj['teacher'] = [ questionTeacher ];
            assert.equal(res.body, JSON.stringify(obj));
        },
    }
});

suite.addBatch({
    "shutdown": function() {
        app.close();
    }
});

suite.run();

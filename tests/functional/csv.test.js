assert = require('assert');
vows = require('vows');
request = require('request');
app = require('../../smileplug');

PORT = 3001;
BASE_URL = "http://localhost:" + PORT;

HEADERS_JSON = {
    'Content-Type' : 'application/json'
};

HEADERS_CSV = {
    'Content-Type' : 'text/csv'
};

HEADERS_ENCODED = {
    'Content-Type' : 'application/x-www-form-urlencoded'
};

var csv = "question,choice1,choice2,choice3,choice4,has_image,answers\nWhat color is the sky?,Blue,Green,Yellow,Orange,,choice1\nQual a cor do céu?,Azul,Verde,Amarelo,Laranja,,choice1";

var suite = vows.describe('Tests "Questions as CSV"');

suite.addBatch({
    "startup" : function() {
        app.runServer(PORT);
    }
});

suite.addBatch({
    "A POST to /smile/question/csv with questions as csv" : {
        topic : function() {
            request({
                uri : BASE_URL + '/smile/question/csv',
                method : 'POST',
                headers : HEADERS_CSV,
                body : csv,
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
    "A GET to /smile/question should return a list containing the posted questions" : {
        topic : function() {
            request({
                uri : BASE_URL + '/smile/question',
                method : 'GET'
            }, this.callback);
        },
        "should have registered the questions" : function(err, res, body) {
            var obj = {};
            var questionTeacher1 = {
                NAME : 'teacher',
                Q : 'What color is the sky?',
                O1 : 'Blue',
                O2 : 'Green',
                O3 : 'Yellow',
                O4 : 'Orange',
                A : '1',
                TYPE : 'QUESTION'
            };
            var questionTeacher2 = {
                NAME : 'teacher',
                Q : 'Qual a cor do céu?',
                O1 : 'Azul',
                O2 : 'Verde',
                O3 : 'Amarelo',
                O4 : 'Laranja',
                A : '1',
                TYPE : 'QUESTION'
            };
            obj['teacher'] = [ questionTeacher1, questionTeacher2 ];
            assert.equal(JSON.stringify(obj), res.body);
        },
    }
});

suite.addBatch({
    "shutdown" : function() {
        app.close();
    }
});

suite.run();

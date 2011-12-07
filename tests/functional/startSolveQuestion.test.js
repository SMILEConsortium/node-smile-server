assert = require('assert');
vows = require('vows');
request = require('request');
app = require('../../smileplug');

PORT = 3001;
BASE_URL = "http://localhost:" + PORT;

HEADERS = {
  'Content-Type' : 'application/json'
};

var url = BASE_URL + "/smile/currentmessage";
var bodyContent = {};
var startSolveQuestionMessage = {
    'TYPE' : 'START_SOLVE',
    'NUMQ' : 1,
    'RANSWER' : ["3"]
}

var question = {
    "NAME" : "default.15",
    "Q" : "qwerty",
    "A" : "3",
    "IP" : '10.0.2.15',
    "O4" : "r",
    "O3" : "e",
    "O2" : "w",
    "O1" : "q",
    "TYPE" : 'QUESTION'
  }

var suite = vows.describe('Tests "Start Solve Question"');

suite.addBatch({
  "startup" : function() {
    app.runServer(PORT);
  }
});

suite.addBatch({
  "Insert a question" : {
    topic : function() {
      request({
        uri : BASE_URL + "/smile/question",
        method : 'PUT',
        headers : HEADERS,
        body : JSON.stringify(question)
      }, this.callback);
    },
    "should respond with 200" : function(err, res, body) {
      assert.equal(res.statusCode, 200);
    },
    "should answer with ok" : function(err, res, body) {
      assert.equal(res.body, "OK");
    }
  }
});

suite.addBatch({
  "A PUT to /smile/startsolvequestion without data" : {
      topic : function() {
        request({
          uri : BASE_URL + '/smile/startsolvequestion',
          method : 'PUT',
          headers : HEADERS,
          body : JSON.stringify(bodyContent)
        }, this.callback);
      },
      "should respond with 200" : function(err, res, body) {
        assert.equal(res.statusCode, 200);
      },
      "should answer with ok" : function(err, res, body) {
        assert.equal(res.body, "OK");
      }
    }
  }).addBatch({
    "A GET to /smile/currentmessage" : {
      topic : function() {
        request({
          uri : url,
          method : 'GET'
        }, this.callback);
      },
      "should have supplied data" : function(err, res, body) {
        startSolveQuestionMessage['TIME_LIMIT'] = 10;
        assert.equal(res.body, JSON.stringify(startSolveQuestionMessage));
      }
    }
  }).addBatch({
    "A GET to /JunctionServerExecution/current/MSG/smsg.txt" : {
      topic : function() {
        request({
          uri : BASE_URL + "/JunctionServerExecution/current/MSG/smsg.txt",
          method : 'GET'
        }, this.callback);
      },
      "should have supplied data" : function(err, res, body) {
        startSolveQuestionMessage['TIME_LIMIT'] = 10;
        assert.equal(res.body, JSON.stringify(startSolveQuestionMessage));
      }
    }
  });

suite.addBatch({
  "A PUT to /smile/startsolvequestion without data" : {
      topic : function() {
        request({
          uri : BASE_URL + '/smile/startsolvequestion',
          method : 'PUT',
          headers : HEADERS,
          body : JSON.stringify({ 'TIME_LIMIT' : 20 })
        }, this.callback);
      },
      "should respond with 200" : function(err, res, body) {
        assert.equal(res.statusCode, 200);
      },
      "should answer with ok" : function(err, res, body) {
        assert.equal(res.body, "OK");
      }
    }
  }).addBatch({
    "A GET to /smile/currentmessage" : {
      topic : function() {
        request({
          uri : url,
          method : 'GET'
        }, this.callback);
      },
      "should have supplied data" : function(err, res, body) {
        startSolveQuestionMessage['TIME_LIMIT'] = 20;
        assert.equal(res.body, JSON.stringify(startSolveQuestionMessage));
      }
    }
  }).addBatch({
    "A GET to /JunctionServerExecution/current/MSG/smsg.txt" : {
      topic : function() {
        request({
          uri : BASE_URL + "/JunctionServerExecution/current/MSG/smsg.txt",
          method : 'GET'
        }, this.callback);
      },
      "should have supplied data" : function(err, res, body) {
        startSolveQuestionMessage['TIME_LIMIT'] = 20;
        assert.equal(res.body, JSON.stringify(startSolveQuestionMessage));
      }
    }
  });

suite.addBatch({
  "shutdown" : function() {
    app.close();
  }
});
suite.run();

assert = require('assert');
vows = require('vows');
request = require('request');
app = require('../../smileplug');

PORT = 3001;
BASE_URL = "http://localhost:" + PORT;

HEADERS_JSON = {
  'Content-Type' : 'application/json'
};

HEADERS_ENCODED = {
  'Content-Type' : 'application/x-www-form-urlencoded'
};

var questionOwner = 'default.15';
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

var question2 = {
  "NAME" : "default.15",
  "Q" : "asdfgh",
  "A" : "2",
  "IP" : '10.0.2.15',
  "O4" : "a",
  "O3" : "s",
  "O2" : "d",
  "O1" : "f",
  "TYPE" : 'QUESTION'
}

var student = {
  "name" : "default.15",
  "ip" : "10.0.2.15",
}

var status = {"NAME":"default.15","MADE":"N","SOLVED":"Y","NUMQ":2,"YOUR_ANSWERS":[3,3]}

var encodedAnswer = 'MSG=%7B%22MYRATING%22%3A%5B4%2C4%5D%2C%22MYANSWER%22%3A%5B3%2C3%5D%2C%22NAME%22%3A%22default.15%22%2C%22TYPE%22%3A%22ANSWER%22%2C%22IP%22%3A%2210.0.2.15%22%7D';
var suite = vows.describe('Tests "Receive Questions"');
var url = BASE_URL + '/JunctionServerExecution/pushmsg.php';

suite.addBatch({
  "startup" : function() {
    app.runServer(PORT);
  }
});

suite.addBatch({
  "A POST to /smile/student with data" : {
    topic : function() {
      request({
        uri : BASE_URL + '/smile/student',
        method : 'POST',
        headers : HEADERS_JSON,
        body : JSON.stringify(student),
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
  "A POST to /smile/question with data" : {
    topic : function() {
      request({
        uri : BASE_URL + '/smile/question',
        method : 'POST',
        headers : HEADERS_JSON,
        body : JSON.stringify(question),
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
  "A POST to /smile/question with data" : {
    topic : function() {
      request({
        uri : BASE_URL + '/smile/question',
        method : 'POST',
        headers : HEADERS_JSON,
        body : JSON.stringify(question2),
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
suite
    .addBatch({
      "A GET to /smile/question should return a list containing the posted question" : {
        topic : function() {
          request({
            uri : BASE_URL + '/smile/question',
            method : 'GET'
          }, this.callback);
        },
        "should have registered the question" : function(err, res, body) {
          var obj = {};
          obj[questionOwner] = [ question, question2 ];
          assert.equal(res.body, JSON.stringify(obj));
        },
      }
    });

suite
    .addBatch({
      "A GET to /JunctionServerExecution/current/0.html should return a html with the posted question" : {
        topic : function() {
          request({
            uri : BASE_URL + '/JunctionServerExecution/current/0.html',
            method : 'GET'
          }, this.callback);
        },
        "should be able to show the registered the question to the user" : function(
            err, res, body) {
          var questionNumber = 0;
          var studentName = question.NAME;
          html = "";
          html += "<html>\n<head>Question No." + questionNumber
              + " </head>\n<body>\n";
          html += "<p>(Question created by " + studentName + ")</p>\n";
          html += "<P>Question:\n";
          html += question.Q;
          html += "\n</P>\n";

          // TODO: handle image
          if (question.hasOwnProperty("PIC")) {
            html += "<img class=\"main\" src=\"" + questionNumber
                + ".jpg\" width=\"200\" height=\"180\"/>\n";
          }

          html += "<P>\n";
          html += "(1) " + question.O1 + "<br>\n";
          html += "(2) " + question.O2 + "<br>\n";
          html += "(3) " + question.O3 + "<br>\n";
          html += "(4) " + question.O4 + "<br>\n";
          html += "</P>\n</body></html>\n";
          assert.equal(res.body, html);

        },
      }
    });
suite.addBatch({
  "A POST to /JunctionServerExecution/pushmsg.php with an answer" : {
    topic : function() {
      request({
        uri : url,
        method : 'POST',
        headers : HEADERS_ENCODED,
        body : encodedAnswer,
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
  "A GET to /JunctionServerExecution/current/MSG/10.0.2.15.txt should return the posted student" : {
    topic : function() {
      request({
        uri : BASE_URL + '/JunctionServerExecution/current/MSG/10.0.2.15.txt',
        method : 'GET'
      }, this.callback);
    },
    "student should have status" : function(err, res, body) {
      assert.equal(res.body, JSON.stringify(status));
    },
  }
});

suite.addBatch({
  "shutdown" : function() {
    app.close();
  }
});

suite.run();

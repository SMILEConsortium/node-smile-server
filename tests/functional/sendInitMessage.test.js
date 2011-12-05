assert = require('assert');
vows = require('vows');
request = require('request');
app = require('../../smileplug');

var port = 3001;
app.runServer(port);
BASE_URL = "http://localhost:" + port;

HEADERS = {
  'Content-Type' : 'application/json'
};

var MESSAGE_WAIT_CONNECT = JSON.stringify({
  'TYPE' : 'WAIT_CONNECT'
});

function configureBatch(suite, context, uri, bodyContent) {
  var url = BASE_URL + uri;
  return suite.addBatch({
    context : {
      topic : function() {
        request({
          uri : url,
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
    context : {
      topic : function() {
        request({
          uri : BASE_URL + "/smile/currentmessage",
          method : 'GET',
        }, this.callback);
      },
      "should have supplied data" : function(err, res, body) {
        assert.equal(res.body, MESSAGE_WAIT_CONNECT);
      }
    }
  }).addBatch({
    context : {
      topic : function() {
        request({
          uri : BASE_URL + "/JunctionServerExecution/current/MSG/smsg.txt",
          method : 'GET'
        }, this.callback);
      },
      "should have supplied data" : function(err, res, body) {
        assert.equal(res.body, MESSAGE_WAIT_CONNECT);
      }
    }
  });
};

var suite = vows.describe('Tests startmakequestion');
suite = configureBatch(suite, "A PUT to /smile/sendinitmessage without data",
    "/smile/sendinitmessage", {});
suite = configureBatch(suite, "A PUT to /smile/sendinitmessage with data",
    "/smile/sendinitmessage", {
      "PING" : "PONG"
    });
suite.addBatch({
  "shutdown" : function() {
    app.close();
  }
});
suite.run();

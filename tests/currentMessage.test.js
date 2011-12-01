assert = require('assert');
vows = require('vows');
request = require('request');
app = require('../smileplug');

var port = 3001;
app.runServer(port);
BASE_URL = "http://localhost:" + port;

HEADERS = {
  'Content-Type' : 'application/json'
};

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
          uri : url,
          method : 'GET'
        }, this.callback);
      },
      "should have supplied data" : function(err, res, body) {
        assert.equal(res.body, JSON.stringify(bodyContent));
      }
    }
  });
};

var suite = vows.describe('Tests currentmessage');
suite = configureBatch(suite, "A PUT to /smile/currentmessage without data",
    "/smile/currentmessage", {});
suite = configureBatch(suite, "A PUT to /smile/currentmessage with data",
    "/smile/currentmessage", {
      "PING" : "PONG"
    });
suite = configureBatch(suite, "A PUT to /JunctionServerExection/current/MSG/smsg.txt with data",
    "/smile/currentmessage", {
      "PING" : "PONG"
    });
suite.addBatch({
  "shutdown" : function() {
    app.close();
  }
});
suite.run();

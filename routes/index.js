OK = 'OK';

HTTP_STATUS_OK = '200';

var messages = {};
messages.current = JSON.stringify({});

function setCurrentMessage(message) {
  messages.current = message;
}

function getCurrentMessage() {
  return messages.current;
}

exports.index = function(req, res) {
  res.render('index', {
    title : 'Smile Plug Server'
  });
};

exports.handleCurrentMessage = function(req, res) {
  var method = req.method;
  switch (method) {
    case 'PUT':
      setCurrentMessage(req.body);
      res.sendText(HTTP_STATUS_OK, OK);
    case 'GET':
      res.sendJSON(HTTP_STATUS_OK, getCurrentMessage());
  }
};
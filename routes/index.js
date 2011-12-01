OK = 'OK';

HTTP_STATUS_OK = '200';

var MESSAGE_START_MAKE_QUESTION = { 'TYPE' : 'START_MAKE' };

var messages = {};
messages.current = {};

function setCurrentMessage(message) {
  messages.current = message;
}

function getCurrentMessage() {
  return messages.current;
}

exports.handleCurrentMessageGet = function(req, res) {
  res.sendJSON(HTTP_STATUS_OK, getCurrentMessage());
};

exports.handleCurrentMessagePut = function(req, res) {
  setCurrentMessage(req.body);
  res.sendText(HTTP_STATUS_OK, OK);
};

exports.handleStartMakeQuestionPut = function(req, res) {
  setCurrentMessage(MESSAGE_START_MAKE_QUESTION);
  res.sendText(HTTP_STATUS_OK, OK);
};

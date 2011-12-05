var Questions = require('../lib/smile/question').Questions;

OK = 'OK';

HTTP_STATUS_OK = '200';

var MESSAGE_START_MAKE_QUESTION = { 'TYPE' : 'START_MAKE' };
var MESSAGE_WAIT_CONNECT = { 'TYPE' : 'WAIT_CONNECT' };

var messages = {};
messages.current = {};
messages.past = []

var questions = new Questions();

function setCurrentMessage(message) {
  messages.current = message;
  messages.past.push(message);
}

function getCurrentMessage() {
  return messages.current;
}

exports.handleQuestionGet = function(req, res) {
  res.sendJSON(HTTP_STATUS_OK, questions.getQuestions(req.id));
};

exports.handleQuestionPut = function(req, res) {
  var message = req.body;
  var type = message.TYPE || null;
  switch (type) {
  case null:
    // Ignoring the message does not have a type
    console.warn("Unrecognized type: " + type)
    break;
  case 'QUESTION':
    questions.addQuestion(message);
    break;
  case 'QUESTION_PIC':
    questions.addQuestion(message);
    break; 
  default:
    // TODO: Raise error
    console.warn("Unrecognized type: " + type)
    break;
  }
  if (req.id) {
    res.sendText(HTTP_STATUS_OK, "This server does not support question update. The question you sent has been added to: " + req.id);
  } else {
    res.sendText(HTTP_STATUS_OK, OK);
  }
};

exports.handlePushMsgPost = function(req, res) {
  var message = req.body.MSG;
  req.body = JSON.parse(message);
  exports.handleQuestionPut(req, res);
};

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

exports.handleSendInitMessagePut = function(req, res) {
  setCurrentMessage(MESSAGE_WAIT_CONNECT);
  res.sendText(HTTP_STATUS_OK, OK);
};

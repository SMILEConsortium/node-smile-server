var Questions = require('../lib/smile/question').Questions;
var Students = require('../lib/smile/student').Students;
var Student = require('../lib/smile/student').Student;
var StudentsWrapper = require('../lib/smile/student').StudentsWrapper;

OK = 'OK';

HTTP_STATUS_OK = '200';

var MESSAGE_START_MAKE_QUESTION = {
  'TYPE' : 'START_MAKE'
};
var MESSAGE_WAIT_CONNECT = {
  'TYPE' : 'WAIT_CONNECT'
};

var messages = {};
messages.current = {};
messages.past = []

var questions = new Questions();
var students = new Students();

var studentsWrapper = new StudentsWrapper(students);

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

exports.handleQuestionGetAll = function(req, res) {
  res.sendJSON(HTTP_STATUS_OK, questions.getAll());
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

exports.handleStudentGetAll = function(req, res) {
  res.sendJSON(HTTP_STATUS_OK, students.getAll());
};

exports.handleStartSolveQuestionPut = function(req, res) {
  var timeLimit = 10; // The same time limit of old implementation.
  if (req.body.TIME_LIMIT) {
    timeLimit = req.body.TIME_LIMIT;
  }
  var numberOfQuestions = questions.getNumberOfQuestions();
  var rightAnswers = questions.getRightAnswers();
  var message = {};
  message['TYPE'] = 'START_SOLVE';
  message['NUMQ'] = numberOfQuestions;
  message['RANSWER'] = rightAnswers;
  message['TIME_LIMIT'] = timeLimit;

  setCurrentMessage(message);
  res.sendText(HTTP_STATUS_OK, OK);
};

exports.handleStudentStatusGet = function(req, res) {
  res.sendJSON(HTTP_STATUS_OK, students.getStudentStatus(req.id));
};

exports.handleStudentPut = function(req, res) {
  var message = req.body;
  var student = new Student(message.name, message.ip);
  students.addStudent(student);
  res.sendText(HTTP_STATUS_OK, OK);
};

//
// Backward compatibility
//

exports.handlePushMessage = function(req, res) {
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
  case 'HAIL':
    studentsWrapper.addStudent(message);
    break;
  case 'ANSWER':
    studentsWrapper.registerAnswer(message);
    break;
  default:
    console.warn("Unrecognized type: " + type)
    res.sendJSON(404, { 'error' : "Unrecognized type: " + type})
    break;
  }
  if (req.id) {
    res
        .sendText(
            HTTP_STATUS_OK,
            "This server does not support question update. The question you sent has been added to: "
                + req.id);
  } else {
    res.sendText(HTTP_STATUS_OK, OK);
  }
};

exports.handlePushMsgPost = function(req, res) {
  var message = req.body.MSG;
  req.body = JSON.parse(message);
  exports.handlePushMessage(req, res);
};

exports.handleStudentStatusGetByIP = function(req, res) {
  res.sendJSON(HTTP_STATUS_OK, studentsWrapper.getStudentStatus(req.id, questions.getNumberOfQuestions()));
};

exports.handleQuestionHtmlGet = function(req, res) {
  var questionNumber = parseInt(req.id);
  var question = questions.getList()[questionNumber];
  var studentName = question.NAME; // XXX
  res.writeHead(200, {
    'Content-Type' : 'text/html',
  });
  res.write("<html>\n<head>Question No." + questionNumber
      + " </head>\n<body>\n");
  res.write("<p>(Question created by " + studentName + ")</p>\n");
  res.write("<P>Question:\n");
  res.write(question.Q);
  res.write("\n</P>\n");

  if (question.hasOwnProperty("PIC")) {
    res.write("<img class=\"main\" src=\"" + questionNumber
        + ".jpg\" width=\"200\" height=\"180\"/>\n");
  }

  res.write("<P>\n");
  res.write("(1) " + question.O1 + "<br>\n");
  res.write("(2) " + question.O2 + "<br>\n");
  res.write("(3) " + question.O3 + "<br>\n");
  res.write("(4) " + question.O4 + "<br>\n");
  res.write("</P>\n</body></html>\n");
  res.end();
};

exports.handleQuestionImageGet = function(req, res) {
  var questionNumber = parseInt(req.id);
  var question = questions.getList()[questionNumber];
  var dataBuffer = new Buffer(question.PIC, 'base64');
  res.writeHead(200, {
    'Content-Type' : 'image/jpeg',
  });
  res.write(dataBuffer);
  res.end();
};

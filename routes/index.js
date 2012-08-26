var Game = require('../lib/smile/game').Game;
var Student = require('../lib/smile/student').Student;
var js = require('../lib/js');

OK = 'OK';

HTTP_STATUS_OK = '200';

var MESSAGE_START_MAKE_QUESTION = {
  'TYPE' : 'START_MAKE'
};
var MESSAGE_WAIT_CONNECT = {
  'TYPE' : 'WAIT_CONNECT'
};

var game = new Game();

exports.handleQuestionGet = function(req, res) {
  var questions = game.questions.getQuestions(req.id);
  if (questions instanceof Error) {
    res.handleError(questions);
  } else {
    return res.sendJSON(HTTP_STATUS_OK, questions);
  }
};

exports.handleQuestionGetAll = function(req, res) {
  return res.sendJSON(HTTP_STATUS_OK, game.questions.getAll());
};

exports.handleCurrentMessageGet = function(req, res) {
  return res.sendJSON(HTTP_STATUS_OK, game.getCurrentMessage());
};

exports.handleCurrentMessagePut = function(req, res) {
  game.setCurrentMessage(req.body);
  return res.sendText(HTTP_STATUS_OK, OK);
};

exports.handleSmileRootGet = function(req, res) {
  return res.sendText(HTTP_STATUS_OK, OK);
};

exports.handleStartMakeQuestionPut = function(req, res) {
  game.setCurrentMessage(MESSAGE_START_MAKE_QUESTION);
  return res.sendText(HTTP_STATUS_OK, OK);
};

exports.handleSendInitMessagePut = function(req, res) {
  game.setCurrentMessage(MESSAGE_WAIT_CONNECT);
  return res.sendText(HTTP_STATUS_OK, OK);
};

exports.handleStudentGetAll = function(req, res) {
  return res.sendJSON(HTTP_STATUS_OK, game.students.getAll());
};

exports.handleStartSolveQuestionPut = function(req, res) {
  var timeLimit = 10; // The same time limit of old implementation.
  if (req.body.TIME_LIMIT) {
    timeLimit = req.body.TIME_LIMIT;
  }
  var numberOfQuestions = game.questions.getNumberOfQuestions();
  var rightAnswers = game.questions.getRightAnswers();
  var message = {};
  message['TYPE'] = 'START_SOLVE';
  message['NUMQ'] = numberOfQuestions;
  message['RANSWER'] = rightAnswers;
  message['TIME_LIMIT'] = timeLimit;

  game.setCurrentMessage(message);
  return res.sendText(HTTP_STATUS_OK, OK);
};

exports.handleStudentStatusGet = function(req, res) {
  var studentStatus = game.students.getStudentStatus(req.id);
  if (studentStatus instanceof Error) {
    res.handleError(studentStatus);
  } else {
    return res.sendJSON(HTTP_STATUS_OK, studentStatus);
  }
};

exports.handleStudentPut = function(req, res) {
  var message = req.body;
  var student = new Student(message.name, message.ip);
  game.students.addStudent(student);
  return res.sendText(HTTP_STATUS_OK, OK);
};

exports.handleResultsGet = function(req, res) {
  return res.sendJSON(HTTP_STATUS_OK, game.calculateResults());
};

exports.handleSendShowResultsPut = function(req, res) {
  var result = game.calculateResults();
  var message = {};
  message['TYPE'] = 'START_SHOW';
  message['WINSCORE'] = result.bestScoredStudentNames;
  message['WINRATING'] = result.bestRatedQuestionStudentNames;
  message['HIGHSCORE'] = result.winnerScore;
  message['HIGHRATING'] = result.winnerRating;
  message['NUMQ'] = result.numberOfQuestions;
  message['RANSWER'] = result.rightAnswers;
  message["AVG_RATINGS"] = result.averageRatings;
  message["RPERCENT"] = result.questionsCorrectPercentage;
  game.setCurrentMessage(message);
  return res.sendText(HTTP_STATUS_OK, OK);
};

exports.handleAllMessagesGet = function(req, res) {
  return res.sendJSON(HTTP_STATUS_OK, game.messages.past);
};

reset = function() {
  oldGame = game;
  game = new Game();
  delete oldGame;
}

exports.handleResetGet = function(req, res) {
  reset();
  return res.sendText(HTTP_STATUS_OK, OK);
};

exports.handleResetPut = function(req, res) {
  reset();
  return res.sendText(HTTP_STATUS_OK, OK);
};

//
// Backward compatibility
//

exports.handlePushMessage = function(req, res) {
  var message = req.body;
  game.registerMessage(message);
  var type = message.TYPE || null;
  var error;
  switch (type) {
  case null:
    // Ignoring the message does not have a type
    console.warn("Unrecognized type: " + type);
    break;
  case 'QUESTION':
    error = game.addQuestion(message);
    break;
  case 'QUESTION_PIC':
    error = game.addQuestion(message);
    break;
  case 'HAIL':
    error = game.studentsWrapper.addStudent(message);
    break;
  case 'ANSWER':
    error = game.registerAnswerByMessage(message);
    break;
  default:
    error = new Error("Unrecognized type: " + type);
    break;
  }
  if (error) {
    // Something wrong happened
    return res.handleError(error);
  } else {
    if (req.id) {
      return res.sendText(HTTP_STATUS_OK, "This server does not support question update. The question you sent has been added to: " + req.id);
    } else {
      return res.sendText(HTTP_STATUS_OK, OK);
    }
  }
};

exports.handlePushMsgPost = function(req, res) {
  var message = req.body.MSG;
  req.body = JSON.parse(message);
  exports.handlePushMessage(req, res);
};

exports.handleStudentStatusGetByIP = function(req, res) {
  var studentStatus = game.studentsWrapper.getStudentStatus(req.id, game.questions.getNumberOfQuestions());
  if (studentStatus instanceof Error) {
    res.handleError(studentStatus);
  } else {
    return res.sendJSON(HTTP_STATUS_OK, studentStatus);
  }
};

exports.handleQuestionHtmlGet = function(req, res) {
  var questionNumber = parseInt(req.id);
  var question = game.questions.getList()[questionNumber];
  if (!question) {
    return res.handleError(js.JumboError.notFound('Question not found: ' + questionNumber));
  }
  var studentName = question.NAME; // XXX
  res.writeHead(200, {
    'Content-Type' : 'text/html',
  });
  res.write("<html>\n<head>Question No." + (questionNumber + 1) + " </head>\n<body>\n");
  res.write("<p>(Question created by " + studentName + ")</p>\n");
  res.write("<P>Question:\n");
  res.write(question.Q);
  res.write("\n</P>\n");

  if (question.TYPE == "QUESTION_PIC") {
    res.write("<img class=\"main\" src=\"" + questionNumber + ".jpg\" width=\"200\" height=\"180\"/>\n");
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
  var question = game.questions.getList()[questionNumber];
  if (!question) {
    return res.handleError(js.JumboError.notFound('Question not found: ' + questionNumber));
  }
  if (question.TYPE != "QUESTION_PIC") {
    return res.handleError(js.JumboError.notFound('Question does not have picture: ' + questionNumber));
  }
  var dataBuffer = new Buffer(game.questions.getQuestionPicture(questionNumber), 'base64');
  res.writeHead(200, {
    'Content-Type' : 'image/jpeg',
  });
  res.write(dataBuffer);
  res.end();
};

exports.handleQuestionResultHtmlGet = function(req, res) {
  var questionNumber = parseInt(req.id);
  var question = game.questions.getList()[questionNumber];
  if (!question) {
    return res.handleError(js.JumboError.notFound('Question not found: ' + questionNumber));
  }
  var studentName = question.NAME; // XXX
  res.writeHead(200, {
    'Content-Type' : 'text/html',
  });
  res.write("<html>\n<head>Question No." + (questionNumber + 1) + " </head>\n<body>\n");
  res.write("<p>(Question created by " + studentName + ")</p>\n");
  res.write("<P>Question:\n");
  res.write(question.Q);
  res.write("\n</P>\n");

  if (question.TYPE == "QUESTION_PIC") {
    res.write("<img class=\"main\" src=\"" + questionNumber + ".jpg\" width=\"200\" height=\"180\"/>\n");
  }

  res.write("<P>\n");
  res.write("(1) " + question.O1 + (parseInt(question.A) === 1 ? "<font color = red>&nbsp; &#10004;</font>" : "") + "<br>\n");
  res.write("(2) " + question.O2 + (parseInt(question.A) === 2 ? "<font color = red>&nbsp; &#10004;</font>" : "") + "<br>\n");
  res.write("(3) " + question.O3 + (parseInt(question.A) === 3 ? "<font color = red>&nbsp; &#10004;</font>" : "") + "<br>\n");
  res.write("(4) " + question.O4 + (parseInt(question.A) === 4 ? "<font color = red>&nbsp; &#10004;</font>" : "") + "<br>\n");
  res.write("</P>\n");
  res.write("Correct Answer: " + question.A + "<br>\n");
  res.write("<P> Num correct people: " + game.questionCorrectCountMap[questionNumber] + " / " + game.students.getNumberOfStudents() + "<br>\n");
  res.write("Average rating: " + game.getQuestionAverageRating(questionNumber) + "<br>\n");

  res.write("</body></html>\n");

  res.end();
};

exports.handleEchoClientIP = function(req, res) {
	var clientip = null;
	try {
		clientip = req.headers['x-forwarded-for'];
	}
	catch (e) {
		clientip = req.connection.remoteAddress;
	}
	if (!clientip) {
		clientip = '127.0.0.1';
	}
	console.log(clientip);
	return res.sendJSON(HTTP_STATUS_OK, {'ip': clientip});
};

var js = require('../js');
var question = exports;

var Questions = function Questions() {
  this.currentQuestions = {};
  this.numberOfQuestions = 0;
  this.listOfQuestions = [];
}

Questions.prototype.addQuestion = function addQuestion(question) {
  if (!question.NAME) {
    return js.JumboError.unexpected('Question registration message must contain a valid NAME property.');
  }
  var questionUserName = this.currentQuestions[question.NAME];
  if (question.PIC) {
    question.PICURL = '/smile/questionview/' + this.listOfQuestions.length + '.jpg'
  }
  if (questionUserName) {
    questionUserName.push(question);
  } else {
    this.currentQuestions[question.NAME] = [question];
  }
  this.listOfQuestions.push(question);
  this.numberOfQuestions++;
}

Questions.prototype.getQuestions = function getQuestions(name) {
  var questions = this.currentQuestions[name];
  if (!questions) {
    return js.JumboError.notFound('There are no questions associated with: ' + name);
  }
  return questions;
}

Questions.prototype.getAll = function getAll() {
  return this.currentQuestions;
}

Questions.prototype.getList = function getList() {
  return this.listOfQuestions;
}

Questions.prototype.getRightAnswers = function getRightAnswers() {
  var rightAnswers = [];
  var questions = this.getAll();
  for (var key in questions) {
    var questionArray = questions[key];
    for (var i in questionArray) {
      var question = questionArray[i];
      rightAnswers.push(parseInt(question.A));
    }
  }
  return rightAnswers;
}

Questions.prototype.getAll = function getAll() {
  return this.currentQuestions;
}

Questions.prototype.getNumberOfQuestions = function getNumberOfQuestions() {
  return this.numberOfQuestions;
}

question.Questions = Questions;
var events = require('events');
var Questions = require('./question').Questions;
var Students = require('./student').Students;
var Student = require('./student').Student;
var StudentsWrapper = require('./student').StudentsWrapper;

var game = exports;

var Game = function Game() {
  this.questions = new Questions();
  this.students = new Students();
  this.studentsWrapper = new StudentsWrapper(this.students);
  this.messages = {};
  this.messages.current = {};
  this.messages.past = [];
  this.questionRatings = {};
}

Game.prototype.setCurrentMessage = function setCurrentMessage(message) {
  this.messages.current = message;
  this.messages.past.push(message);
}

Game.prototype.getCurrentMessage = function getCurrentMessage() {
  return this.messages.current;
}

Game.prototype.registerAnswer = function registerAnswer(message) {
  var student = this.studentsWrapper.registerAnswer(message, this.eventEmitter);
  this.answerRegistered(student);
}

Game.prototype.answerRegistered = function answerRegistered(student) {
  this.calcScoreAndRating(student);
}

Game.prototype.calcScoreAndRating = function calcScoreAndRating(student) {
  var listOfQuestions = this.questions.getList();
  var studentScore = 0;
  for (var i=0; i < listOfQuestions.length; i++) {
    var correctAnswer = parseInt(listOfQuestions[i].A);
    var studentAnswer = student.getAnswer(i);
    if (correctAnswer === studentAnswer) {
      studentScore++;
    }
    var studentRating = student.getRating(i);
    var questionRatingList = this.questionRatings[i] || [];
    questionRatingList.push(studentRating);
    this.questionRatings[i] = questionRatingList;
  }
  student.setScore(studentScore);
}

Game.prototype.getQuestionAverageRating = function getAverageRating(questionIndex) {
  var ratings = this.questionRatings[questionIndex];
  var sum = 0;
  for (var n in ratings) {
    sum += ratings[n];
  }
  return sum/ratings.length;
}

game.Game = Game;

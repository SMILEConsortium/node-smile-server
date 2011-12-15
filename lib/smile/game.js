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
  console.info("HEY!!");
  console.log(student);
  this.calcScoreAndRating(student);
}

Game.prototype.calcScoreAndRating = function calcScoreAndRating(student) {
  var listOfQuestions = this.questions.getList();
  var studentScore = 0;
  for (var i=0; i < listOfQuestions.length; i++) {
    var correctAnswer = parseInt(listOfQuestions[i].A);
    var studentAnswer = student.getAnswer(i);
    console.info("CORRECT: " + typeof correctAnswer);
    console.info("STUDENT: " + typeof studentAnswer);
    if (correctAnswer === studentAnswer) {
      studentScore++;
    }
  }
  student.setScore(studentScore);
  console.info(studentScore);
}

game.Game = Game;
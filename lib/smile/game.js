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

Game.prototype.getQuestionAverageRating = function getAverageRating(questionIndex) {
  var ratings = this.questionRatings[questionIndex];
  var sum = 0;
  for (var n in ratings) {
    sum += ratings[n];
  }
  return sum/ratings.length;
}

Game.prototype.calculateResults = function calculateResults() {
  result.calculateResults(this.students, this.questions.getList(), this.questionRatings);
}

Game.prototype.calcScoreAndRating = function calcScoreAndRating(student) {
  var studentScore = 0;
  var listOfQuestions = this.questions.getList();
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
  return student;
}

Game.prototype.calculateResults = function calculateResults() {
  var listOfQuestions = this.questions.getList();
  var scoresMap = {};
  var winnerScore = 0;
  for (key in this.students.getAll()) {
    var student = this.students.getStudent(key);
    this.calcScoreAndRating(student, this.listOfQuestions, this.questionRatings);
    var studentScore = student.getScore();
    if (winnerScore <= studentScore) {
      winnerScore = studentScore;
      if (scoresMap.hasOwnProperty(studentScore)) {
        scoresMap[studentScore].push(student.getName());
      } else {
        scoresMap[studentScore] = [student.getName()];
      }
    }
  }
  
  var winnerRating = 0;
  var ratingsMap = {};
  for (key in this.questionRatings) {
    var question = listOfQuestions[key];
    var averageRating = this.getQuestionAverageRating(key);
    if (winnerRating <= averageRating) {
      winnerRating = averageRating;
      if (ratingsMap.hasOwnProperty(averageRating)) {
        ratingsMap[averageRating].push(question.NAME);
      } else {
        ratingsMap[averageRating] = [question.NAME];
      }
    }
  }
  
  var result = new Result();
  result.winnerScore = winnerScore;
  result.bestScoredStudentNames = scoresMap[winnerScore];
  result.winnerRating = winnerRating;
  result.bestRatedQuestionStudentNames = ratingsMap[winnerRating];
  result.numberOfQuestions = this.questions.getNumberOfQuestions();
  result.rightAnswers = this.questions.getRightAnswers();
  return result;
  
}

game.Game = Game;

var Result = function Result() {
  this.winnerScore = 0;
  this.winnerRating = 0;
  this.bestScoredStudentNames = [];
  this.bestRatedQuestionStudentNames = [];
  this.numberOfQuestions = 0;
  this.rightAnswers = [];
}


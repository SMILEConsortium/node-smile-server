var events = require('events');
var Questions = require('./question').Questions;
var Students = require('./student').Students;
var Student = require('./student').Student;
var StudentsWrapper = require('./student').StudentsWrapper;
var js = require('../js');

var game = exports;

var Game = function Game() {
  this.questions = new Questions();
  this.students = new Students();
  this.studentsWrapper = new StudentsWrapper(this.students);
  this.messages = {};
  this.messages.current = {};
  this.messages.past = [];
  this.questionRatings = {};
  this.questionCorrectCountMap = {};
}

Game.prototype.setCurrentMessage = function setCurrentMessage(message) {
  this.messages.current = message;
  this.registerMessage(message);
}

Game.prototype.registerMessage = function registerMessage(message) {
  this.messages.past.push(message);
}

Game.prototype.getCurrentMessage = function getCurrentMessage() {
  return this.messages.current;
}

Game.prototype.addQuestion = function addQuestion(message) {
  var hasIp = message.hasOwnProperty("IP");
  if (!hasIp) {
    return js.JumboError.unexpected('The question provided must contain an IP property.');
  }
  if (message.NAME == 'teacher') {
    return this.questions.addQuestion(message);
  } else {
    if (this.students.hasStudent(message.IP)) {
      this.students.getStudent(message.IP).setMadeQuestion(true);
      return this.questions.addQuestion(message);
    } else {
      return js.JumboError.unexpected('The question provided refers to inexistent student: ' + message.IP);
    }
  }
}

Game.prototype.registerAnswerByMessage = function registerAnswerByMessage(message) {
  var student = this.studentsWrapper.registerAnswer(message);
  if (student instanceof Error) {
    return student;
  }
  this.answerRegistered(student);
}

Game.prototype.registerAnswer = function registerAnswer(student, answers, ratings) {
  student.registerAnswers(answers);
  student.registerRatings(ratings);
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

Game.prototype.calcScoreAndRating = function calcScoreAndRating(student) {
  var studentScore = 0;
  var listOfQuestions = this.questions.getList();
  for (var i=0; i < listOfQuestions.length; i++) {
    var correctAnswer = parseInt(listOfQuestions[i].A);
    var studentAnswer = student.getAnswer(i);
    var questionCorrectCountMap = this.questionCorrectCountMap;
    var currentQuestionCorrectCount = 0;
    if (questionCorrectCountMap.hasOwnProperty(i)) {
      currentQuestionCorrectCount = questionCorrectCountMap[i];
    }
    if (correctAnswer === studentAnswer) {
      studentScore++;
      currentQuestionCorrectCount++;
    }
    questionCorrectCountMap[i] = currentQuestionCorrectCount;
    var studentRating = student.getRating(i);
    var questionRatingList = this.questionRatings[i] || [];
    questionRatingList.push(studentRating);
    this.questionRatings[i] = questionRatingList;
  }
  student.setScore(studentScore);
  return student;
}

Game.prototype.calcQuestionsCorrectPercentage = function calcQuestionsCorrectPercentage() {
  var percentages = [];
  var numberOfStudents = this.students.getNumberOfStudents();
  for (key in this.questionCorrectCountMap) {
    var count = this.questionCorrectCountMap[key];
    percentages[key] = (count / numberOfStudents) * 100;
  }
  return percentages;
}

Game.prototype.calculateResults = function calculateResults() {
  var listOfQuestions = this.questions.getList();
  var scoresMap = {};
  var winnerScore = 0;
  for (key in this.students.getAll()) {
    var student = this.students.getStudent(key);
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
  var averageRatings = [];
  for (key in this.questionRatings) {
    var question = listOfQuestions[key];
    var averageRating = this.getQuestionAverageRating(key);
    averageRatings.push(averageRating);
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
  result.averageRatings = averageRatings;
  result.questionsCorrectPercentage = this.calcQuestionsCorrectPercentage();
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


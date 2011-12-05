var question = exports;

var Questions = function Questions() {
  this.currentQuestions = {};
}

Questions.prototype.addQuestion = function addQuestion(question) {
  var questionUserName = this.currentQuestions[question.NAME]; 
  if (questionUserName) {
    questionUserName.push(question);
  } else {
    this.currentQuestions[question.NAME] = [question]; 
  }
}

Questions.prototype.getQuestions = function getQuestions(name) {
  return this.currentQuestions[name];
}

question.Questions = Questions;
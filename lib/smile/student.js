var student = exports;

var Student = function Student(name, ip) {
  this.name = name;
  this.ip = ip;
  this.status = new Status();
  this.answers = []; // TODO
}

Student.prototype.getId = function getId() {
  return this.ip;
}

Student.prototype.getStatus = function getStatus() {
  return this.status;
}

Student.prototype.getAnswers = function getAnswers() {
  return this.answers;
}

var Status = function Status() {
  this.made = false;
  this.solved = false;
}


var Students = function Students() {
  this.currentStudents = {};
}

Students.prototype.addStudent = function addStudent(student) {
  this.currentStudents[student.getId()] = student;
}

Students.prototype.getStudent = function getStudent(id) {
  return this.currentStudents[id];
}

Students.prototype.getAll = function getAll() {
  return this.currentStudents;
}

Students.prototype.getStudentStatus = function getStudentStatus(id) {
  return this.currentStudents[id].getStatus();
}

student.Student = Student;
student.Students = Students;

//
// Backward compatibility
//

var StudentWrapper = function StudentWrapper(student) {
  this.NAME = student.name;
  this.IP = student.ip;
}

var StudentStatusWrapper = function StudentStatusWrapper(student, numberOfQuestions) {
  this.NAME = student.name;
  this.MADE = student.getStatus().made ? 'Y' : 'N';
  var solved = student.getStatus().solved;
  this.SOLVED =  solved ? 'Y' : 'N';
  if (solved) {
    this.NUMQ = numberOfQuestions;
    this.YOUR_ANSWERS = student.getAnswers(); // TODO
  }
}

var StudentsWrapper = function StudentsWrapper(students) {
  this.students = students;
}

StudentsWrapper.prototype.addStudent = function addStudent(message) {
  if (!message.NAME) {
    throw new Error('Student registration message must contain a valid NAME property.')
  }
  if (!message.IP) {
    throw new Error('Student registration message must contain a valid IP property.')
  }
  if (message.TYPE) {
    delete message["TYPE"];
  }
  var student = new Student(message.NAME, message.IP);
  this.students.addStudent(student);
}

StudentsWrapper.prototype.getStudent = function getStudent(id) {
  return new StudentWrapper(this.students.getStudent(id));
}

StudentsWrapper.prototype.getStudentStatus = function getStudentStatus(ip, numberOfQuestions) {
  return new StudentStatusWrapper(this.students.getStudent(ip), numberOfQuestions);
}

StudentsWrapper.prototype.getAll = function getAll() {
  all = {};
  for (var id in this.students.getAll()) {
    all[id] = new StudentWrapper(this.students.getStudent(id));
  }
  return all;
}

student.StudentsWrapper = StudentsWrapper;

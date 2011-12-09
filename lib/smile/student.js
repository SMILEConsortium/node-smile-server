var student = exports;

var Students = function Students() {
  this.currentStudents = {};
}

var buildId = function buildId(name, ip) {
  return name + '-' + ip;
}

Students.prototype.addStudent = function addStudent(message) {
  if (!message.NAME) {
    throw new Error('Student registration message must contain a valid NAME property.')
  }
  if (!message.IP) {
    throw new Error('Student registration message must contain a valid IP property.')
  }
  if (message.TYPE) {
    delete message["TYPE"];
  }
  var id = buildId(message.NAME, message.IP)
  this.currentStudents[id] = message; 
}

Students.prototype.getStudent = function getStudent(id) {
  return this.currentStudents[id];
}

Students.prototype.getAll = function getAll() {
  return this.currentStudents;
}

student.Students = Students;
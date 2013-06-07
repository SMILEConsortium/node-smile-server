request = require('request');

PORT = process.env.PORT || 80;
BASE_URL = "http://localhost:" + PORT;

HEADERS_JSON = {
    'Content-Type': 'application/json'
};

HEADERS_ENCODED = {
    'Content-Type': 'application/x-www-form-urlencoded'
};

var encodedStudent1 = "MSG=%7B%22TYPE%22%3A%22HAIL%22%2C%22IP%22%3A%2210.0.2.14%22%2C%22NAME%22%3A%22test%22%7D";
var encodedStudent2 = "MSG=%7B%22TYPE%22%3A%22HAIL%22%2C%22IP%22%3A%2210.0.2.16%22%2C%22NAME%22%3A%22test2%22%7D";

request({
    uri: BASE_URL + "/JunctionServerExecution/pushmsg.php",
    method: 'POST',
    headers: HEADERS_ENCODED,
    body: encodedStudent1,
});

request({
    uri: BASE_URL + "/JunctionServerExecution/pushmsg.php",
    method: 'POST',
    headers: HEADERS_ENCODED,
    body: encodedStudent2,
});

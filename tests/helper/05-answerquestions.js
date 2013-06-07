request = require('request');

PORT = process.env.PORT || 80;
BASE_URL = "http://localhost:" + PORT;

HEADERS_JSON = {
    'Content-Type': 'application/json'
};

HEADERS_ENCODED = {
    'Content-Type': 'application/x-www-form-urlencoded'
};

var encodedAnswer1 = 'MSG=%7B%22MYRATING%22%3A%5B2%2C5%5D%2C%22MYANSWER%22%3A%5B3%2C3%5D%2C%22NAME%22%3A%22test%22%2C%22TYPE%22%3A%22ANSWER%22%2C%22IP%22%3A%2210.0.2.14%22%7D';
var encodedAnswer2 = 'MSG=%7B%22MYRATING%22%3A%5B2%2C2%5D%2C%22MYANSWER%22%3A%5B1%2C4%5D%2C%22NAME%22%3A%22test2%22%2C%22TYPE%22%3A%22ANSWER%22%2C%22IP%22%3A%2210.0.2.16%22%7D';

request({
    uri: BASE_URL + '/JunctionServerExecution/pushmsg.php',
    method: 'POST',
    headers: HEADERS_ENCODED,
    body: encodedAnswer1,
});

request({
    uri: BASE_URL + '/JunctionServerExecution/pushmsg.php',
    method: 'POST',
    headers: HEADERS_ENCODED,
    body: encodedAnswer2,
});

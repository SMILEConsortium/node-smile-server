request = require('request');

PORT = process.env.PORT || 80;
BASE_URL = "http://localhost:" + PORT;

HEADERS_JSON = {
    'Content-Type': 'application/json'
};

HEADERS_ENCODED = {
    'Content-Type': 'application/x-www-form-urlencoded'
};

request({
    uri: BASE_URL + '/smile/sendinitmessage',
    method: 'PUT',
    headers: HEADERS_JSON,
    body: JSON.stringify({})
});
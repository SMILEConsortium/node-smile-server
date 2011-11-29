OK = 'OK';
var messages = {};

exports.index = function(req, res) {
  res.render('index', {
    title : 'Smile Plug Server'
  });
};

exports.setCurrentMessage = function(req, res) {
  messages.current = req.body;
  res.send(OK);
};

exports.getCurrentMessage = function(req, res) {
  res.send(messages.current);
};
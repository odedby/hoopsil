var https = require('https');
var fs = require('fs');

var chatId;
var telegramToken;

var options = {
  'method': 'POST',
  'hostname': 'api.telegram.org',
  'path': '/bot[[TOKEN]]/sendMessage',
  'headers': {
    'Content-Type': 'application/json'
  },
  'maxRedirects': 20
};

const send = async function send(text) {
    return new Promise((resolve, reject) => {
    var req = https.request(options, function (res) {
      var chunks = [];
    
      res.on("data", function (chunk) {
        chunks.push(chunk);
      });
    
      res.on("end", function (chunk) {
        var body = Buffer.concat(chunks);
        resolve('success');
      });
    
      res.on("error", function (error) {
          reject('fail');
        console.error(error);
      });
    });
        var postData = JSON.stringify({"chat_id":`${chatId}`,"text":text /*, "parse_mode":"MarkdownV2"*/});
        req.write(postData);
        req.end();
    })
}

const setOptions = async function setToken(params) {
  telegramToken = params.telegramToken;
  options.path = options.path.replace('[[TOKEN]]', telegramToken);
  chatId = params.chatId;
}

module.exports = {
    send,
    setOptions
}
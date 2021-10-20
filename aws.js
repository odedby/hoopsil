var AWS = require('aws-sdk');
var ssm = new AWS.SSM({region:'us-east-1'});

const getParams = async function getParams(paramName) {
  return new Promise((resolve, reject) => {
      let params = {
          Name: paramName
        };
        ssm.getParameter(params, function(err, data) {
          if (err) reject(err, err.stack); // an error occurred
          else     resolve(JSON.parse(data.Parameter.Value));           // successful response
        });
  })
}

const putParams = async function putParams(paramName, paramValue) {
    return new Promise((resolve, reject) => {
      var params = {
        Name: paramName,
        Value: paramValue,
        Overwrite: true
      };
      ssm.putParameter(params, function(err, data) {
        if (err) reject(err, err.stack); // an error occurred
        else     resolve(data);           // successful response
      });
  })
}

module.exports = {
    getParams,
    putParams
}
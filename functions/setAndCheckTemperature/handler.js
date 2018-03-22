'use strict';
var request = require('request-promise-native');

module.exports.setAndCheck = function (context) {
  var measure = context.bindings.reading.body;

  logObject(measure, 'Incomming measure', context);

  Promise.all([alertUsers(measure, context), storeMeasure(measure, context)])
    .then(function (promises) {
      context.log('Function suceeded');
      context.bindings.response = {
        body: 'Reading processed'
      };
      context.done();
    })
    .catch(function (error) {
      logObject(error, 'FUNCTION ERROR', context)
      context.bindings.response = {
        body: 'Reading failed processing'
      };
      context.done();
    });
};

function alertUsers(measure, ctx) {
  logObject(measure, 'New measure', ctx);
  return request({
    uri: getEnvironmentVariable('GraphQlUrl'),
    method: 'POST',
    json: true,
    body: {
      "query": `query {
            listUsers {
              items {
                email
                settings {
                  minTempThreshold
                  maxTempThreshold
                }
              }
            }
          }`
    },
    headers: {
      "x-api-key": getEnvironmentVariable('GraphQlKey')
    }
  }).then(function (response) {
    logObject(response, 'query listUsers response', ctx);
    return processUsers(response.data.listUsers.items, measure, ctx);
  });
}

function processUsers(users, measure, ctx) {
  var promises = users.map(user => {
    logObject(user, 'Checking thresholds for user', ctx)
    logObject(measure, 'With measure', ctx)
    if (user.settings && isReadingOutsideThresholds(measure.celsius, user.settings, ctx)) {
      ctx.log(`Reading is outside thresholds: ${user.settings.minTempThreshold} < ${measure.celsius} > ${user.settings.maxTempThreshold}`);

      return request({
        uri: getEnvironmentVariable('NotificationsUrl'),
        method: 'POST',
        json: true,
        body: {
          email: user.email,
          celsius: measure.celsius,
          fahrenheit: measure.fahrenheit,
          device_id: measure.device_id,
          timestamp: measure.timestamp
        }
      }).then(function (response) {
        logObject(response, 'Notifications request response', ctx);
      }).catch(function (error) {
        logObject(error, 'Notifications request error', ctx);
      });
    }
  });

  return Promise.all(promises);
}

function storeMeasure(measure, ctx) {
  logObject(measure, 'Measure to store', ctx);
  return request({
    uri: getEnvironmentVariable('AwsAppSyncUrl'),
    method: 'POST',
    json: true,
    body: {
      "query": `mutation {
            newDeviceMeasure(
              deviceId: "${measure.device_id}",
              timestamp: "${measure.timestamp}",
              value: ${measure.celsius},
              units: "C") {
                measureId
              }
            }`
    },
    headers: {
      "x-api-key": getEnvironmentVariable('AwsAppSyncKey')
    }
  }).then(function (response) {
    logObject(response, 'mutaiton newDeviceMeasure response', ctx);
  }).catch(function (error) {
    logObject(error, 'mutaiton newDeviceMeasure error', ctx);
  });
}

function isReadingOutsideThresholds(value, settings, context) {
  let val = parseFloat(value);
  let min = parseFloat(settings.minTempThreshold);
  let max = parseFloat(settings.maxTempThreshold);

  return val < min || val > max;
}

function getEnvironmentVariable(name) {
  return process.env[name];
};

function logObject(object, message, ctx) {
  ctx.log(message);
  ctx.log(JSON.stringify(object));
}
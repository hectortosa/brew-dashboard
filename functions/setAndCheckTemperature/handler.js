'use strict';
var request = require('request-promise-native');

module.exports.setAndCheck = function (context) {
  var measure = context.bindings.reading.body;

  context.log(`New measure: ${measure}`);

  Promise.all([alertUsers(measure, context), storeMeasure(measure, context)])
    .then(function (promises) {
      context.bindings.response = {
        body: 'Reading processed'
      };
      context.done();
    });
};

function alertUsers(measure, ctx) {
  ctx.log(`New measure: ${measure}`);
  return request({
    uri: 'https://zynbjtfvhncqvj4sfaxcbiqmdy.appsync-api.eu-west-1.amazonaws.com/graphql',
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
      "x-api-key": "da2-au2olyd6r5abfnurhqfze3bh6e"
    }
  }).then(function (response) {
    logObject(response, 'query listUsers response', ctx);
    processUsers(response.data.data.listUsers.items, measure, ctx);
  });
}

function processUsers(users, measure, ctx) {
  users.forEach(user => {
    if (user.settings && isReadingOutsideThresholds(measure.celsius, user.settings, context)) {
      ctx.log(`Reading is outside thresholds: ${user.settings.minTempThreshold} < ${measure.celsius} > ${user.settings.maxTempThreshold}`);

      request({
        uri: 'https://u4-ek-dev-trigger-http-webhook.azurewebsites.net/api/v1/triggers/http-webhook/aff874b4-119c-4d84-987d-89189d4ad38e?sig=vqWJFmR9iIu%252bvKiCtcWoCtTs%252fIy%252bffCjaVPiZGtePTI%253d',
        method: 'POST',
        json: true,
        body: {
          email: user.email,
          maxThreshold: user.settings.maxTempThreshold,
          minThreshold: user.settings.minTempThreshold,
          celsius: measure.celsius,
          fahrenheit: measure.fahrenheit,
          device_id: measure.device_id,
          timestamp: measure.timestamp
        }
      }).on('response', function (response) {
        logObject(response, 'EK request response', ctx);
      }).on('error', function (error) {
        logObject(error, 'EK request error', ctx);
      });
    }
  });
}

function storeMeasure(measure, ctx) {
  ctx.log(`Measure to store: ${JSON.stringify(measure)}`);
  request({
    uri: 'https://zynbjtfvhncqvj4sfaxcbiqmdy.appsync-api.eu-west-1.amazonaws.com/graphql',
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
      "x-api-key": "da2-au2olyd6r5abfnurhqfze3bh6e"
    }
  }).on('response', function (response) {
    logObject(response, 'mutaiton newDeviceMeasure response', ctx);
  }).on('error', function (error) {
    logObject(error, 'mutaiton newDeviceMeasure error', ctx);
  });
}

function isReadingOutsideThresholds(value, settings, context) {
  let val = parseFloat(value);
  let min = parseFloat(settings.minTempThreshold);
  let max = parseFloat(settings.maxTempThreshold);

  return val < min || val > max;
}

function logObject(object, message, ctx) {
  ctx.log(message);
  ctx.log(JSON.stringify(object));
}
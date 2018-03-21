'use strict';
var request = require('request');
var ctx = null;
var measure = null;

module.exports.setAndCheck = function (context) {
  ctx = context;
  measure = ctx.bindings.reading.body;

  ctx.log(measure);

  request({
    uri: '<aws_app_sync_api_url>',
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
      "x-api-key": "<aws_app_sync_api_key>"
    }
  }, processUsers);

  storeMeasure(measure);
  context.bindings.response = {
    body: 'Reading processed'
  };
  context.done();
};

function storeMeasure(measure) {
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
  }, logResponse);
}

function processUsers(error, response, body) {
  ctx.log(`GraphQL response data: ${JSON.stringify(response)}`);

  response.data.listUsers.items.forEach(user => {
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
      }, logResponse);
    }
  });
}

function isReadingOutsideThresholds(value, settings, context) {
  let val = parseFloat(value);
  let min = parseFloat(settings.minTempThreshold);
  let max = parseFloat(settings.maxTempThreshold);

  return val < min || val > max;
}

function logResponse(error, response, body) {
  ctx.log(`Error: ${JSON.stringify(error)}`);
  ctx.log(`Response: ${JSON.stringify(response)}`);
  ctx.log(`Body: ${JSON.stringify(body)}`);
}
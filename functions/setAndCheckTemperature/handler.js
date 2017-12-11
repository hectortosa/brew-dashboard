'use strict';
var request = require('request');

module.exports.setAndCheck = function (context) {
  context.bindings.preferences.forEach(preference => {
    if (isReadingOutsideThresholds(context.bindings.newReading.value, preference.preferences)) {
      request({
        uri: 'https://u4-ek-dev-trigger-http-webhook.azurewebsites.net/api/v1/triggers/http-webhook/aff874b4-119c-4d84-987d-89189d4ad38e?sig=vqWJFmR9iIu%252bvKiCtcWoCtTs%252fIy%252bffCjaVPiZGtePTI%253d',
        method: 'POST',
        json: true,
        body: {
          email: preference.email,
          maxThreshold: preference.preferences.maxThreshold,
          minThreshold: preference.preferences.minThreshold,
          celsius: newReading.celsius,
          fahrenheit: newReading.fahrenheit,
          device: newReading.deviceId,
          timestamp: newReading.timestamp
        }
      })
    }
  });

  context.bindings.readings = context.bindings.newReading;
  context.bindings.response = {
    body: 'Reading saved',
  };

  context.done();
};

function isReadingOutsideThresholds(value, preference) {
  return value < preference.minThreshold || value > preference.maxThreshold
}
var request = require('request');

module.exports = function (context, reading, preferences) {
    var userPreference = {
        email: '',
        preferences: {}
    };
    context.log(reading);
    context.log(preferences);

    preferences.forEach(preference => {
        if (isReadingOutsideThresholds(reading.celsius, preference.preferences, context)) {
            request({
                uri: 'https://u4-ek-dev-trigger-http-webhook.azurewebsites.net/api/v1/triggers/http-webhook/aff874b4-119c-4d84-987d-89189d4ad38e?sig=vqWJFmR9iIu%252bvKiCtcWoCtTs%252fIy%252bffCjaVPiZGtePTI%253d',
                method: 'POST',
                json: true,
                body: {
                    email: preference.id,
                    maxThreshold: preference.preferences.maxThreshold,
                    minThreshold: preference.preferences.minThreshold,
                    celsius: reading.celsius,
                    fahrenheit: reading.fahrenheit,
                    device_id: reading.device_id,
                    timestamp: reading.timestamp
                }
            }, function (error, response, body) {
                context.log(error);
            });
        }
    });

    context.bindings.readings = JSON.stringify(reading);
    context.bindings.response = {
        body: 'Reading processed'
    };
    context.done();
};

function isReadingOutsideThresholds(value, preference, context) {
    let val = parseFloat(value);
    let min = parseFloat(preference.minThreshold);
    let max = parseFloat(preference.maxThreshold);

    return val < min || val > max;
}
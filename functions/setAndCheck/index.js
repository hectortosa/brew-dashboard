var MongoClient = require('mongodb').MongoClient;
var request = require('request');

module.exports = function (context, newReading) {
    var url = GetEnvironmentVariable('DocumentDbConnectionString');
    MongoClient.connect(url, function(err, db) {
        if (!err) {
            getPreferences(db, function (err, result) {
                if (!err || err !== null) {
                    if (!result || result !== null) {
                        sendAlert(result);
                    }
                }
                else {
                    context.log('Error fetching document');
                }
            });

            insertReading(newReading, db, function (err, result) {
                if (!err || err !== null) {
                    if (!result || result !== null) {
                        context.log('Stored');
                    }
                }
                else {
                    context.log('Error storing document');
                }
            });
        }
        else {
            db.close();
            context.log('Error connecting to database');
        }
    });

    context.response = {
        status: 202,
        body: 'Reading processed'
    };

    context.done();
};

function getPreferences(db, callback) {
    db.collection('user-preferences')
        .find(function (err, doc) {
            callback(err, doc);
        });
}

function insertReading(reading, db, callback) {
    var collection = db.collection('readings');
    collection.insert(reading, function (err, result) {
            callback(err, result);
        });
}

function sendAlert(reading, preferences) {
    preferences.forEach(preference => {
        if (isReadingOutsideThresholds(reading.celsius, preference.preferences)) {
            request({
                uri: 'https://u4-ek-dev-trigger-http-webhook.azurewebsites.net/api/v1/triggers/http-webhook/aff874b4-119c-4d84-987d-89189d4ad38e?sig=vqWJFmR9iIu%252bvKiCtcWoCtTs%252fIy%252bffCjaVPiZGtePTI%253d',
                method: 'POST',
                json: true,
                body: {
                    email: preference.email,
                    maxThreshold: preference.preferences.maxThreshold,
                    minThreshold: preference.preferences.minThreshold,
                    celsius: reading.celsius,
                    fahrenheit: reading.fahrenheit,
                    device_id: reading.device_id,
                    timestamp: reading.timestamp
                }
            })
        }
    });
}

function isReadingOutsideThresholds(value, preference, context) {
    context.log('value: ' + value);
    context.log('min: ' + preference.minThreshold);
    context.log('max: ' + preference.maxThreshold);
    return value < preference.minThreshold || value > preference.maxThreshold
}

function GetEnvironmentVariable(name: string): any {
    return process.env[name];
}
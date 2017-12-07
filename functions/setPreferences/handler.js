'use strict';

var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://ht-hyper-hipster:n4Wk2GBI4Y9yQbard727ODLGW3SJ4jMIfxhyvAC357jKw4FZmRxlRodR63PxsiSIzUGfUiCa5fawlXMTFIUaMg==@ht-hyper-hipster.documents.azure.com:10255/brew-dashboard?ssl=true';

module.exports = function(request, response) {
    var email,
        preferences;

    if (!request.body || !request.body.email) {
        return response(new Error('Unexpected payload: Missing email'));
    }

    email = request.body.email;

    if (!request.body || !request.body.preferences) {
        return response(new Error('Unexpected payload: Missing preferences'));
    }

    preferences = request.body.preferences;

    MongoClient.connect(url, function(err, db) {
        if (!err) {
            insertPreferences(email, preferences, db, function (err, result) {
                if (!err) {
                    response(null, { email: email, preferences: preferences });
                }
                db.close();
            });
        }
        else {
            db.close();           
            return response(new Error('Error storing document'));
        }
    });
};

function insertPreferences(email, preferences, db, callback) {
    var collection = db.collection('user-preferences');
    collection.findOneAndUpdate(
        { email: email },
        { $set: { preferences: preferences }},
        { upsert: true }, function (err, result) {
            callback(err, result);
        });
}
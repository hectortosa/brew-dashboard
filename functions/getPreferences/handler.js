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

    MongoClient.connect(url, function(err, db) {
        if (!err) {
            getPreferences(email, db, function (err, result) {
                if (!err || err !== null) {
                    if (!result || result !== null) {
                        db.close(); 
                        response(null, { preferences: result.preferences });
                    }
                    else {
                        db.close(); 
                        return response(new Error('Document not found'));
                    }
                }
                else {
                    db.close(); 
                    return response(null, new Error('Error fetching document'));
                }
            });
        }
        else {

            db.close();            
            return response(new Error('Error connecting to database'));
        }
    });
};

function getPreferences(email, db, callback) {
    db.collection('user-preferences')
        .findOne({ email: email }, function (err, doc) {
            callback(err, doc);
        });
}
module.exports = function (context, request, preferences) {
    var userPreference = {
        email: '',
        preferences: {}
    };

    preferences.forEach(preference => {
        if (preference.id.toUpperCase() === request.email.toUpperCase()) {
            userPreference.email = preference.id;
            userPreference.preferences = preference.preferences;
        }
    });

    context.bindings.response = {
        body: userPreference
    };
    context.done();
};
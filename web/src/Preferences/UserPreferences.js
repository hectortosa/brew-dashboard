import React, {Component} from 'react';
import gql from 'graphql-tag';
import {graphql, compose} from 'react-apollo';
import auth from '../Auth';
import './UserPreferences.css';

class UserPreferences extends Component {
    constructor(props) {
        super(props);

        this.state = {
            user: undefined
        }
    }

    componentWillMount() {
        const user = Object.assign({}, this.props.user);
        user.settings = user.settings || { minTempThreshold: '', maxTempThreshold: ''};
        this.setState({user});
    }

    async onSave(event, settings) {
        event.preventDefault();
        const result = await this.props.settingsMutation({
            variables: {
                email: auth.email,
                min: settings.minTempThreshold,
                max: settings.maxTempThreshold
            },
        });
        const newSettings = result.data.configureSettingsForUser;

        alert('Settings saved! ' + JSON.stringify(newSettings));
    }

    setMinTemp(value) {
        this.setState({
            user: {
                settings: {
                    minTempThreshold: value,
                    maxTempThreshold: this.state.user.settings.maxTempThreshold
                }
            }
        });
    }

    setMaxTemp(value) {
        this.setState({
            user: {
                settings: {
                    minTempThreshold: this.state.user.settings.minTempThreshold,
                    maxTempThreshold: value
                }
            }
        });
    }

    render() {
        let settings = null;
        const {user} = this.state;

        if (user) {
            settings = user.settings || {};
        }

        return (
            <div className="PreferencesPage">
                <h2>Preferences</h2>
                {!settings
                    ? null
                    : (<form onSubmit={(e) => this.onSave(e, settings)}>

                        <label htmlFor="min">Min threshold</label>
                        <input type="text" id="min" className="form-control" placeholder="Min threshold"
                               value={settings.minTempThreshold}
                               onChange={(e) => this.setMinTemp(e.target.value)}/>
                        <label htmlFor="max">Max threshold</label>
                        <input type="text" id="max" className="form-control" placeholder="Max threshold"
                               value={settings.maxTempThreshold}
                               onChange={(e) => this.setMaxTemp(e.target.value)}/>
                        <button className="btn btn-lg btn-primary btn-block">Save</button>
                    </form>)
                }
            </div>
        );
    }
}

const USER_QUERY = gql`
    query user($email: ID!) {
        getUser(email: $email) {
            email
            name
            settings {
                maxTempThreshold
                minTempThreshold
            }
        }
    }
`;

const SETTINGS_MUTATION = gql`
    mutation setSettings($email: ID!, $min: Float!, $max: Float!) {
        configureSettingsForUser(userEmail: $email, minTempThreshold: $min, maxTempThreshold: $max) {
            maxTempThreshold
            minTempThreshold
        }
    }
`;

const withData = compose(
    graphql(USER_QUERY, {
        options: () => ({
            variables: {
                email: auth.email
            },
            fetchPolicy: 'cache-and-network'
        }),
        props: (props) => ({
            user: props.data.getUser
        })
    }),
    graphql(SETTINGS_MUTATION, {
        name: 'settingsMutation'
    })
);

export default withData(UserPreferences);
import React, {Component} from 'react';
import gql from 'graphql-tag';
import {graphql} from 'react-apollo';
import auth from '../Auth';
import './UserPreferences.css';

class UserPreferences extends Component {
    render() {
        let settings = null;
        const {user} = this.props;

        if (user && user.settings && user.settings.items) {
            settings = user.settings.items[0];
        }

        return (
            <div className="PreferencesPage">
                <h2>Preferences</h2>
                {!settings
                    ? null
                    : (<form onSubmit={() => this.onSave()}>
                        <label htmlFor="min">Min threshold</label>
                        <input id="min" className="form-control" placeholder="Min threshold"
                               value={settings.minTempThreshold} onChange={(e) => settings.minTempThreshold = e.target.value}/>
                        <label htmlFor="max">Max threshold</label>
                        <input id="max" className="form-control" placeholder="Max threshold"
                               value={settings.maxTempThreshold} onChange={(e) => settings.maxTempThreshold = e.target.value}/>
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
                items {
                    maxTempThreshold
                    minTempThreshold
                }
            }
        }
    }
`;

const withData = graphql(USER_QUERY, {
    options: () => ({
        variables: {
            email: auth.email
        },
        fetchPolicy: 'cache-and-network'
    }),
    props: (props) => ({
        user: props.data.getUser
    })
})(UserPreferences);

export default withData;
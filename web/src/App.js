import React, {Component} from 'react';
import {BrowserRouter as Router, Link, Route} from 'react-router-dom'
import AWSAppSyncClient from 'aws-appsync';
import {Rehydrated} from 'aws-appsync-react';
import {AUTH_TYPE} from 'aws-appsync/lib/link/auth-link';
import {ApolloProvider} from 'react-apollo';
import AppSync from './AppSync.js';

import logo from './img/brew-dashboard.png';
import './App.css';
import Login from './Login/Login';
import UserPreferences from './Preferences/UserPreferences';
import Home from './Home/Home';
import {PrivateRoute} from './Auth';

const client = new AWSAppSyncClient({
    url: AppSync.graphqlEndpoint,
    region: AppSync.region,
    auth: {
        type: AUTH_TYPE.API_KEY,
        apiKey: AppSync.apiKey
    },
});


class App extends Component {

    render() {
        return (
            <Router>
                <div className="App">
                    <nav className="navbar navbar-expand-xl navbar-dark bg-dark">
                        <Link to="/" className="navbar-brand">
                            <img src={logo} alt="logo"/>
                            Brew Dashboard
                        </Link>
                        <button className="navbar-toggler" type="button" data-toggle="collapse"
                                data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
                                aria-expanded="false" aria-label="Toggle navigation">
                            <span className="navbar-toggler-icon"/>
                        </button>

                        <div className="collapse navbar-collapse" id="navbarSupportedContent">
                            <ul className="navbar-nav mr-auto">
                                <li className="nav-item">
                                    <Link to="/" className="nav-link">
                                        Home <span className="sr-only">(current)</span>
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link to="/preferences" className="nav-link">
                                        Settings
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </nav>
                    <div className="container">
                        <Route path="/login" component={Login}/>
                        <Route exact path="/" component={Home}/>
                        <PrivateRoute path="/preferences" component={UserPreferences}/>
                    </div>
                </div>
            </Router>
        );
    }
}

const WithProvider = () => (
    <ApolloProvider client={client}>
        <Rehydrated>
            <App />
        </Rehydrated>
    </ApolloProvider>
);

export default WithProvider;
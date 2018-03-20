import React, {Component} from 'react';
import {BrowserRouter as Router, Link, Route} from 'react-router-dom'

import logo from './img/brew-dashboard.png';
import './App.css';

import Request from 'request';
import Login from './Login/Login';
import UserPreferences from './Preferences/UserPreferences';
import Home from './Home/Home';
import {PrivateRoute} from './Auth';


class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            email: '',
            preferences: {
                minThreshold: '',
                maxThreshold: ''
            }
        };

        this.handleLogin = this.handleLogin.bind(this);
        this.login = this.login.bind(this);

        this.fetchPreferences = this.fetchPreferences.bind(this);
        this.handlePreferences = this.handlePreferences.bind(this);
        this.setPreferences = this.setPreferences.bind(this);
        this.savePreferences = this.savePreferences.bind(this);
        this.processPreferencesResponse = this.processPreferencesResponse.bind(this);
    }

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
                        <PrivateRoute exact path="/" component={Home}/>
                        <PrivateRoute path="/preferences" component={UserPreferences}/>
                    </div>
                </div>
            </Router>
        );
    }

    handleLogin(event) {
        this.setState({email: event.target.value});
    }

    login(event) {
        if (this.state.email !== '') {
            this.fetchPreferences(this.state.email);
        }

        event.preventDefault();
    }

    fetchPreferences(email) {
        let requestOptions = {
            uri: 'https://ht-brew-dashboard.azurewebsites.net/api/getPreferences?code=e6InRdiOfu4s7ROHAfAXR93d1ShhXPh2ZKvkxaUh78bXwec66jwsbQ==&clientId=default',
            method: 'POST',
            json: true,
            body: {email: this.state.email}
        };

        Request(requestOptions, this.processPreferencesResponse)
    }

    handlePreferences(event) {
        var preferences = this.state.preferences;
        preferences[event.target.name] = event.target.value;

        this.setState({
            preferences: preferences
        });
    }

    setPreferences(event) {
        if (this.state.email !== '' && this.state.preferences.minThreshold !== '' && this.state.preferences.maxThreshold !== '') {
            this.savePreferences(this.state.email, this.state.preferences);
        }

        event.preventDefault();
    }

    savePreferences(email, preferences) {
        let requestOptions = {
            uri: 'https://ht-brew-dashboard.azurewebsites.net/api/setPreferences?code=zHWq8B0Fyox3rxsW52psv61vSkrAsGXvt4xUiLbolCuDR8Vu4pjBFg==&clientId=default',
            method: 'POST',
            json: true,
            body: {email: this.state.email, preferences: this.state.preferences}
        };

        Request(requestOptions, this.processPreferencesResponse);
    }

    processPreferencesResponse(error, response, body) {
        if (response && response.statusCode === 200 && body) {
            this.setState({preferences: body.preferences});
        }
    }
}

export default App;
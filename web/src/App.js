import React, { Component } from 'react';
import logo from './img/brew-dashboard.png';
import './css/App.css';

import Request from 'request';

import TemperatureChart from './TemperatureChart';
import Login from './Login';
import UserPreferences from './UserPreferences';

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

    this.fetchData = this.fetchData.bind(this);

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
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Brew Dashboard</h1>
        </header>
        <p className="App-intro">
          Temperature Monitor
        </p>
        <Login email={this.state.email} onChange={this.handleLogin} onLogin={this.login} />
        <UserPreferences value={this.state.preferences} onChange={this.handlePreferences} onSave={this.setPreferences} />
        <TemperatureChart width={200} height={500} getNewValue={this.fetchData} refreshTime={5000} delayTime={0} />
      </div>
    );
  }

  fetchData() {
    return [Math.floor(Math.random() * 100)];
  }

  handleLogin(event) {
    this.setState({ email: event.target.value });
  }

  login(event) {
    if (this.state.email !== '') {
      this.fetchPreferences(this.state.email);
    }

    event.preventDefault();
  }

  fetchPreferences(email) {
    let requestOptions = {
      uri: 'https://wt-773198c4400b904deded251f7813917d-0.sandbox.auth0-extend.com/brew-dashboard-get-preferences-dev-main',
      method: 'POST',
      json: true,
      body: { email: this.state.email }
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
      uri: 'https://wt-773198c4400b904deded251f7813917d-0.sandbox.auth0-extend.com/brew-dashboard-set-preferences-dev-main',
      method: 'POST',
      json: true,
      body: { email: this.state.email, preferences: this.state.preferences }
    };

    Request(requestOptions, this.processPreferencesResponse)
  }

  processPreferencesResponse(error, response, body) {
    console.log('processPreferencesResponse');
    console.log('error:');
    console.log(error);
    console.log('response:');
    console.log(response);
    console.log('body:');
    console.log(body);

    if (response && response.statusCode === 200 && !body) {
      this.setState({ preferences: body.preferences });
    }
  }
}

export default App;
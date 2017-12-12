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
        <TemperatureChart width={200} height={500} getNewValue={this.fetchData} refreshTime={5000} delayTime={1000} />
      </div>
    );
  }

  fetchData(callback) {
    let requestOptions = {
      uri: 'https://ht-brew-dashboard.azurewebsites.net/api/getLastReading?code=t1hVZh/kJeVkJjmCwR/QXGZ02b8iTH2gdFD6kT68dYa/wszdGia1ZQ==&clientId=default',
      method: 'POST',
      json: true,
      body: { requestTime: Date.now() }
    };

    Request(requestOptions, function (error, response, body) {
      callback(body.celsius);
    });
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
      uri: 'https://ht-brew-dashboard.azurewebsites.net/api/getPreferences?code=e6InRdiOfu4s7ROHAfAXR93d1ShhXPh2ZKvkxaUh78bXwec66jwsbQ==&clientId=default',
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
      uri: 'https://ht-brew-dashboard.azurewebsites.net/api/setPreferences?code=zHWq8B0Fyox3rxsW52psv61vSkrAsGXvt4xUiLbolCuDR8Vu4pjBFg==&clientId=default',
      method: 'POST',
      json: true,
      body: { email: this.state.email, preferences: this.state.preferences }
    };

    Request(requestOptions, this.processPreferencesResponse);
  }

  processPreferencesResponse(error, response, body) {
    if (response && response.statusCode === 200 && body) {
      this.setState({ preferences: body.preferences });
    }
  }
}

export default App;
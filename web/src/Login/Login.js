import React, {Component} from 'react';
import {Redirect} from 'react-router-dom';

import './Login.css';
import auth from '../Auth';

class Login extends Component {
    state = {
        redirectToReferrer: false,
        email: ''
    };

    onEmailChange(e) {
        this.setState({email: e.target.value});
    }

    onLogin() {
        if (this.state.email) {
            auth.hasAuth = true;
            this.setState({redirectToReferrer: true});
        }
    }

    render() {
        const {from} = this.props.location.state || {from: {pathname: '/'}};
        const {redirectToReferrer} = this.state;

        if (redirectToReferrer) {
            return <Redirect to={from}/>;
        }

        return (
            <div className="LoginPage">
                <div className="card">
                    <div className="card-header">
                        Sign In
                    </div>
                    <div className="card-body">
                        <form onSubmit={() => this.onLogin()}>
                            <label htmlFor="email" className="sr-only">Email address</label>
                            <input type="email" id="email" className="form-control" placeholder="Email"
                                   value={this.props.email} onChange={(e) => this.onEmailChange(e)}
                            autoFocus/>
                            <button className="btn btn-lg btn-primary btn-block">Login</button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }
}

export default Login;
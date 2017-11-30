import React, {Component} from 'react';

class Login extends Component {
    render() {
        return (
            <div>
                <h2>Login</h2>
                <form>
                    Email: <input type="text" value={this.props.email} onChange={this.props.onChange} />
                </form>
                <button onClick={this.props.onLogin}>Login</button>
            </div>
        );
    }
}

export default Login;
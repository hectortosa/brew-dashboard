import React from 'react';
import {Redirect, Route} from 'react-router-dom';

export class Auth {
    get isLoggedIn() {
        return this.hasAuth;
    }

    _hasAuth = false;
}

export const PrivateRoute = ({ component: Component, ...rest }) => (
    <Route
        {...rest}
        render={props =>
            auth.isLoggedIn ? (
                <Component {...props} />
            ) : (
                <Redirect
                    to={{
                        pathname: "/login",
                        state: { from: props.location }
                    }}
                />
            )
        }
    />
);

const auth = new Auth();

export default auth;
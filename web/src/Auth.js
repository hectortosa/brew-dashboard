import React from 'react';
import {Redirect, Route} from 'react-router-dom';

export class Auth {

    _email = null;

    get isLoggedIn() {
        return this._email !== null;
    }

    get email() {
        return this._email;
    }

    set email(email) {
        this._email = email;
    }
}

export const PrivateRoute = ({component: Component, ...rest}) => (
    <Route
        {...rest}
        render={props =>
            auth.isLoggedIn ? (
                <Component {...props} />
            ) : (
                <Redirect
                    to={{
                        pathname: '/login',
                        state: {from: props.location}
                    }}
                />
            )
        }
    />
);

const auth = new Auth();

export default auth;
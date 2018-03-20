import React, {Component} from 'react';
import gql from 'graphql-tag';
import {graphql} from 'react-apollo';
import TemperatureChart from '../TemperatureChart';

class Home extends Component {
    render() {
        const {users} = this.props;
        return (
            <div className="text-center">
                <h1>Test data!!!</h1>
                {
                    users.map(el => <div key={el.email}>{el.email}</div>)
                }
                <TemperatureChart width={200} height={500} label="Live data" />
            </div>
        )
    }
}

const Users = gql`
    query {
        listUsers {
            items {
                email
                name
            }
        }
    }
`;

const HomeWithData = graphql(Users, {
    options: {
        fetchPolicy: 'cache-and-network'
    },
    props: (props) => ({
        users: props.data.listUsers && props.data.listUsers.items,
    })

})(Home);

export default HomeWithData;
import React, {Component} from 'react';
import gql from 'graphql-tag';
import {graphql} from 'react-apollo';
import {Subject} from 'rxjs';
import * as moment from 'moment';

import TemperatureChart from '../TemperatureChart';

class Home extends Component {

    tempSubject = new Subject();

    constructor(props) {
        super(props);

        setTimeout(() => {
            const measures = this.props.measures || [];
            measures.forEach(x => this.tempSubject.next({
                x: moment(x.timestamp, 'DD-MM-YYYYTHH:mm:ss').toDate(),
                y: x.value
            }));
        });
    }

    componentWillMount() {
        this.props.subscribeToNewMeasures({
            onNewItem: (item) => {
                this.tempSubject.next({
                    x: moment(item.timestamp, 'DD-MM-YYYYTHH:mm:ss').toDate(),
                    y: item.value
                });
            }
        });
    }

    render() {
        return (
            <div className="text-center">
                <TemperatureChart stream={this.tempSubject.asObservable()} width={200} height={500} label="Live data"/>
            </div>
        )
    }
}

const deviceId = 'raspberry-pi-temp-sb118';

const Measures = gql`
    query {
        listMeasuresByDevice(deviceId: "${deviceId}") {
            items {
                timestamp
                value
                units
            }
        }
    }
`;

const NewMeasuresSubscription = gql`
    subscription {
        subscribeToNewMeasures(deviceId: "${deviceId}") {
            measureId
            timestamp
            value
            units
        }
    }
`;

const HomeWithData = graphql(Measures, {
    options: {
        fetchPolicy: 'cache-and-network'
    },
    props: (props) => ({
        measures: props.data.listMeasuresByDevice && props.data.listMeasuresByDevice.items,
        subscribeToNewMeasures: params => {
            props.data.subscribeToMore({
                document: NewMeasuresSubscription,
                updateQuery: (prev, {subscriptionData}) => {
                    if (!subscriptionData.data) {
                        return prev;
                    }

                    const newItem = subscriptionData.data.subscribeToNewMeasures;

                    if (params.onNewItem) {
                        params.onNewItem(newItem);
                    }

                    return Object.assign({}, prev, {
                        listMeasuresByDevice: {
                            items: [newItem, ...prev.listMeasuresByDevice.items]
                        }
                    });
                }
            });
        },
    })

})(Home);

export default HomeWithData;
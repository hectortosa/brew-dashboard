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

    render() {
        return (
            <div className="text-center">
                <TemperatureChart stream={this.tempSubject.asObservable()} width={200} height={500} label="Live data"/>
            </div>
        )
    }
}

const Measures = gql`
    query {
        listMeasuresByDevice(deviceId: "raspberry-pi-temp-sb118") {
            items {
                timestamp
                value
                units
            }
        }
    }
`;

const HomeWithData = graphql(Measures, {
    options: {
        fetchPolicy: 'cache-and-network'
    },
    props: (props) => ({
        measures: props.data.listMeasuresByDevice && props.data.listMeasuresByDevice.items,
    })

})(Home);

export default HomeWithData;
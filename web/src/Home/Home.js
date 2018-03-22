import React, {
    Component
} from 'react';
import gql from 'graphql-tag';
import {
    graphql
} from 'react-apollo';
import {
    Subject
} from 'rxjs';
import * as moment from 'moment';
import request from 'request-promise-native';

import TemperatureChart from '../TemperatureChart';

var tempSubjectGlobal = new Subject();

class Home extends Component {

    tempSubject = tempSubjectGlobal;

    constructor(props) {
        super(props);

        setTimeout(() => {
            const measures = this.props.measures || [];
            measures.forEach(x => this.tempSubject.next({
                x: moment(x.timestamp, 'DD-MM-YYYYTHH:mm:ss').toDate(),
                y: x.value
            }));
        });

        setInterval(function () {
                request({
                    uri: 'https://zynbjtfvhncqvj4sfaxcbiqmdy.appsync-api.eu-west-1.amazonaws.com/graphql',
                    method: 'POST',
                    json: true,
                    body: {
                        "query": `query {
                        listMeasuresByDevice(deviceId: "28-8000000117ab", limit: 1) {
                              items {
                                timestamp
                                value
                                units
                              }
                            }
                          }`
                    },
                    headers: {
                        "x-api-key": "da2-au2olyd6r5abfnurhqfze3bh6e"
                    }
                }).then(function (response) {
                    var data = response.data.listMeasuresByDevice.items;
                    console.log(`Data: ${JSON.stringify(data)}`);
                    data.forEach(function(x) {
                        tempSubjectGlobal.next({
                            x: moment(x.timestamp, 'DD-MM-YYYYTHH:mm:ss').toDate(),
                            y: x.value
                        })
                    });
                }).catch(function (error) {
                    console.log(`ERROR GETTING MEASURES: ${error}`);
                });
            }, 5000);
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
        return ( <div className = "text-center" >
            <TemperatureChart stream = {
                this.tempSubject.asObservable()
            }
            width = {
                200
            }
            height = {
                500
            }
            label = "Live data" />
            </div>
        )
    }
}

const deviceId = '28-8000000117ab';

const Measures = gql `
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

const NewMeasuresSubscription = gql `
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
                updateQuery: (prev, {
                    subscriptionData
                }) => {
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
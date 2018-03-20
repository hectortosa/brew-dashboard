import React, {Component} from 'react';
import TemperatureChart from '../TemperatureChart';
import Request from 'request';

export default class Home extends Component {
    render() {
        return (
            <div className="text-center">
                <h1>Temperature Monitor</h1>
                <TemperatureChart width={200} height={500} getNewValue={this.fetchData} refreshTime={5000}
                                  delayTime={1000}/>
            </div>
        )
    }

    fetchData(callback) {
        let requestOptions = {
            uri: 'https://ht-brew-dashboard.azurewebsites.net/api/getLastReading?code=t1hVZh/kJeVkJjmCwR/QXGZ02b8iTH2gdFD6kT68dYa/wszdGia1ZQ==&clientId=default',
            method: 'POST',
            json: true,
            body: {requestTime: Date.now()}
        };

        Request(requestOptions, function (error, response, body) {
            if (error) return;
            callback(body.celsius);
        });
    }
}
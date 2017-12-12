import React, {Component} from 'react';
import {Line} from 'react-chartjs-2';
// eslint-disable-next-line
import * as ChartjsStreaming from 'chartjs-plugin-streaming';

class TemperatureChart extends Component {
    constructor(props) {
        super(props);

        this.state = {
            datasets: [
                {
                    label: 'Fermentation temp',
                    fill: false,
                    borderColor: 'rgba(51, 187, 199, 1)',
                    backgroundColor: 'rgba(51, 187, 199, 0.5)',
                    lineTension: 0.1,
                    pointHitRadius: 50,
                    data: []
                }
            ]
        };

        this.getChartData = this.getChartData.bind(this);

        this.options = {
            maintainAspectRatio: false,
            scales: {
                xAxes: [{
                  type: 'realtime'
                }],
                yAxes: [{
                    ticks: {
                        suggestedMin: 0,
                        suggestedMax: 40,
                        stepSize: 5
                    }
                }]
            },
            plugins: {
                streaming: {
                    refresh: this.props.refreshTime,
                    onRefresh: this.getChartData,
                    delay: this.props.delayTime
                }
            }
        };
    }

    getChartData(chart) {
        var datasets = chart.data.datasets;

        this.props.getNewValue(function (newValue) {
            datasets[0].data.push({
                x: Date.now(),
                y: newValue
            }); 
        });
    }

    render() {
        return (
            <div>
                <h2>Live data</h2>
                <Line data={this.state} options={this.options} width={this.props.width} height={this.props.height}/>
            </div>);
    }
}

export default TemperatureChart;
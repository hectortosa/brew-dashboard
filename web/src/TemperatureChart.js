import React, {Component} from 'react';
import {Line} from 'react-chartjs-2';

import 'chartjs-plugin-streaming';

class TemperatureChart extends Component {
    state = {
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

    options = {
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
                onRefresh: (chart) => this.getChartData(chart),
                delay: this.props.delayTime
            }
        }
    };

    getChartData(chart) {
        const datasets = chart.data.datasets;

        this.props.getNewValue(function (newValue) {
            datasets[0].data.push({
                x: Date.now(),
                y: newValue
            });
        });
    }

    render() {
        const hasLabel = !!this.props.label;
        return (
            <div>
                {hasLabel
                    ? <h2>{this.props.label}</h2>
                    : null
                }
                <Line data={this.state} options={this.options} width={this.props.width} height={this.props.height}/>
            </div>
        );
    }
}

TemperatureChart.defaultProps = {
    width: 100,
    height: 100,
    refreshTime: 1000,
    delayTime: 1000,
    getNewValue: (cb) => cb(Math.random()*100)
};

export default TemperatureChart;
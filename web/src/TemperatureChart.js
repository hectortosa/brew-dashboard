import React, {Component} from 'react';
import {Line} from 'react-chartjs-2';

const options = {
    maintainAspectRatio: false,
    scales: {
        xAxes: [{
            type: 'time'
        }],
        yAxes: [{
            ticks: {
                suggestedMin: 0,
                suggestedMax: 40,
                stepSize: 5
            }
        }]
    }
};

class TemperatureChart extends Component {

    static defaultProps = {
        width: 100,
        height: 100
    };

    state = {
        data: {
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
        }
    };

    constructor(props) {
        super(props);

        if (!props.stream) {
            return;
        }

        props.stream.subscribe((next) => {
            const data = this.state.data.datasets[0].data;
            data.push(next);
            if (data.length > 10) {
                data.shift();
            }
            if (this.lineCmp !== undefined) {
                this.lineCmp.chartInstance.update();
            }
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
                <Line ref={(child) => {
                    this.lineCmp = child;
                }} data={this.state.data} options={options} width={this.props.width} height={this.props.height}/>
            </div>
        );
    }
}

export default TemperatureChart;
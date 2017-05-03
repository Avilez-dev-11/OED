/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Line } from 'react-chartjs-2';
import moment from 'moment';
import { connect } from 'react-redux';
import 'chartjs-plugin-zoom';
import GraphColors from '../utils/GraphColors';

/**
 * @param {State} state
 */
function mapStateToProps(state) {
	const timeInterval = state.graph.timeInterval;
	const data = { datasets: [] };
	const graphColors = new GraphColors();

	for (const meterID of state.graph.selectedMeters) {
		const readingsData = state.readings.line.byMeterID[meterID][timeInterval];
		const color = graphColors.getColor();
		if (readingsData !== undefined && !readingsData.isFetching) {
			data.datasets.push({
				label: state.meters.byMeterID[meterID].name,
				data: readingsData.readings.map(arr => ({ x: arr[0], y: arr[1].toFixed(2) })),
				fill: false,
				borderColor: color
			});
			if (state.meters.baselines.hasOwnProperty(meterID)) {
				data.datasets.push({
					label: state.meters.byMeterID[meterID].name+' Baseline',
					data: readingsData.readings.map(arr => ({ x: arr[0], y: state.meters.baselines[meterID]['baseline_value'] })),
					fill: false,
					borderColor: color
				});
		}
		}
	}

	const options = {
		animation: {
			duration: 0
		},
		elements: {
			point: {
				radius: 0
			}
		},
		scales: {
			xAxes: [{
				type: 'time'
			}],
			yAxes: [{
				scaleLabel: {
					display: true,
					labelString: 'kWh'
				},
				ticks: {
					beginAtZero: true
				}
			}]
		},
		tooltips: {
			mode: 'nearest',
			intersect: false,
			backgroundColor: 'rgba(0,0,0,0.6)',
			displayColors: false,
			callbacks: {
				title: tooltipItems => `${moment(tooltipItems[0].xLabel).format('dddd, MMM DD, YYYY hh:mm a')}`,
				label: tooltipItems => `${data.datasets[tooltipItems.datasetIndex].label}: ${tooltipItems.yLabel} kWh`
			}
		},
		pan: {
			enabled: true,
			mode: 'x'
		},
		zoom: {
			enabled: true,
			mode: 'x',
		}
	};

	return {
		data,
		options,
		redraw: true
	};
}

export default connect(mapStateToProps)(Line);

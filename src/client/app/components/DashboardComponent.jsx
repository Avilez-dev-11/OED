/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { defaults } from 'react-chartjs-2';
import UIOptionsContainer from '../containers/UIOptionsContainer';
import LineChartContainer from '../containers/LineChartContainer';
import BarChartContainer from '../containers/BarChartContainer';
import MultiCompareChartContainer from '../containers/MultiCompareChartContainer';
import { chartTypes } from '../reducers/graph';

defaults.global.plugins.datalabels.display = false;

/**
 * React component that controls the dashboard
 */
export default class DashboardComponent extends React.Component {
	constructor(props) {
		super(props);
	}

	componentWillMount() {
		this.props.fetchAllBaselines();
	}

	render() {
		const divPadding = {
			paddingTop: '35px'
		};
		let ChartToRender = '';
		if (this.props.chartToRender === chartTypes.line) {
			ChartToRender = LineChartContainer;
		} else if (this.props.chartToRender === chartTypes.compare) {
			ChartToRender = MultiCompareChartContainer;
		} else {
			ChartToRender = BarChartContainer;
		}
		return (
			<div className="container-fluid">
				<div>
					<div className="col-xs-2 hidden-sm hidden-xs" style={divPadding}>
						<UIOptionsContainer />
					</div>
					<div className="col-xs-10">
						<ChartToRender />
					</div>
				</div>
			</div>
		);
	}

}

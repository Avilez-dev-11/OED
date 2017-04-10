/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import _ from 'lodash';
import TimeInterval from '../../../common/TimeInterval';
import * as graphActions from '../actions/graph';

/**
 * @typedef {Object} State~Graph
 * @property {Array.<number>} selectedMeters
 * @property {TimeInterval} timeInterval
 */

/**
 * @type {State~Graph}
 */
const defaultState = {
	selectedMeters: [],
	baselines: [],
	timeInterval: TimeInterval.unbounded()
};

/**
 * @param {State~Graph} state
 * @param action
 * @return {State~Graph}
 */
export default function graph(state = defaultState, action) {
	switch (action.type) {

		case graphActions.UPDATE_SELECTED_METERS:
			return {
				...state,
				selectedMeters: action.meterIDs,
				baselines: action.baselines
			};
		case graphActions.SET_GRAPH_ZOOM:
			return {
				...state,
				timeInterval: action.timeInterval
			};
		default:
			return state;
	}
}

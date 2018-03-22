/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const express = require('express');
const config = require('../config');
const { log } = require('../log');

const router = express.Router();

const MODE_STATUS = 'STATUS';
const MODE_LOGFILE_UPLOAD = 'LOGFILEUPLOAD';
const MODE_CONFIG_MANIFEST = 'CONFIGFILEMANIFEST';
const MODE_CONFIG_UPLOAD = 'CONFIGFILEUPLOAD';
const MODE_CONFIG_DOWNLOAD = 'CONFIGFILEDOWNLOAD';
const MODE_TEST = 'MODE_TEST';

/**
 * Inform the client of a failure (406 Not Acceptable), and log it.
 *
 * @param {express.Request} req The Express request object
 * @param {express.Response} res The Express response object
 * @param {string} reason The reason for the failure.
 *
 */
function failure(req, res, reason = '') {
	const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	log.error(`Obvius protocol request from ${ip} failed due to ${reason}`);

	res.status(406) // 406 Not Acceptable error, as required by Obvius
		.send(`<pre> ${reason} </pre>`);
}

/**
 * Inform the client of a success (200 OK).
 *
 * @param {express.Request} req The Express request object
 * @param {express.Response} res The Express response object
 * @param {string} comment Any additional data to be returned to the client.
 *
 */
function success(req, res, comment = '') {
	res.status(200) // 200 OK
		.send(`<pre>\nSUCCESS\n ${comment} "</pre>`);
}
/**
 * Logs a STATUS request for later examination.
 * @param {express.Request} req the request to process (must have the req.param mixin)
 * @param {express.Response} res the response object
 */
function handleStatus(req, res) {
	// Grab the IP of the requester.
	const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	// These are all the params OED cares about. They just get logged.
	// Note that this route does NOT log the password, for security reasons.
	const paramNames = ['MODE', 'SENDDATATRACE', 'SERIALNUMBER', 'GSMSIGNAL',
		'LOOPNAME', 'UPTIME', 'PERCENTBLOCKSINUSE', 'PERCENTINODESINUSE',
		'UPLOADATTEMPT', 'ACQUISUITEVERSION', 'USRVERSION', 'ROOTVERSION',
		'KERNELVERSION', 'FIRMWAREVERSION', 'BOOTCOUNT', 'BATTERYGOOD'];
	// Build a log entry for this request
	let s = `Handling request from ${ip}\n`;
	for (const paramName of paramNames) {
		if (req.param(paramName) !== false && req.param(paramName) !== undefined) {
			s += `\tGot ${paramName}: ${req.param(paramName)}\n`;
		} else {
			s += `\tNo ${paramName} submitted\n`;
		}
	}
	log.info(s);

	success(req, res);
}

/**
 * A middleware to lowercase all params.
 */
router.use((req, res, next) => {
	for (const key of req.query) {
		log.info(key);
		req.query[key.toLowerCase()] = req.query[key];
	}
	for (const key of req.params) {
		log.info(key);
		req.params[key.toLowerCase()] = req.params[key];
	}
	if (req.body) {
		for (const key of req.body) {
			log.info(key);
			req.body[key.toLowerCase()] = req.body[key];
		}
	}
	next();
});

/**
 * A middleware to add our params mixin
 */
router.use((req, res, next) => {
	// Mixin for getting parameters from any possible method.
	req.param = (param, defaultValue) => {
		param = param.toLowerCase();
		// If the param exists as a route param, use it.
		if (typeof req.params[param] !== 'undefined') {
			return req.params[param];
		}
		// If the param exists as a body param, use it.
		if (req.body && typeof req.body[param] !== 'undefined') {
			return req.body[param];
		}
		// Return the query param, if it exists.
		if (typeof req.query[param] !== 'undefined') {
			return req.query[param];
		}
		// Return the default value if all else fails.
		return defaultValue;
	};

	next();
});

/**
 * Handle an Obvius upload request.
 * Unfortunately the Obvious API does not specify a HTTP verb.
 */
router.all('/', async (req, res) => {
	// Log the IP of the requester
	const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	log.info(`Received Obvious protocol request from ${ip}`);

	// Attempt to verify the password
	if (!req.param('password')) {
		failure(req, res, 'password parameter is required.');
		return;
	} else if (req.param('password') !== config.obvius.password) {
		failure(req, res, 'password was not correct.');
		return;
	}

	const mode = req.param('mode', false);
	if (mode === false) {
		failure(req, res, 'Request must include mode parameter.');
		return;
	}

	if (mode === MODE_STATUS) {
		handleStatus(req, res);
		return;
	}

	if (mode === MODE_LOGFILE_UPLOAD) {
		failure(req, res, 'Logfile Upload Not Implemented');
		return;
	}

	if (mode === MODE_CONFIG_DOWNLOAD) {
		failure(req, res, 'Config Download Not Implemented');
		return;
	}

	if (mode === MODE_CONFIG_MANIFEST) {
		failure(req, res, 'Config Manifest Not Implemented');
		return;
	}

	if (mode === MODE_CONFIG_UPLOAD) {
		failure(req, res, 'Config Upload Not Implemented');
		return;
	}

	if (mode === MODE_TEST) {
		failure(req, res, 'Test Not Implemented');
		return;
	}

	failure(req, res, `Unknown mode '${mode}'`);
});

module.exports = router;

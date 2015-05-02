/*
 * catberry-assets
 *
 * Copyright (c) 2015 Denis Rechkunov and project contributors.
 *
 * catberry-assets's license follows:
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * This license applies to all parts of catberry-assets that are not externally
 * maintained libraries.
 */

'use strict';

module.exports = PostBuildAction;

var csstime = require('csstime-gulp-tasks'),
	prettyTime = require('pretty-hrtime'),
	util = require('util'),
	path = require('path'),
	gulp = require('gulp');

var INFO_START = 'Starting assets building...',
	TRACE_TASK_START = 'Starting task %s...',
	TRACE_TASK_END = 'Task %s finished after %s',
	ERROR_TASK = 'Task %s finished with error after %s: %s',
	ERROR_TASK_NOT_FOUND = 'Task %s not found';

/**
 * Creates new instance of the assets post build action.
 * @param {Object} $config Catberry application config.
 * @param {Logger} $logger Logger.
 * @constructor
 */
function PostBuildAction($config, $logger) {
	this._isRelease = Boolean($config.isRelease);
	this._config = $config.assets || {};
	this._config.componentJSON = this._config.componentJSON ||
		'cat-component.json';
	this._config.destinationDir = this._config.destinationDir ||
		$config.publicDirectoryPath || 'public';
	this._config.destinationComponentsDir =
		this._config.destinationComponentsDir || 'assets';
	this._config.cdnPath = this._config.cdnPath || '/assets/';
	this._logger = $logger;
	this._wrapWithLogger(gulp);
}

/**
 * Current assets configuration.
 * @type {Object}
 * @private
 */
PostBuildAction.prototype._config = null;

/**
 * Current application release mode flag.
 * @type {boolean}
 * @private
 */
PostBuildAction.prototype._isRelease = false;

/**
 * Build application assets.
 * @param {StoreFinder} storeFinder Catberry store finder.
 * @param {ComponentFinder} componentFinder Catberry component finder.
 * @returns {Promise} Promise for nothing.
 */
PostBuildAction.prototype.action = function (storeFinder, componentFinder) {
	var self = this;
	self._logger.info(INFO_START);
	return componentFinder.find()
		.then(function (components) {
			var directories = {};
			Object.keys(components)
				.forEach(function (componentName) {
					var component = components[componentName],
						componentDirectory = path.dirname(component.path),
						parentDirectory = path.dirname(componentDirectory);
					directories[parentDirectory] = true;
				});
			self._config.componentsRootDirs = Object.keys(directories);
			csstime.loadGulpTasks(gulp, self._config);
			if (self._isRelease) {
				gulp.start('csstime-mode-release');
			} else {
				gulp.start('csstime-mode-watch');
			}
		});
};

/**
 * Wrap Gulp with Catberry logger.
 * @param {Gulp} gulpInst Gulp instance.
 * @private
 */
PostBuildAction.prototype._wrapWithLogger = function (gulpInst) {
	var self = this;
	// Total hack due to poor error management in orchestrator
	gulpInst
		.on('err', function (error) {
			self._logger.error(error);
		})
		.on('task_start', function (args) {
			self._logger.trace(util.format(TRACE_TASK_START, args.task));
		})
		.on('task_stop', function (args) {
			self._logger.trace(
				util.format(
					TRACE_TASK_END, args.task, prettyTime(args.hrDuration)
				)
			);
		})
		.on('task_err', function (error) {
			self._logger.error(
				util.format(
					ERROR_TASK, error.task,
					prettyTime(error.hrDuration), error.message
				)
			);
			self._logger.error(error);
		})
		.on('task_not_found', function (error) {
			self._logger.error(util.format(ERROR_TASK_NOT_FOUND, error.task));
		});
};
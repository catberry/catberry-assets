'use strict';

const csstime = require('csstime-gulp-tasks');
const prettyTime = require('pretty-hrtime');
const path = require('path');
const gulp = require('gulp');

class PostBuildAction {

	/**
	 * Creates new instance of the assets post build action.
	 * @param {Locator} locator The service locator for resolving dependencies.
	 */
	constructor(locator) {
		const config = locator.resolve('config');

		/**
		 * Current assets configuration.
		 * @type {Object}
		 * @private
		 */
		this._config = config.assets || {};

		/**
		 * Current application release mode flag.
		 * @type {boolean}
		 * @private
		 */
		this._isRelease = Boolean(config.isRelease);

		/**
		 * Current event bus.
		 * @type {EventBus}
		 * @private
		 */
		this._eventBus = locator.resolve('eventBus');

		this._config.componentJSON = this._config.componentJSON || 'cat-component.json';
		this._config.destinationDir = this._config.destinationDir || config.publicDirectoryPath || 'public';
		this._config.destinationComponentsDir = this._config.destinationComponentsDir || 'assets';
		this._config.cdnPath = this._config.cdnPath || '/assets/';

		this._wrapWithLogger(gulp);
	}

	/**
	 * Build application assets.
	 * @param {StoreFinder} storeFinder Catberry store finder.
	 * @param {ComponentFinder} componentFinder Catberry component finder.
	 * @returns {Promise} Promise for nothing.
	 */
	action(storeFinder, componentFinder) {
		this._eventBus.emit('info', 'Starting assets building...');

		return componentFinder
			.find()
			.then(components => {
				const directories = {};

				Object
					.keys(components)
					.forEach(componentName => {
						const component = components[componentName];
						const componentDirectory = path.dirname(component.path);
						const parentDirectory = path.dirname(componentDirectory);

						directories[parentDirectory] = true;
					});

				this._config.componentsRootDirs = Object.keys(directories);
				csstime.loadGulpTasks(gulp, this._config);

				gulp.start(this._isRelease ? 'csstime-mode-release' : 'csstime-mode-watch');
			});
	}

	/**
	 * Wrap Gulp with Catberry logger.
	 * @param {Gulp} gulpInst Gulp instance.
	 * @private
	 */
	_wrapWithLogger(gulpInst) {
		// Total hack due to poor error management in orchestrator
		gulpInst
			.on('err', error => this._eventBus.emit('error', error.err ? error.err : error))
			.on('task_start', args => this._eventBus.emit('trace', `Starting task ${args.task}...`))
			.on('task_stop', args => this._eventBus.emit('trace', `Task ${args.task} finished after ${prettyTime(args.hrDuration)}`))
			.on('task_not_found', error => this._eventBus.emit('error', `Task ${error.task} not found`))
			.on('task_err', error => {
				this._eventBus.emit('warn', `Task ${error.task} finished with error after ${prettyTime(error.hrDuration)}`);
			});
	}
}

module.exports = PostBuildAction;

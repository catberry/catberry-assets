# Assets plugin for [Catberry Framework](https://github.com/catberry/catberry)

[![NPM](https://nodei.co/npm/catberry-assets.png)](https://nodei.co/npm/catberry-assets/)

![Catberry](https://raw.githubusercontent.com/catberry/catberry/master/docs/images/logo.png)

This is a plugin for working with Catberry component's assets.
If you want component to have any assets like CSS/LESS and images you just need
to add the plugin to your project and put all this stuff to a directory `assets`
of your component, this plugin will do everything for you.

Also, you can have a global assets directory called `static` at the root 
of your project. 

For example, your project tree can look like this:

```
catberry_components/
	component1/
		assets/
			c1-1.jpg
			c1-2.png
			c1-3.svg
			styles.less
		...
	component2/
		assets/
			c2-1.jpg
			c2-2.png
			c3-3.svg
			styles.less
		...
static/
	static1.jpg
	static2.png
	static3.svg
	styles.less
```

Your assets will be put to a [public directory](https://github.com/catberry/catberry/blob/master/docs/index.md#config) like this:

```
public/
	assets/
		component1/
			c1-1.jpg
			c1-2.png
			c1-3.svg
			...
		component2/
			c2-1.jpg
			c2-2.png
			c3-3.svg
		...
static1.jpg
static2.png
static3.svg
style.css
```
You are safe to use URLs to assets like `/assets/component1/c1-1.jpg` in your 
styles or HTML.

# How to use

In `build.js`

```javascript
var assets = require('catberry-assets'),
	catberry = require('catberry'),
	config = require('./config-build'),
	cat = catberry.create(config);

// register plugin to the service locator
assets.register(cat.locator);

// now we can build a Catberry bundle
cat.build();
```

The plugin uses [csstime](https://github.com/csstime/csstime-gulp-tasks) package under the hood, you can pass parameters
to the csstime using section `assets` in the `config` object.
For learning all possible parameters, you can see the [documentation](https://github.com/csstime/csstime-gulp-tasks/blob/master/doc/configs.md). 

## Contribution
If you have found a bug, please create pull request with [mocha](https://www.npmjs.org/package/mocha) 
unit-test which reproduces it or describe all details in an issue if you can not
implement test. If you want to propose some improvements just create an issue or
a pull request but please do not forget to use `npm test` to be sure that your
code is awesome.

All changes should satisfy this [Code Style Guide](https://github.com/catberry/catberry/blob/5.0.0-dev/docs/code-style-guide.md).

Also, your changes should be covered by unit tests using [mocha](https://www.npmjs.org/package/mocha).

Denis Rechkunov <denis.rechkunov@gmail.com>
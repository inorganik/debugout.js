debugout.js
===========

(debug output) records and saves console logs so that your application can access them, for the purpose of debugging an app while it's in beta. 

Then you can add a button for the tester to output the log ([see examples](#outputting)) and download it, or have your app post it to an endpoint on your server.

##[Try the demo](http://inorganik.github.io/debugout.js/)

### Usage

Create a new debugout object and replace all your console log methods with debugout's log method:

```js
var bugout = new debugout();

// instead of console.log('some object or string')
bugout.log('some object or string');
```

### Options

In the debugout() function definition, you can edit some things:

```js
self.realTimeLoggingOn = true; // log in real time (toggles console.log)
self.useTimestamps = true; // insert a timestamp in front of each log
self.useLocalStorage = false; // store the output using window.localStorage()
self.continuous = true; // if using localStorage, will continue to add to the same log file each session, with dividers
```

### Methods

- `log()` - like `console.log()` only as though you "pressed record".
- `getLog()` - get yer log.
- `clear()` - clear the current log.
- `determineType()` - a more granular version of `typeof` for your convenience

### Advantages

- Have an idea what's going on when a client/tester reports a bug
- Dependency-free and lightweight
- Toggle console logging on and off in one place
- Know when things happened, and how long a client/tester was using your app

### Outputting the log <a name="outputting"></a>

Debugout.js provides a method for you to output the log, but it's up to you to do something with it. Here are a couple examples of what you can do after you use the `getLog()` method.

Each example assumes that you have established a `debugout` object and are logging with it:

```js
var bugout = new debugout.js
bugout.log('something');
bugout.log(somethingElse);
bugout.log('etc');
```

##### Example #1: Button that downloads the log as a .txt file

```html
    &lt;input type="button" value="Download log" onClick="downloadLog()"&gt;
````

```js
function downloadLog() {
	var file = "data:text/plain;charset=utf-8,";
	var logFile = bugout.getLog();
	var encoded = encodeURIComponent(logFile);
	file += encoded;

	var a = document.createElement('a');
	a.href = file;
	a.target   = '_blank';
	a.download = 'myApp_log.txt';
	document.body.appendChild(a);
	a.click();
	a.remove();
}

```

##### Example #2: PhoneGap app with [Email Composer plugin](https://github.com/inorganik/cordova-emailComposerWithAttachments) that attaches the log to an email

<<<<<<< HEAD
Example shown also requires the File plugin: `cordova plugin add org.apache.cordova.file`.
=======
(Also requires File plugin: `cordova plugin add org.apache.cordova.file`)
>>>>>>> FETCH_HEAD

```js
function sendLog() {
	var logFile = bugout.getLog();

	// save the file locally, so it can be retrieved from emailComposer
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
		// create the file if it doesn't exist
		fileSystem.root.getFile('log.txt', {create: true, exclusive: false}, function(file) {
			// create writer
			file.createWriter(function(writer) {
		        // write
	    		writer.write(logFile);
	    		// when done writing, call up email composer
				writer.onwriteend = function(evt) {
		            // params: subject,body,toRecipients,ccRecipients,bccRecipients,bIsHTML,attachments,filename
		            var subject = 'Log from myApp';
		            var body = 'Attached is a log from my recent testing session.';
					window.plugins.emailComposer.showEmailComposer(subject,body,[],[],[],false,['log.txt'], ['myApp log']);
		        }
			}, fileSystemError);
		}, fileSystemError);
	}, fileSystemError);
}

function fileSystemError(error) {
    bugout.log('Error getting file system: '+error.code);
}
```



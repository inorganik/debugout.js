debugout.js
===========

(debug output) generates a text file from your logs that can be searched, timestamped, downloaded and more. [See some examples below](#outputting).

Debugout's `log()` accepts any type of object including functions. Debugout is not a monkey patch, but a separate logging class altogether that you use instead of `console`.

Some highlights of debugout:

- get the entire log, or the tail at run-time or any time
- search and slice the log
- better understand usage patterns with optional timestamps
- toggle live logging (console.log) in one place
- optionally store the output in `window.localStorage` and continuously add to the same log each session
- optionally cap the log to X most recent lines to limit memory consumption

##[Try the demo](http://inorganik.github.io/debugout.js/)

### Usage

Create a new debugout object in the global namespace, at the top of your script, and replace all your console log methods with debugout's log method:

```js
var bugout = new debugout();

// instead of console.log('some object or string')
bugout.log('some object or string');
```
Whatever you log is saved and added to the log file on a new line.

### Methods

- `log()` - like `console.log()`, but saved!
- `getLog()` - returns the entire log.
- `tail(numLines)` - returns the last X lines of the log, where X is the number you pass. Defaults to 100.
- `search(string)` - returns numbered lines where there were matches for your search. Pass a string.
- `getSlice(start, numLines)` - get a 'slice' of the log. Pass the starting line and how many lines after it you want
- `downloadLog()` - downloads a .txt file of the log. [See example below](#outputting).
- `clear()` - clears the log.
- `determineType()` - a more granular version of `typeof` for your convenience

### Options <a name="options"></a>

In the debugout function definition, you can edit options:

```js
// log in real time (forwards to console.log)
self.realTimeLoggingOn = true; 
// insert a timestamp in front of each log
self.useTimestamps = false; 
// store the output using window.localStorage() and continuously add to the same log each session
self.useLocalStorage = false; 
// set to false after you're done debugging to avoid the log eating up memory
self.recordLogs = true; 
// to avoid the log eating up potentially endless memory
self.autoTrim = true; 
// if autoTrim is true, this many most recent lines are saved
self.maxLines = 2500; 
// how many lines tail() will retrieve
self.tailNumLines = 100; 
// filename of log downloaded with downloadLog()
self.logFilename = 'log.txt';
```

### Outputting examples <a name="outputting"></a>

Here are a couple examples of what you can do with the log. Each example assumes that you have established a `debugout` object and are logging with it:

```js
var bugout = new debugout();
bugout.log('something');
bugout.log(somethingElse);
bugout.log('etc');
```

##### Example #1: Button that downloads the log as a .txt file

Simply call debugout's `downloadLog()` method. You can change the filename by editing `self.logFilename`.

```html
<input type="button" value="Download log" onClick="bugout.downloadLog()">
````

##### Example #2: PhoneGap app that attaches the log to an email

Example shown uses the [Email Composer plugin](https://github.com/inorganik/cordova-emailComposerWithAttachments) and also requires the File plugin: `cordova plugin add org.apache.cordova.file`.

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
### And more...

- Post the log to your server via an ajax request if an error or some other event occurs.
- Allow the user to download a copy of a submitted form.
- Generate a receipt for the user to download.
- Record survey answers and know how long each question took the user to answer.




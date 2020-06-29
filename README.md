debugout.js
===========

(debug output) generates a text file from your logs that can be searched, timestamped, downloaded and more. 

Debugout's `log()` method accepts 1 or more args of any type, including functions. Debugout is not a monkey patch, but a separate logging class altogether that you use in place of `console`.

Some highlights of debugout:

- get the entire log, or the tail at runtime or any time
- download the log as a text file
- search and slice the log
- optionally timestamp logs
- also supports info, warn and error methods
- toggle live logging (console.log) in one place
- optionally store the output in `window.localStorage` and continuously add to the same log each session
- optionally cap the log to X most recent lines to limit memory consumption

** New in 1.0 **

- Improved logging (multiple args, better formatting)
- Modularized
- More options
- Tested with jest

## [Try the demo](http://inorganik.github.io/debugout.js/)

### Installation

npm: `npm i debugout.js`

### Usage

Use as a replacement for `console`, or just use it as a logging utility.

```js
import { Debugout } from 'debugout.js';

const bugout = new Debugout();

// instead of console.log
bugout.log('log stuff', someObject, someArray);
```
Whatever you log is saved and added to the log file.

### Methods

- `log()`, `warn()`, `info()`, `error()` - just like `console`, but saved!
- `getLog()` - returns the entire log.
- `tail(numLines)` - returns the last X lines of the log, where X is the number you pass. Defaults to 100.
- `search(string)` - returns numbered lines where there were matches for your search. Pass a string.
- `getSlice(start, end)` - get a 'slice' of the log. Pass the starting line index and optionally an ending line index.
- `downloadLog()` - downloads a .txt file of the log.
- `clear()` - clears the log.
- `determineType()` - a more granular version of `typeof` for your convenience

### Options

Pass any of the following options in the constructor in an object. You can also change them at runtime as properties of your debugout instance.

```ts
export interface DebugoutOptions {
  realTimeLoggingOn?: boolean; // log in real time (forwards to console.log)
  useTimestamps?: boolean; // insert a timestamp in front of each log
  includeSessionMetadata?: boolean; // whether to include session start, end, duration, and when log is cleared
  useLocalStorage?: boolean; // store the output using localStorage and continuously add to the same log each session
  recordLogs?: boolean; // disable the core functionality of this lib 
  autoTrim?: boolean; // to avoid the log eating up potentially endless memory
  maxLines?: number; // if autoTrim is true, this many most recent lines are saved
  tailNumLines?: number; // default number of lines tail gets
  logFilename?: string; // filename of log downloaded with downloadLog()
  maxDepth?: number; // max recursion depth for logged objects
  localStorageKey?: string; // localStorage key
  indent?: string; // string to use for indent (2 spaces)
  quoteStrings?: boolean; // whether or not to put quotes around strings
}
```
Example using options:

```js
const bugout = new Debugout({ realTimeLoggingOn: false });

// instead of console.log
bugout.log('log stuff'); // real time logging disabled (no console output)
bugout.realTimeLoggingOn = true;
bugout.log('more stuff'); // now, this will show up in your console.
```

### Usage ideas

- Post the log to your server if an error or some other event occurs.
- Allow the user to download a copy of a submitted form.
- Generate output for the user to download.
- Record survey answers and know how long each question took the user to answer.

### Contributing

1. Do your work in src/debugout.ts
1. Test `npm t`
1. Test demo: `npm start`

### Don't log `window`

Debugout will get stuck in an endless loop if you try to log the window object because it has a circular reference. It will work if you set `maxDepth` to 2, and you can see the root properties. The same thing happens if you do `JSON.stringify(window, null, '  ')`, but the error message provides some insight. 

If you try to log Debugout, it just prints `... (Debugout)`. Otherwise, recursion would cause an endless loop.


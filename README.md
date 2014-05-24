debugout.js
===========

(debug output) records and saves console logs so that your application can access them, for the purpose of debugging an app while it's in beta. 

Then you can add a button for the tester to output the log and send it to you, or have your app post it to an endpoint on your server.

##[Try the demo](http://inorganik.github.io/debugout.js/)

### Usage

Create a new debugout object and replace all your console log methods with the debugout's log method:

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
- Toggle console logging on and off in one place
- Know when things happened, and how long a client/tester was using your app

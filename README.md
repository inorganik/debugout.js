debugout.js
===========

(debug output) records and saves console logs, so that your application can access them.

For instance, you could put a button in your app that sends you the log in some way, like posting it to an endpoint on your server.

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
self.realTimeLoggingOn = true; // log in real time (forwards to console.log)
self.useTimestamps = true; // insert a timestamp in front of each log
self.useLocalStorage = false; // store the output using window.localStorage()
self.continuous = true; // if using localStorage, will continue to add to same the log each session, with dividers
```

### Advantages

- Have an idea what's going on when a client/tester reports a bug
- Toggle console logging on and off in one place
- Know when things happened, and how long a client/tester was using your app

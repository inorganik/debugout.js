var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var debugoutDefaults = {
    realTimeLoggingOn: true,
    useTimestamps: false,
    includeSessionMetadata: true,
    useLocalStorage: false,
    recordLogs: true,
    autoTrim: true,
    maxLines: 3000,
    tailNumLines: 25,
    maxDepth: 20,
    logFilename: 'debugout.txt',
    localStorageKey: 'debugout.js',
    indent: '  ',
    quoteStrings: true
};
var Debugout = /** @class */ (function () {
    /* tslint:enable:no-console */
    function Debugout(options) {
        var _this = this;
        this.indent = '  ';
        this.tailNumLines = 25;
        this.output = ''; // holds all logs
        this.version = function () { return '1.0.0'; };
        this.indentsForDepth = function (depth) { return _this.indent.repeat(Math.max(depth, 0)); };
        // forwarded console methods not used by debugout
        /* tslint:disable:no-console */
        this.trace = function () { return console.trace(); };
        this.time = function () { return console.time(); };
        this.timeEnd = function () { return console.timeEnd(); };
        // set options from defaults and passed options.
        var settings = __assign(__assign({}, debugoutDefaults), options);
        for (var prop in settings) {
            if (settings[prop] !== undefined) {
                this[prop] = settings[prop];
            }
        }
        // START/RESUME LOG
        if (this.useLocalStorage && window && !!window.localStorage) {
            var stored = this.load();
            if (stored) {
                this.output = stored.log;
                this.startTime = new Date(stored.startTime);
                var end = new Date(stored.lastLog);
                this.logMetadata("Last session end: " + stored.lastLog);
                this.logMetadata("Last " + this.formatSessionDuration(this.startTime, end));
                this.startLog();
            }
            else {
                this.startLog();
            }
        }
        else {
            this.useLocalStorage = false;
            this.startLog();
        }
    }
    Debugout.prototype.startLog = function () {
        this.startTime = new Date();
        this.logMetadata("Session started: " + this.formatDate(this.startTime));
    };
    // records a log
    Debugout.prototype.recordLog = function () {
        var _this = this;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        // record log
        if (this.useTimestamps) {
            this.output += this.formatDate() + ' ';
        }
        this.output += args.map(function (obj) { return _this.stringify(obj); }).join(' ');
        this.output += '\n';
        if (this.autoTrim)
            this.output = this.trimLog(this.maxLines);
        if (this.useLocalStorage) {
            var saveObject = {
                startTime: this.startTime,
                log: this.output,
                lastLog: new Date()
            };
            window.localStorage.setItem(this.localStorageKey, JSON.stringify(saveObject));
        }
    };
    Debugout.prototype.logMetadata = function (msg) {
        if (this.includeSessionMetadata)
            this.output += "---- " + msg + " ----\n";
    };
    // USER METHODS
    Debugout.prototype.log = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (this.realTimeLoggingOn)
            console.log.apply(console, args);
        if (this.recordLogs)
            this.recordLog.apply(this, args);
    };
    Debugout.prototype.info = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        // tslint:disable-next-line:no-console
        if (this.realTimeLoggingOn)
            console.info.apply(console, args);
        if (this.recordLogs) {
            this.output += '[INFO] ';
            this.recordLog.apply(this, args);
        }
    };
    Debugout.prototype.warn = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (this.realTimeLoggingOn)
            console.warn.apply(console, args);
        if (this.recordLogs) {
            this.output += '[WARN] ';
            this.recordLog.apply(this, args);
        }
    };
    Debugout.prototype.error = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (this.realTimeLoggingOn)
            console.error.apply(console, args);
        if (this.recordLogs) {
            this.output += '[ERROR] ';
            this.recordLog.apply(this, args);
        }
    };
    Debugout.prototype.getLog = function () {
        var retrievalTime = new Date();
        // if recording is off, so dev knows why they don't have any logs
        if (!this.recordLogs) {
            this.info('Log recording is off');
        }
        // if using local storage, get values
        if (this.useLocalStorage && window && window.localStorage) {
            var stored = this.load();
            if (stored) {
                this.startTime = new Date(stored.startTime);
                this.output = stored.log;
            }
        }
        if (this.includeSessionMetadata) {
            return this.output + ("---- " + this.formatSessionDuration(this.startTime, retrievalTime) + " ----\n");
        }
        return this.output;
    };
    // clears the log
    Debugout.prototype.clear = function () {
        this.output = '';
        this.logMetadata("Session started: " + this.formatDate(this.startTime));
        this.logMetadata('Log cleared ' + this.formatDate());
        if (this.useLocalStorage)
            this.save();
    };
    // gets last X number of lines
    Debugout.prototype.tail = function (numLines) {
        var lines = numLines || this.tailNumLines;
        return this.trimLog(lines);
    };
    // find occurences of your search term in the log
    Debugout.prototype.search = function (term) {
        var rgx = new RegExp(term, 'ig');
        var lines = this.output.split('\n');
        var matched = [];
        // can't use a simple filter & map here because we need to add the line number
        for (var i = 0; i < lines.length; i++) {
            var addr = "[" + i + "] ";
            if (lines[i].match(rgx)) {
                matched.push(addr + lines[i].trim());
            }
        }
        var result = matched.join('\n');
        if (!result.length)
            result = "Nothing found for \"" + term + "\".";
        return result;
    };
    // retrieve a section of the log. Works the same as js slice
    Debugout.prototype.slice = function () {
        var _a;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return (_a = this.output.split('\n')).slice.apply(_a, args).join('\n');
    };
    // downloads the log - for browser use
    Debugout.prototype.downloadLog = function () {
        if (!!window) {
            var logFile = this.getLog();
            var blob = new Blob([logFile], { type: 'data:text/plain;charset=utf-8' });
            var a = document.createElement('a');
            a.href = window.URL.createObjectURL(blob);
            a.target = '_blank';
            a.download = this.logFilename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(a.href);
        }
        else {
            console.error('downloadLog only works in the browser');
        }
    };
    // METHODS FOR CONSTRUCTING THE LOG
    Debugout.prototype.save = function () {
        var saveObject = {
            startTime: this.startTime,
            log: this.output,
            lastLog: new Date()
        };
        window.localStorage.setItem(this.localStorageKey, JSON.stringify(saveObject));
    };
    Debugout.prototype.load = function () {
        var saved = window.localStorage.getItem(this.localStorageKey);
        if (saved) {
            return JSON.parse(saved);
        }
        return null;
    };
    Debugout.prototype.determineType = function (object) {
        if (object === null) {
            return 'null';
        }
        else if (object === undefined) {
            return 'undefined';
        }
        else {
            var type = typeof object;
            if (type === 'object') {
                if (Array.isArray(object)) {
                    type = 'Array';
                }
                else {
                    if (object instanceof Date) {
                        type = 'Date';
                    }
                    else if (object instanceof RegExp) {
                        type = 'RegExp';
                    }
                    else if (object instanceof Debugout) {
                        type = 'Debugout';
                    }
                    else {
                        type = 'Object';
                    }
                }
            }
            return type;
        }
    };
    // recursively stringify object
    Debugout.prototype.stringifyObject = function (obj, startingDepth) {
        if (startingDepth === void 0) { startingDepth = 0; }
        // return JSON.stringify(obj, null, this.indent); // can't control depth/line-breaks/quotes
        var result = '{';
        var depth = startingDepth;
        if (this.objectSize(obj) > 0) {
            result += '\n';
            depth++;
            var i = 0;
            for (var prop in obj) {
                result += this.indentsForDepth(depth);
                result += prop + ': ';
                var subresult = this.stringify(obj[prop], depth);
                if (subresult) {
                    result += subresult;
                }
                if (i < this.objectSize(obj) - 1)
                    result += ',';
                result += '\n';
                i++;
            }
            depth--;
            result += this.indentsForDepth(depth);
        }
        result += '}';
        return result;
    };
    // recursively stringify array
    Debugout.prototype.stringifyArray = function (arr, startingDepth) {
        if (startingDepth === void 0) { startingDepth = 0; }
        // return JSON.stringify(arr, null, this.indent); // can't control depth/line-breaks/quotes
        var result = '[';
        var depth = startingDepth;
        var lastLineNeedsNewLine = false;
        if (arr.length > 0) {
            depth++;
            for (var i = 0; i < arr.length; i++) {
                var subtype = this.determineType(arr[i]);
                var needsNewLine = false;
                if (subtype === 'Object' && this.objectSize(arr[i]) > 0)
                    needsNewLine = true;
                if (subtype === 'Array' && arr[i].length > 0)
                    needsNewLine = true;
                if (!lastLineNeedsNewLine && needsNewLine)
                    result += '\n';
                var subresult = this.stringify(arr[i], depth);
                if (subresult) {
                    if (needsNewLine)
                        result += this.indentsForDepth(depth);
                    result += subresult;
                    if (i < arr.length - 1)
                        result += ', ';
                    if (needsNewLine)
                        result += '\n';
                }
                lastLineNeedsNewLine = needsNewLine;
            }
            depth--;
        }
        result += ']';
        return result;
    };
    // pretty-printing functions is a lib unto itself - this simply prints with indents
    Debugout.prototype.stringifyFunction = function (fn, startingDepth) {
        var _this = this;
        if (startingDepth === void 0) { startingDepth = 0; }
        var depth = startingDepth;
        return String(fn).split('\n').map(function (line) {
            if (line.match(/\}/))
                depth--;
            var val = _this.indentsForDepth(depth) + line.trim();
            if (line.match(/\{/))
                depth++;
            return val;
        }).join('\n');
    };
    // stringify any data
    Debugout.prototype.stringify = function (obj, depth) {
        if (depth === void 0) { depth = 0; }
        if (depth >= this.maxDepth) {
            return '... (max-depth reached)';
        }
        var type = this.determineType(obj);
        switch (type) {
            case 'Object':
                return this.stringifyObject(obj, depth);
            case 'Array':
                return this.stringifyArray(obj, depth);
            case 'function':
                return this.stringifyFunction(obj, depth);
            case 'RegExp':
                return '/' + obj.source + '/' + obj.flags;
            case 'Date':
            case 'string':
                return (this.quoteStrings) ? "\"" + obj + "\"" : obj + '';
            case 'boolean':
                return (obj) ? 'true' : 'false';
            case 'number':
                return obj + '';
            case 'null':
            case 'undefined':
                return type;
            case 'Debugout':
                return '... (Debugout)'; // prevent endless loop
            default:
                return '?';
        }
    };
    Debugout.prototype.trimLog = function (maxLines) {
        var lines = this.output.split('\n');
        lines.pop();
        if (lines.length > maxLines) {
            lines = lines.slice(lines.length - maxLines);
        }
        return lines.join('\n') + '\n';
    };
    // no type args: typescript doesn't think dates can be subtracted but they can
    Debugout.prototype.formatSessionDuration = function (startTime, endTime) {
        var msec = endTime - startTime;
        var hh = Math.floor(msec / 1000 / 60 / 60);
        var hrs = ('0' + hh).slice(-2);
        msec -= hh * 1000 * 60 * 60;
        var mm = Math.floor(msec / 1000 / 60);
        var mins = ('0' + mm).slice(-2);
        msec -= mm * 1000 * 60;
        var ss = Math.floor(msec / 1000);
        var secs = ('0' + ss).slice(-2);
        msec -= ss * 1000;
        return 'Session duration: ' + hrs + ':' + mins + ':' + secs;
    };
    Debugout.prototype.formatDate = function (ts) {
        if (ts === void 0) { ts = new Date(); }
        return "[" + ts.toISOString() + "]";
    };
    Debugout.prototype.objectSize = function (obj) {
        var size = 0;
        for (var key in obj) {
            if (obj.hasOwnProperty(key))
                size++;
        }
        return size;
    };
    return Debugout;
}());
export { Debugout };

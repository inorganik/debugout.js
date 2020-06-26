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
    useLocalStorage: false,
    recordLogs: true,
    autoTrim: true,
    maxLines: 2500,
    tailNumLines: 100,
    logFilename: 'debugout.txt',
    maxDepth: 25,
    lsKey: 'debugout.js',
    indent: '  '
};
var Debugout = /** @class */ (function () {
    function Debugout(options) {
        var _this = this;
        this.indent = '  ';
        this.output = ''; // holds all logs
        this.version = function () { return '0.9.0'; };
        this.indentsForDepth = function (depth) { return _this.indent.repeat(depth); };
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
                this.output += "\n---- Session end: " + stored.lastLog + " ----\n";
                this.output += this.formatSessionDuration(this.startTime, end);
                this.output += '\n\n';
            }
        }
        else {
            this.startTime = new Date();
            this.useLocalStorage = false;
            this.output += "---- Session started: " + this.formatDate(this.startTime) + " ----\n\n";
        }
    }
    // USER METHODS
    Debugout.prototype.getLog = function () {
        var retrievalTime = new Date();
        // if recording is off, so dev knows why they don't have any logs
        if (!this.recordLogs) {
            this.libNotice('log recording is off.');
        }
        // if using local storage, get values
        if (this.useLocalStorage && window && window.localStorage) {
            var stored = this.load();
            if (stored) {
                this.startTime = new Date(stored.startTime);
                this.output = stored.log;
                retrievalTime = new Date(stored.lastLog);
            }
        }
        return this.output +
            ("\n---- Log retrieved: " + retrievalTime + " ----\n") +
            this.formatSessionDuration(this.startTime, retrievalTime);
    };
    // clears the log
    Debugout.prototype.clear = function () {
        var clearTime = new Date();
        this.output = '---- Log cleared: ' + clearTime + ' ----\n';
        if (this.useLocalStorage) {
            this.save();
        }
        if (this.realTimeLoggingOn)
            this.libNotice('clear()');
    };
    // records a log
    Debugout.prototype.log = function () {
        var _this = this;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (this.realTimeLoggingOn)
            console.log.apply(console, args);
        // record log
        var result = '';
        if (this.recordLogs) {
            args.forEach(function (obj) {
                console.log('obj', _this.determineType(obj), obj);
                result += _this.stringify(obj);
                if (_this.useTimestamps) {
                    _this.output += _this.formatDate();
                }
            });
        }
        console.log('result', result);
        this.output += result + '\n';
        if (this.autoTrim)
            this.output = this.trimLog(this.output, this.maxLines);
        if (this.useLocalStorage) {
            var saveObject = {
                startTime: this.startTime,
                log: this.output,
                lastLog: new Date()
            };
            window.localStorage.setItem(this.lsKey, JSON.stringify(saveObject));
        }
    };
    // METHODS FOR CONSTRUCTING THE LOG
    Debugout.prototype.libNotice = function (msg) {
        this.log("[debugout.js] " + msg);
    };
    Debugout.prototype.load = function () {
        var saved = window.localStorage.getItem(this.lsKey);
        if (saved) {
            return JSON.parse(saved);
        }
        return null;
    };
    Debugout.prototype.save = function () {
        var saveObject = {
            startTime: this.startTime,
            log: this.output,
            lastLog: new Date()
        };
        window.localStorage.setItem(this.lsKey, JSON.stringify(saveObject));
    };
    Debugout.prototype.determineType = function (object) {
        if (object !== null) {
            var type = typeof object;
            if (type === 'object') {
                var len = object.length;
                if (len === undefined) {
                    if (typeof object.getTime === 'function') {
                        type = 'Date';
                    }
                    else if (typeof object.test === 'function') {
                        type = 'RegExp';
                    }
                    else {
                        type = 'Object';
                    }
                }
                else {
                    type = 'Array';
                }
            }
            return type;
        }
        return 'null';
    };
    // recursively stringify object
    Debugout.prototype.stringifyObject = function (obj, depth) {
        if (depth === void 0) { depth = 0; }
        var result = '{\n';
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
        result += this.indentsForDepth(depth);
        result += '}';
        return result;
    };
    // recursively stringify array
    Debugout.prototype.stringifyArray = function (arr, startingDepth) {
        if (startingDepth === void 0) { startingDepth = 0; }
        var result = '[';
        var depth = startingDepth;
        depth++;
        for (var i = 0; i < arr.length; i++) {
            var subtype = this.determineType(arr[i]);
            if (subtype === 'Object' || subtype === 'Array')
                result += '\n' + this.indentsForDepth(depth);
            var subresult = this.stringify(arr[i], depth);
            if (subresult) {
                result += subresult;
                if (i < arr.length - 1)
                    result += ', ';
                if (subtype === 'Array' || subtype === 'Object')
                    result += '\n';
            }
        }
        result += ']';
        return result;
    };
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
                return '/' + obj.source + '/';
            case 'Date':
            case 'string':
                return (depth > 0 || obj.length === 0) ? "\"" + obj + "\"" : obj;
            case 'boolean':
                return (obj) ? 'true' : 'false';
            case 'number':
                return obj + '';
        }
    };
    Debugout.prototype.trimLog = function (log, maxLines) {
        var lines = log.split('\n');
        if (lines.length > maxLines) {
            lines = lines.slice(lines.length - maxLines);
        }
        return lines.join('\n');
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
        return '---- Session duration: ' + hrs + ':' + mins + ':' + secs + ' ----';
    };
    // timestamp, formatted for brevity
    Debugout.prototype.formatDate = function (ts) {
        if (ts === void 0) { ts = new Date(); }
        var month = ('0' + (ts.getMonth() + 1)).slice(-2);
        var hrs = Number(ts.getHours());
        var mins = ('0' + ts.getMinutes()).slice(-2);
        var secs = ('0' + ts.getSeconds()).slice(-2);
        return "[" + ts.getFullYear() + "-" + month + "-" + ts.getDate() + " " + hrs + ":" + mins + ":" + secs + "]: ";
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

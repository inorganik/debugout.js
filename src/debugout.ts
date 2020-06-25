export interface DebugoutOptions {
  realTimeLoggingOn: boolean; // log in real time (forwards to console.log)
  useTimestamps: boolean; // insert a timestamp in front of each log
  useLocalStorage: boolean; // store the output using window.localStorage() and continuously add to the same log each session
  recordLogs: boolean; // set to false after you're done debugging to avoid the log eating up memory
  autoTrim: boolean; // to avoid the log eating up potentially endless memory
  maxLines: number; // if autoTrim is true, this many most recent lines are saved
  tailNumLines: number; // how many lines tail() will retrieve
  logFilename: string; // filename of log downloaded with downloadLog()
  maxDepth: number; // max recursion depth for logged objects
  lsKey: string; // localStorage key
  indent: string; // string to use for indent (2 spaces)
}

const debugoutDefaults: DebugoutOptions = {
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

export interface DebugoutStorage {
  startTime: string;
  log: string;
  lastLog: string;
}

declare var window;

export class Debugout {

  // options
  realTimeLoggingOn: boolean;
  useTimestamps: boolean;
  useLocalStorage: boolean;
  recordLogs: boolean;
  autoTrim: boolean;
  maxLines: number;
  tailNumLines: number;
  logFilename: string;
  maxDepth: number;
  lsKey: string;
  indent = '  ';

  startTime = new Date();
  output = ''; // holds all logs

  version = () => '1.0.0';
  indentsForDepth = (depth: number) => this.indent.repeat(depth);

  constructor(options: DebugoutOptions) {
    // set options from defaults and passed options.
    const settings = {
      ...debugoutDefaults,
      ...options
    };
    for (const prop in settings) {
      if (settings[prop] !== undefined) {
        this[prop] = settings[prop];
      }
    }

    // START/RESUME LOG
    if (this.useLocalStorage && window && !!window.localStorage) {
      const stored = this.load();
      if (stored) {
        this.output = stored.log;
        const start = new Date(stored.startTime);
        const end = new Date(stored.lastLog);
        this.output += `\n---- Session end: ${stored.lastLog} ----\n`;
        this.output += this.formatSessionDuration(start, end);
        this.output += '\n\n';
      }
    } else {
      this.useLocalStorage = false;
    }
    this.output += `---- Session started: ${this.startTime} ----\n\n`;
  }

  // USER METHODS

  getLog(): string {
    let retrievalTime = new Date();
    // if recording is off, so dev knows why they don't have any logs
    if (!this.recordLogs) {
      this.libNotice('log recording is off.');
    }
    // if using local storage, get values
    if (this.useLocalStorage && window && window.localStorage) {
      const stored = this.load();
      if (stored) {
        this.startTime = new Date(stored.startTime);
        this.output = stored.log;
        retrievalTime = new Date(stored.lastLog);
      }
    }
    return this.output +
      `\n---- Log retrieved: ${retrievalTime} ----\n` +
      this.formatSessionDuration(this.startTime, retrievalTime);
  }

  // clears the log
  clear(): void {
    const clearTime = new Date();
    this.output = '---- Log cleared: ' + clearTime + ' ----\n';
    if (this.useLocalStorage) {
      this.save();
    }
    if (this.realTimeLoggingOn) this.libNotice('clear()');
  }

  // records a log
  log(...args: unknown[]): void {
    if (this.realTimeLoggingOn) console.log(args);
    // record log
    let result = '';
    if (this.recordLogs) {
      args.forEach(obj => {
        result += this.stringify(obj);
        if (this.useTimestamps) {
          this.output += this.formatTimestamp();
        }
      });
    }
    this.output += result + '\n';
    if (this.autoTrim) this.output = this.trimLog(this.output, this.maxLines);
    if (this.useLocalStorage) {
      const saveObject = {
        startTime: this.startTime,
        log: this.output,
        lastLog: new Date()
      };
      window.localStorage.setItem(this.lsKey, JSON.stringify(saveObject));
    }
  }

  // METHODS FOR CONSTRUCTING THE LOG

  libNotice(msg: string): void {
    this.log(`[debugout.js] ${msg}`);
  }

  load(): DebugoutStorage {
    const saved = window.localStorage.getItem(this.lsKey);
    if (saved) {
      return JSON.parse(saved) as DebugoutStorage;
    }
    return null;
  }

  save(): void {
    const saveObject = {
      startTime: this.startTime,
      log: this.output,
      lastLog: new Date()
    };
    window.localStorage.setItem(this.lsKey, JSON.stringify(saveObject));
  }

  determineType(object: any): string {
    if (object !== null) {
      let type = String(typeof object);
      if (type === 'object') {
        const len = object.length;
        if (len === null) {
          if (typeof object.getTime === 'function') {
            type = 'Date';
          }
          else if (typeof object.test === 'function') {
            type = 'RegExp';
          }
          else {
            type = 'Object';
          }
        } else {
          type = 'Array';
        }
      } else {
        type = type;
      }
      return type;
    }
    return 'null';
  }

  // recursively stringify object
  stringifyObject(obj: any, depth = 0): string {
    let result = '{\n';
    let i = 0;
    for (const prop in obj) {
      result += this.indentsForDepth(depth);
      result += prop + ': ';
      const subresult = this.stringify(obj[prop], depth);
      if (subresult) {
        result += subresult;
      }
      if (i < this.objectSize(obj) - 1) result += ',';
      result += '\n';
      i++;
    }
    result += this.indentsForDepth(depth);
    result += '}';
    return result;
  }

  // recursively stringify array
  stringifyArray(arr: Array<any>, startingDepth = 0): string {
    let result = '[';
    let depth = startingDepth;
    depth++;
    for (let i = 0; i < arr.length; i++) {
      const subtype = this.determineType(arr[i]);
      if (subtype === 'Object' || subtype === 'Array') result += '\n' + this.indentsForDepth(depth);
      const subresult = this.stringify(arr[i], depth);
      if (subresult) {
        result += subresult;
        if (i < arr.length - 1) result += ', ';
        if (subtype === 'Array' || subtype === 'Object') result += '\n';
      }
    }
    result += ']';
    return result;
  }

  stringifyFunction(fn: any, startingDepth = 0): string {
    let result = fn + '';
    let depth = startingDepth;
    const lines = fn.split('\n');
    for (const line of lines) {
      if (line.match(/\}/)) depth--;
      result += this.indentsForDepth(depth);
      if (line.match(/\{/)) depth++;
      result += line + '\n';
    }
    return result;
  }

  // stringify any data
  stringify(obj: any, depth = 0): string {
    if (depth >= this.maxDepth) {
      return '... (max-depth reached)';
    }
    switch (this.determineType(obj)) {
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
        return (depth > 0 || obj.length === 0) ? `"${obj}"` : obj;
      case 'boolean':
        return (obj) ? 'true' : 'false';
      case 'number':
        return obj + '';
    }
  }


  trimLog(log: string, maxLines: number): string {
    let lines = log.split('\n');
    if (lines.length > maxLines) {
      lines = lines.slice(lines.length - maxLines);
    }
    return lines.join('\n');
  }
  lines(): number {
    return this.output.split('\n').length;
  }

  // calculate testing time
  formatSessionDuration(startTime, endTime): string {
    let msec = endTime - startTime;
    const hh = Math.floor(msec / 1000 / 60 / 60);
    const hrs = ('0' + hh).slice(-2);
    msec -= hh * 1000 * 60 * 60;
    const mm = Math.floor(msec / 1000 / 60);
    const mins = ('0' + mm).slice(-2);
    msec -= mm * 1000 * 60;
    const ss = Math.floor(msec / 1000);
    const secs = ('0' + ss).slice(-2);
    msec -= ss * 1000;
    return '---- Session duration: ' + hrs + ':' + mins + ':' + secs + ' ----';
  }

  // timestamp, formatted for brevity
  formatTimestamp(ts = new Date()): string {
    const month = ('0' + (ts.getMonth() + 1)).slice(-2);
    const hrs = Number(ts.getHours());
    const mins = ('0' + ts.getMinutes()).slice(-2);
    const secs = ('0' + ts.getSeconds()).slice(-2);
    return `[${ts.getFullYear()}-${month}-${ts.getDate()} ${hrs}:${mins}:${secs}]: `;
  }
  objectSize(obj: any): number {
    let size = 0;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) size++;
    }
    return size;
  }
}

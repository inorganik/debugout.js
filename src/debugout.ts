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

const debugoutDefaults: DebugoutOptions = {
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

export interface DebugoutStorage {
  startTime: string;
  log: string;
  lastLog: string;
}

declare var window;

export class Debugout {

  // options
  realTimeLoggingOn: boolean;
  includeSessionMetadata: boolean;
  useTimestamps: boolean;
  useLocalStorage: boolean;
  recordLogs: boolean;
  autoTrim: boolean;
  maxLines: number;
  logFilename: string;
  maxDepth: number;
  localStorageKey: string;
  indent = '  ';
  quoteStrings: boolean;

  tailNumLines = 25;
  startTime: Date;
  output = ''; // holds all logs

  version = () => '1.0.0';
  indentsForDepth = (depth: number) => this.indent.repeat(Math.max(depth, 0));

  // forwarded console methods not used by debugout
  /* tslint:disable:no-console */
  trace = () => console.trace();
  time = () => console.time();
  timeEnd = () => console.timeEnd();
  /* tslint:enable:no-console */

  constructor(options?: DebugoutOptions) {
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
        this.startTime = new Date(stored.startTime);
        const end = new Date(stored.lastLog);
        this.logMetadata(`Last session end: ${stored.lastLog}`);
        this.logMetadata(`Last ${this.formatSessionDuration(this.startTime, end)}`);
        this.startLog();
      } else {
        this.startLog();
      }
    } else {
      this.useLocalStorage = false;
      this.startLog();
    }
  }

  private startLog(): void {
    this.startTime = new Date();
    this.logMetadata(`Session started: ${this.formatDate(this.startTime)}`);
  }

  // records a log
  private recordLog(...args: unknown[]): void {
    // record log
    if (this.useTimestamps) {
      this.output += this.formatDate() + ' ';
    }
    this.output += args.map(obj => this.stringify(obj)).join(' ');
    this.output += '\n';
    if (this.autoTrim) this.output = this.trimLog(this.maxLines);
    if (this.useLocalStorage) {
      const saveObject = {
        startTime: this.startTime,
        log: this.output,
        lastLog: new Date()
      };
      window.localStorage.setItem(this.localStorageKey, JSON.stringify(saveObject));
    }
  }

  private logMetadata(msg: string): void {
    if (this.includeSessionMetadata) this.output += `---- ${msg} ----\n`;
  }

  // USER METHODS

  log(...args: unknown[]): void {
    if (this.realTimeLoggingOn) console.log(...args);
    if (this.recordLogs) this.recordLog(...args);
  }
  info(...args: unknown[]): void {
    // tslint:disable-next-line:no-console
    if (this.realTimeLoggingOn) console.info(...args);
    if (this.recordLogs) {
      this.output += '[INFO] ';
      this.recordLog(...args);
    }
  }
  warn(...args: unknown[]): void {
    if (this.realTimeLoggingOn) console.warn(...args);
    if (this.recordLogs) {
      this.output += '[WARN] ';
      this.recordLog(...args);
    }
  }
  error(...args: unknown[]): void {
    if (this.realTimeLoggingOn) console.error(...args);
    if (this.recordLogs) {
      this.output += '[ERROR] ';
      this.recordLog(...args);
    }
  }

  getLog(): string {
    const retrievalTime = new Date();
    // if recording is off, so dev knows why they don't have any logs
    if (!this.recordLogs) {
      this.info('Log recording is off');
    }
    // if using local storage, get values
    if (this.useLocalStorage && window && window.localStorage) {
      const stored = this.load();
      if (stored) {
        this.startTime = new Date(stored.startTime);
        this.output = stored.log;
      }
    }
    if (this.includeSessionMetadata) {
      return this.output + `---- ${this.formatSessionDuration(this.startTime, retrievalTime)} ----\n`;
    }
    return this.output;
  }

  // clears the log
  clear(): void {
    this.output = '';
    this.logMetadata(`Session started: ${this.formatDate(this.startTime)}`);
    this.logMetadata('Log cleared ' + this.formatDate());
    if (this.useLocalStorage) this.save();
  }

  // gets last X number of lines
  tail(numLines?: number): string {
    const lines = numLines || this.tailNumLines;
    return this.trimLog(lines);
  }

  // find occurences of your search term in the log
  search(term: string): string {
    const rgx = new RegExp(term, 'ig');
    const lines = this.output.split('\n');
    const matched = [];
    // can't use a simple filter & map here because we need to add the line number
    for (let i = 0; i < lines.length; i++) {
      const addr = `[${i}] `;
      if (lines[i].match(rgx)) {
        matched.push(addr + lines[i].trim());
      }
    }
    let result = matched.join('\n');
    if (!result.length) result = `Nothing found for "${term}".`;
    return result;
  }

  // retrieve a section of the log. Works the same as js slice
  slice(...args: number[]): string {
    return this.output.split('\n').slice(...args).join('\n');
  }

  // downloads the log - for browser use
  downloadLog(): void {
    if (!!window) {
      const logFile = this.getLog();
      const blob = new Blob([logFile], { type: 'data:text/plain;charset=utf-8' });
      const a = document.createElement('a');
      a.href = window.URL.createObjectURL(blob);
      a.target = '_blank';
      a.download = this.logFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(a.href);
    } else {
      console.error('downloadLog only works in the browser');
    }

  }

  // METHODS FOR CONSTRUCTING THE LOG

  private save(): void {
    const saveObject = {
      startTime: this.startTime,
      log: this.output,
      lastLog: new Date()
    };
    window.localStorage.setItem(this.localStorageKey, JSON.stringify(saveObject));
  }

  private load(): DebugoutStorage {
    const saved = window.localStorage.getItem(this.localStorageKey);
    if (saved) {
      return JSON.parse(saved) as DebugoutStorage;
    }
    return null;
  }

  determineType(object: any): string {
    if (object === null) {
      return 'null';
    } else if (object === undefined) {
      return 'undefined';
    } else {
      let type = typeof object as string;
      if (type === 'object') {
        if (Array.isArray(object)) {
          type = 'Array';
        } else {
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
  }

  // recursively stringify object
  stringifyObject(obj: any, startingDepth = 0): string {
    // return JSON.stringify(obj, null, this.indent); // can't control depth/line-breaks/quotes
    let result = '{';
    let depth = startingDepth;
    if (this.objectSize(obj) > 0) {
      result += '\n';
      depth++;
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
      depth--;
      result += this.indentsForDepth(depth);
    }
    result += '}';
    return result;
  }

  // recursively stringify array
  stringifyArray(arr: Array<any>, startingDepth = 0): string {
    // return JSON.stringify(arr, null, this.indent); // can't control depth/line-breaks/quotes
    let result = '[';
    let depth = startingDepth;
    let lastLineNeedsNewLine = false;
    if (arr.length > 0) {
      depth++;
      for (let i = 0; i < arr.length; i++) {
        const subtype = this.determineType(arr[i]);
        let needsNewLine = false;
        if (subtype === 'Object' && this.objectSize(arr[i]) > 0) needsNewLine = true;
        if (subtype === 'Array' && arr[i].length > 0) needsNewLine = true;
        if (!lastLineNeedsNewLine && needsNewLine) result += '\n';
        const subresult = this.stringify(arr[i], depth);
        if (subresult) {
          if (needsNewLine) result += this.indentsForDepth(depth);
          result += subresult;
          if (i < arr.length - 1) result += ', ';
          if (needsNewLine) result += '\n';
        }
        lastLineNeedsNewLine = needsNewLine;
      }
      depth--;
    }
    result += ']';
    return result;
  }

  // pretty-printing functions is a lib unto itself - this simply prints with indents
  stringifyFunction(fn: any, startingDepth = 0): string {
    let depth = startingDepth;
    return String(fn).split('\n').map(line => {
      if (line.match(/\}/)) depth--;
      const val = this.indentsForDepth(depth) + line.trim();
      if (line.match(/\{/)) depth++;
      return val;
    }).join('\n');
  }

  // stringify any data
  stringify(obj: any, depth = 0): string {
    if (depth >= this.maxDepth) {
      return '... (max-depth reached)';
    }
    const type = this.determineType(obj);
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
        return (this.quoteStrings) ? `"${obj}"` : obj + '';
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
  }

  trimLog(maxLines: number): string {
    let lines = this.output.split('\n');
    lines.pop();
    if (lines.length > maxLines) {
      lines = lines.slice(lines.length - maxLines);
    }
    return lines.join('\n') + '\n';
  }

  // no type args: typescript doesn't think dates can be subtracted but they can
  private formatSessionDuration(startTime, endTime): string {
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
    return 'Session duration: ' + hrs + ':' + mins + ':' + secs;
  }

  formatDate(ts = new Date()): string {
    return `[${ts.toISOString()}]`;
  }

  objectSize(obj: any): number {
    let size = 0;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) size++;
    }
    return size;
  }
}

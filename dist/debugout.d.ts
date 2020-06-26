export interface DebugoutOptions {
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
    indent: string;
}
export interface DebugoutStorage {
    startTime: string;
    log: string;
    lastLog: string;
}
export declare class Debugout {
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
    indent: string;
    startTime: Date;
    output: string;
    version: () => string;
    indentsForDepth: (depth: number) => string;
    constructor(options?: DebugoutOptions);
    getLog(): string;
    clear(): void;
    log(...args: unknown[]): void;
    libNotice(msg: string): void;
    load(): DebugoutStorage;
    save(): void;
    determineType(object: any): string;
    stringifyObject(obj: any, startingDepth?: number): string;
    stringifyArray(arr: Array<any>, startingDepth?: number): string;
    stringifyFunction(fn: any, startingDepth?: number): string;
    stringify(obj: any, depth?: number): string;
    trimLog(log: string, maxLines: number): string;
    formatSessionDuration(startTime: any, endTime: any): string;
    formatDate(ts?: Date): string;
    objectSize(obj: any): number;
}

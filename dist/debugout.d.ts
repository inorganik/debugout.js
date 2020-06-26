export interface DebugoutOptions {
    realTimeLoggingOn?: boolean;
    useTimestamps?: boolean;
    includeSessionMetadata?: boolean;
    useLocalStorage?: boolean;
    recordLogs?: boolean;
    autoTrim?: boolean;
    maxLines?: number;
    tailNumLines?: number;
    logFilename?: string;
    maxDepth?: number;
    lsKey?: string;
    indent?: string;
}
export interface DebugoutStorage {
    startTime: string;
    log: string;
    lastLog: string;
}
export declare class Debugout {
    realTimeLoggingOn: boolean;
    includeSessionMetadata: boolean;
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
    trace: () => void;
    time: () => void;
    timeEnd: () => void;
    constructor(options?: DebugoutOptions);
    private recordLog;
    private logMetadata;
    log(...args: unknown[]): void;
    info(...args: unknown[]): void;
    warn(...args: unknown[]): void;
    error(...args: unknown[]): void;
    getLog(): string;
    clear(): void;
    tail(numLines?: number): string;
    search(term: string): string;
    slice(...args: number[]): string;
    downloadLog(): void;
    private libNotice;
    private save;
    load(): DebugoutStorage;
    determineType(object: any): string;
    stringifyObject(obj: any, startingDepth?: number): string;
    stringifyArray(arr: Array<any>, startingDepth?: number): string;
    stringifyFunction(fn: any, startingDepth?: number): string;
    stringify(obj: any, depth?: number): string;
    trimLog(maxLines: number): string;
    private formatSessionDuration;
    formatDate(ts?: Date): string;
    objectSize(obj: any): number;
}

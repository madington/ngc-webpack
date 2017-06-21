/// <reference types="webpack" />
import * as webpack from 'webpack';
export declare type Compiler = webpack.compiler.Compiler;
export declare type Stats = webpack.compiler.Stats;
export declare const configs: {
    cli: {
        ts: string;
        wp: string;
    };
    ngc: {
        ts: string;
        wp: string;
    };
    plugin: {
        ts: string;
        wp: string;
    };
};
/**
 * Returns a webpack configuration object.
 * You can supply args to be used if the config is a function (webpack config factory)
 *
 * Also support ES6 default exports.
 * @param config
 * @param args
 * @returns {any}
 */
export declare function resolveWebpackConfig(config: any, ...args: any[]): any;
/**
 * Run webpack based on a webpack config
 * @param config a webpack config object, can be a function, es6 default exported function, or object.
 */
export declare function runWebpack(config: any): {
    compiler: Compiler;
    done: Promise<Stats>;
};
/**
 * Simple spawn wrapper that accepts a raw command line (with args) and return a promise with the result.
 * All IO goes to the console.
 * @param cmd
 * @returns {Promise<T>}
 */
export declare function spawn(cmd: any): Promise<any>;
export declare function getTsConfigMeta(tsConfigPath: string): {
    tsConfig: any;
    absGenDir: string;
};
export declare function occurrences(regex: RegExp, str: string): number;

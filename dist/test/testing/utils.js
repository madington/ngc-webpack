"use strict";
var webpack = require("webpack");
var child_process_1 = require("child_process");
var fs = require("fs");
var Path = require("path");
process.env.NODE_ENV = 'production';
exports.configs = {
    cli: {
        ts: Path.resolve('tsconfig.cli.json'),
        wp: Path.resolve('test/testing/buildConfig/webpack.cli.js')
    },
    ngc: {
        ts: Path.resolve('tsconfig.ngc.json'),
        wp: Path.resolve('test/testing/buildConfig/webpack.ngc.js')
    },
    plugin: {
        ts: Path.resolve('tsconfig.plugin.json'),
        wp: Path.resolve('test/testing/buildConfig/webpack.plugin.js')
    }
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
function resolveWebpackConfig(config) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    if (typeof config === 'function') {
        return config.apply(void 0, args);
    }
    else if (config.__esModule === true && !!config.default) {
        return resolveWebpackConfig.apply(void 0, [config.default].concat(args));
    }
    else {
        return config;
    }
}
exports.resolveWebpackConfig = resolveWebpackConfig;
/**
 * Run webpack based on a webpack config
 * @param config a webpack config object, can be a function, es6 default exported function, or object.
 */
function runWebpack(config) {
    var compiler = webpack(resolveWebpackConfig(config));
    return {
        compiler: compiler,
        done: new Promise(function (RSV, RJT) { return compiler.run(function (err, stats) { return err ? RJT(err) : RSV(stats); }); })
    };
}
exports.runWebpack = runWebpack;
/**
 * Simple spawn wrapper that accepts a raw command line (with args) and return a promise with the result.
 * All IO goes to the console.
 * @param cmd
 * @returns {Promise<T>}
 */
function spawn(cmd) {
    return new Promise(function (resolve, reject) {
        var args = cmd.split(' ');
        var spawnInstance = child_process_1.spawn(args.shift(), args, { stdio: "inherit" });
        spawnInstance.on('exit', function (code) {
            if (code === 0) {
                resolve();
            }
            else {
                reject(code);
            }
        });
    });
}
exports.spawn = spawn;
function getTsConfigMeta(tsConfigPath) {
    var tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'));
    return {
        tsConfig: tsConfig,
        absGenDir: Path.resolve(Path.dirname(tsConfigPath), tsConfig.angularCompilerOptions.genDir)
    };
}
exports.getTsConfigMeta = getTsConfigMeta;
function occurrences(regex, str) {
    if (!regex.global || !regex.multiline) {
        throw new Error('Must use a multi & global regex');
    }
    var count = 0;
    var match = regex.exec(str);
    while (match) {
        count++;
        match = regex.exec(str);
    }
    return count;
}
exports.occurrences = occurrences;
//# sourceMappingURL=utils.js.map
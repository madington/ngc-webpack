"use strict";
var Path = require("path");
var fs = require("fs");
var chai_1 = require("chai");
var rimraf = require('rimraf');
var mapper = require('node-map-directory');
var utils_1 = require("./testing/utils");
describe('Integration', function () {
    var tsMetaNgcW = utils_1.getTsConfigMeta(utils_1.configs.cli.ts);
    var tsMetaPlugin = utils_1.getTsConfigMeta(utils_1.configs.plugin.ts);
    var tsMetaNgc = utils_1.getTsConfigMeta(utils_1.configs.ngc.ts);
    describe('ngc-w CLI', function () {
        var bundleCode;
        rimraf.sync(tsMetaNgcW.absGenDir);
        var test = it('should compile using ngc-webapck', function () {
            return utils_1.spawn("node dist/src/main.js -p " + utils_1.configs.cli.ts + " --webpack " + utils_1.configs.cli.wp)
                .then(function () {
                chai_1.expect(fs.existsSync(tsMetaNgcW.absGenDir));
            })
                .catch(function (err) { return chai_1.expect(err).to.be.undefined; });
        });
        test.timeout(1000 * 60 * 3); // 3 minutes, should be enough to compile.
        test = it('should bundle using webpack', function () {
            var wpConfig = utils_1.resolveWebpackConfig(require(utils_1.configs.cli.wp));
            return utils_1.runWebpack(wpConfig).done
                .then(function () {
                chai_1.expect(fs.existsSync('dist/test/ng-app-cli'));
                bundleCode = fs.readFileSync(Path.resolve('dist/test/ng-app-cli/main.bundle.js'), 'utf8');
            })
                .catch(function (err) { return chai_1.expect(err).to.be.undefined; });
        });
        test.timeout(1000 * 60 * 3); // 3 minutes, should be enough to compile.
        describe('Feature tests', function () {
            it('should load Component resources through webpack', function () {
                var code = fs.readFileSync(Path.join(tsMetaNgcW.absGenDir, 'test/ng-app/app/home/home.component.scss.shim.ngstyle.ts'), 'utf8');
                var RE = /export const styles:any\[] = \['(.+)']/;
                chai_1.expect(RE.exec(code)[1].indexOf("$")).to.equal(-1);
            });
            it('replace a resources path so the project content is from the new path', function () {
                // We replaced a path so the new content should be in the bundle
                // Since we run via CLI they should be in the ngfactory styles shim
                // they will not be on the component since the 2nd pass (webpack) loads the original content
                // In runtime we will get the result we want..
                var count = utils_1.occurrences(/\.this-replaced-app-component/gm, bundleCode);
                chai_1.expect(count).to.equal(1);
                // CLI run means no removal of component meta resources so the original should appear once
                count = utils_1.occurrences(/span\.active/gm, bundleCode);
                chai_1.expect(count).to.equal(1);
            });
            it('replace a source content on the fly', function () {
                var count = utils_1.occurrences(/HTML WAS HIJACKED BY A TEST!!!/gm, bundleCode);
                chai_1.expect(count).to.equal(1);
                count = utils_1.occurrences(/Submit Local State to App State/gm, bundleCode);
                chai_1.expect(count).to.equal(1);
            });
        });
    });
    describe('Plugin', function () {
        var bundleCode;
        rimraf.sync(tsMetaPlugin.absGenDir);
        var test = it('should compile using webpack plugin', function () {
            var wpConfig = utils_1.resolveWebpackConfig(require(utils_1.configs.plugin.wp));
            return utils_1.runWebpack(wpConfig).done
                .then(function () {
                chai_1.expect(fs.existsSync(tsMetaPlugin.absGenDir));
                bundleCode = fs.readFileSync(Path.resolve('dist/test/ng-app-plugin/main.bundle.js'), 'utf8');
            })
                .catch(function (err) { return chai_1.expect(err).to.be.undefined; });
        });
        test.timeout(1000 * 60 * 3); // 3 minutes, should be enough to compile.
        describe('Feature tests', function () {
            it('should load Component resources through webpack', function () {
                var code = fs.readFileSync(Path.join(tsMetaPlugin.absGenDir, 'test/ng-app/app/home/home.component.scss.shim.ngstyle.ts'), 'utf8');
                var RE = /export const styles:any\[] = \['(.+)']/;
                chai_1.expect(RE.exec(code)[1].indexOf("$")).to.equal(-1);
            });
            it('replace a resources path so the project content is from the new path', function () {
                var count = utils_1.occurrences(/\.this-replaced-app-component/gm, bundleCode);
                chai_1.expect(count).to.equal(1);
                // We replace the component metadata templates so this should be gone.
                count = utils_1.occurrences(/span\.active/gm, bundleCode);
                chai_1.expect(count).to.equal(0);
            });
            it('replace a source content on the fly', function () {
                var count = utils_1.occurrences(/HTML WAS HIJACKED BY A TEST!!!/gm, bundleCode);
                chai_1.expect(count).to.equal(1);
                // We replace the component metadata templates so this should be gone.
                count = utils_1.occurrences(/<div class="home-size">/gm, bundleCode);
                chai_1.expect(count).to.equal(0);
            });
            it('should bundle resources once (factory ony)', function () {
                var count = utils_1.occurrences(/\.home-size/gm, bundleCode);
                chai_1.expect(count).to.equal(1);
            });
            it('should replace component templates bundled from source with content from supplied resource', function () {
                var match = /\/\* Content removed by ngc-webpack \*\//.exec(bundleCode);
                chai_1.expect(!!match).to.be.true;
            });
        });
    });
    describe('ngc CLI (control test)', function () {
        rimraf.sync(tsMetaNgc.absGenDir);
        var test = it('should compile using ngc', function () {
            return utils_1.spawn("./node_modules/.bin/ngc -p " + utils_1.configs.ngc.ts)
                .then(function () {
                chai_1.expect(fs.existsSync(tsMetaNgc.absGenDir));
            })
                .catch(function (err) { return chai_1.expect(err).to.be.undefined; });
        });
        test.timeout(1000 * 60 * 3); // 3 minutes, should be enough to compile.
        test = it('should bundle using webpack', function () {
            var wpConfig = utils_1.resolveWebpackConfig(require(utils_1.configs.ngc.wp));
            return utils_1.runWebpack(wpConfig).done
                .then(function () {
                chai_1.expect(fs.existsSync('dist/test/ng-app-ngc'));
            })
                .catch(function (err) { return chai_1.expect(err).to.be.undefined; });
        });
        test.timeout(1000 * 60 * 3); // 3 minutes, should be enough to compile.
        it('should NOT load Component resources through webpack', function () {
            var code = fs.readFileSync(Path.join(tsMetaNgc.absGenDir, 'test/ng-app/app/home/home.component.scss.shim.ngstyle.ts'), 'utf8');
            var RE = /export const styles:any\[] = \['(.+)']/;
            chai_1.expect(RE.exec(code)[1].indexOf("$")).to.be.greaterThan(-1);
        });
        it('should bundle resources twice (factory + source)', function () {
            var code = fs.readFileSync(Path.resolve('dist/test/ng-app-ngc/main.bundle.js'), 'utf8');
            var count = utils_1.occurrences(/\.home-size/gm, code);
            chai_1.expect(count).to.equal(2);
        });
    });
    describe("ALL", function () {
        var test = it('should create identical file structure in all compilations', function () {
            var promises = [
                mapper(tsMetaNgcW.absGenDir).then(function (m) { return JSON.stringify(m).replace(/main\.browser\.aot\..*\./, ''); }),
                mapper(tsMetaPlugin.absGenDir).then(function (m) { return JSON.stringify(m).replace(/main\.browser\.aot\..*\./, ''); }),
                mapper(tsMetaNgc.absGenDir).then(function (m) { return JSON.stringify(m).replace(/main\.browser\.aot\..*\./, ''); }),
            ];
            return Promise.all(promises)
                .then(function (maps) { return chai_1.expect(maps[0]).to.equal(maps[1]); })
                .then(function (maps) { return chai_1.expect(maps[0]).to.equal(maps[2]); });
        });
        test.timeout(1000 * 60 * 3); // 3 minutes, should be enough to compile.
    });
});
//# sourceMappingURL=integration-cli.spec.js.map
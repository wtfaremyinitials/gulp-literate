var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;

var PLUGIN_NAME = 'gulp-literate';

var startsWith = function(str, searchString, position) {
    position = position || 0;
    return str.indexOf(searchString, position) === position;
};

// Plugin level function(dealing with files)
function literate() {
    // Creating a stream through which each file will pass
    return through.obj(function(file, enc, cb) {
        if (file.isNull()) {
            return cb(null, file);
        }

        if (file.isBuffer()) {
            var code = file.contents.toString();
            var lines = code.split('\n');
            lines = lines.filter(function(ln) {
                return startsWith(ln, '    ');
            }).map(function(ln) {
                return ln.substr(4);
            });
            code = lines.join('\n');
            file.contents = new Buffer(code);
        }

        if (file.isStream()) {
            var buffer = '';
            file.contents = file.contents.pipe(through(function(chunk, enc, done) {
                var code = buffer + chunk.toString();
                var lines = code.split('\n');
                buffer = lines.pop();
                lines = lines.filter(function(ln) {
                    return ln.startsWith('    ');
                }).map(function(ln) {
                    return ln.substr(4);
                });
                code = lines.join('\n');
                this.push(new Buffer(code));
                done();
            }));
        }

        cb(null, file);
    });
}

module.exports = literate;

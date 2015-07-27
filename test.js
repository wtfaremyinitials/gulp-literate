/* global describe, it */

'use strict';

var literate = require('./index');

var assert = require('assert');
var es = require('event-stream');
var gutil = require('gulp-util');
var PassThrough = require('stream').PassThrough;
var sink = require('stream-sink');

var doc = [
    '# Test',
    'this is *text* that should be ignored',
    '    // whereas this is code, that should pass through just fine',
    '    console.log("Hello World");',
    'text continues here'
].join('\n');

var processedDoc = [
    '// whereas this is code, that should pass through just fine',
    'console.log("Hello World");',
].join('\n');

describe('gulp-literate', function() {
    it('should work in buffer mode', function(done) {
        var stream = literate();

        var fakeBuffer = new Buffer(doc);
        var fakeFile = new gutil.File({
            contents: fakeBuffer
        });

        var fakeFinalBuffer = new Buffer(processedDoc);

        stream.on('data', function(newFile) {
            assert.equal(fakeFinalBuffer.toString(), newFile.contents.toString());
        });

        stream.on('end', function() {
            done();
        });

        stream.write(fakeFile);
        stream.end();
    });

    it('should work in stream mode', function(done) {
        var stream = literate();

        var fakeStream = new PassThrough();
        var fakeFile = new gutil.File({
            contents: fakeStream
        });

        doc.match(/.{1,4}/g).map(fakeStream.write.bind(fakeStream));
        fakeStream.end();

        stream.on('data', function(newFile){
            newFile.pipe(es.wait(function(err, data) {
                assert.equal(processedDoc, data);
            }));
        });

        stream.on('end', function() {
            done();
        });

        stream.write(fakeFile);
        stream.end();
    });

    it('should let null files pass through', function(done) {
        var stream = literate(),
            n = 0;
        stream.pipe(es.through(function(file) {
            assert.equal(file.path, 'null.md');
            assert.equal(file.contents,  null);
            n++;
        }, function() {
            assert.equal(n, 1);
            done();
        }));
        stream.write(new gutil.File({
            path: 'null.md',
            contents: null
         }));
        stream.end();
    });
});

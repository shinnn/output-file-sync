'use strict';

var fs = require('fs');
var path = require('path');

var outputFileSync = require('./');
var readRemoveFile = require('read-remove-file');
var test = require('tape');

test('outputFileSync()', function(t) {
  t.plan(20);

  t.equal(outputFileSync.name, 'outputFileSync', 'should have a function name.');

  t.equal(
    outputFileSync('tmp_file', 'foo', 'utf8'),
    null,
    'should return null when it doesn\'t create any directories.'
  );

  readRemoveFile('tmp_file', 'utf8', function(err, content) {
    t.deepEqual(
      [err, content],
      [null, 'foo'],
      'should create a file into the existing directory.'
    );
  });

  t.equal(
    outputFileSync('tmp/foo', new Buffer('a'), {mode: '0744'}),
    path.resolve('tmp'),
    'should return the path of the first created directory.'
  );

  fs.stat('tmp/foo', function(statErr, stat) {
    t.strictEqual(statErr, null, 'should accept mkdirp\'s option.');

    var expected = '100744';
    /* istanbul ignore if */
    if (process.platform === 'win32') {
      expected = '100666';
    }

    t.equal(
      stat.mode.toString(8), expected,
      'should reflect `mode` option to the file mode.'
    );

    readRemoveFile('tmp/foo', 'utf8', function(readErr, content) {
      t.deepEqual(
        [readErr, content],
        [null, 'a'],
        'should create a file into the new directory.'
      );
    });
  });

  fs.stat('tmp', function(err, stat) {
    t.strictEqual(err, null, 'should create a directory.');

    var expected = '40744';
    /* istanbul ignore if */
    if (process.platform === 'win32') {
      expected = '40666';
    }

    t.equal(
      stat.mode.toString(8), expected,
      'should reflect `mode` option to the directory mode.'
    );
  });

  outputFileSync('t/m/p', 'ə', {
    dirMode: '0745',
    fileMode: '0644',
    encoding: 'ascii'
  });

  fs.stat('t/m', function(err, stat) {
    t.strictEqual(err, null, 'should create multiple directories.');

    var expected = '40745';
    /* istanbul ignore if */
    if (process.platform === 'win32') {
      expected = '40666';
    }

    t.equal(
      stat.mode.toString(8), expected,
      'should reflect `dirMode` option to the directory mode.'
    );
  });

  fs.stat('t/m/p', function(statErr, stat) {
    t.strictEqual(statErr, null, 'should create a file into the new directories.');

    var expected = '100644';
    /* istanbul ignore if */
    if (process.platform === 'win32') {
      expected = '100666';
    }

    t.equal(
      stat.mode.toString(8), expected,
      'should reflect `fileMode` option to the file mode.'
    );

    readRemoveFile('t/m/p', 'utf8', function(readErr, content) {
      t.deepEqual(
        [readErr, content],
        [null, 'Y'],
        'should accept fs.writeFile\'s option.'
      );
    });
  });

  t.throws(
    outputFileSync.bind(null, 'node_modules/mkdirp', ''),
    /EISDIR/,
    'should throw an error when fs.writeFile fails.'
  );

  t.throws(
    outputFileSync.bind(null, 'index.js/foo', ''),
    /EEXIST/,
    'should throw an error when mkdirp fails.'
  );

  t.throws(
    outputFileSync.bind(null, 'foo', '', 'utf9'),
    /Unknown encoding.*utf9/,
    'should throw an error when the option is not valid for fs.writeFile.'
  );

  t.throws(
    outputFileSync.bind(null, 'f/o/o', '', {fs: []}),
    /TypeError/,
    'should throw a type error when the option is not valid for mkdirp.'
  );

  t.throws(
    outputFileSync.bind(null, 123, ''),
    /TypeError.*path/,
    'should throw a type error when the first argument is not a string.'
  );

  t.throws(
    outputFileSync.bind(null),
    /TypeError.*path/,
    'should throw a type error when it takes no arguments.'
  );
});

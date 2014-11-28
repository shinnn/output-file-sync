'use strict';

var fs = require('fs');
var path = require('path');

var outputFileSync = require('./');
var readRemoveFile = require('read-remove-file');
var test = require('tape');

test('outputFileSync()', function(t) {
  t.plan(20);

  t.equal(
    outputFileSync('tmp_file', 'foo', 'utf8'), null,
    'should return null when it doesn\'t create any directories.'
  );

  readRemoveFile('tmp_file', 'utf8', function(err, content) {
    t.strictEqual(err, null, 'should create a file into the existing directory.');
    t.equal(content, 'foo', 'should write contents to the file correctly.');
  });

  t.equal(
    outputFileSync('tmp/foo', new Buffer('a'), {mode: '0744'}),
    path.resolve('tmp'),
    'should return the path of the first created directory.'
  );

  fs.stat('tmp/foo', function(err, stat) {
    t.strictEqual(err, null, 'should accept mkdirp\'s option.');
    t.equal(
      stat.mode.toString(8), '100744',
      'should reflect `mode` option to the file mode.'
    );

    readRemoveFile('tmp/foo', 'utf8', function(err, content) {
      t.strictEqual(err, null, 'should create a file into the new directory.');
      t.equal(content, 'a', 'should accept a buffer as its second argument.');
    });
  });

  fs.stat('tmp', function(err, stat) {
    t.strictEqual(err, null, 'should create a directory.');
    t.equal(
      stat.mode.toString(8), '40744',
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
    t.equal(
      stat.mode.toString(8), '40745',
      'should reflect `dirMode` option to the directory mode.'
    );
  });

  fs.stat('t/m/p', function(err, stat) {
    t.strictEqual(err, null, 'should create a file into the new directories.');
    t.equal(
      stat.mode.toString(8), '100644',
      'should reflect `fileMode` option to the file mode.'
    );

    readRemoveFile('t/m/p', 'utf8', function(err, content) {
      t.strictEqual(err, null, 'should accept fs.writeFile\'s option.');
      t.equal(content, 'Y', 'should reflect `encoding` option to the file content.');
    });
  });

  t.throws(
    outputFileSync.bind(null, 'node_modules/mkdirp', ''), /EISDIR/,
    'should throw an error when fs.writeFile() fails.'
  );

  t.throws(
    outputFileSync.bind(null, 'index.js/foo', ''), /EEXIST/,
    'should throw an error when mkdirp() fails.'
  );

  t.throws(
    outputFileSync.bind(null, 'foo', '', 'bar'), /Unknown encoding/,
    'should throw an error when the option is not valid for fs.writeFile.'
  );

  t.throws(
    outputFileSync.bind(null, 'f/o/o', '', {fs: []}), /TypeError/,
    'should throw an error when the option is not valid for mkdirp.'
  );
});

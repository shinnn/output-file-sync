'use strict';

var fs = require('fs');
var path = require('path');

var outputFileSync = require('./');
var test = require('tape');

test('outputFileSync()', function(t) {
  t.plan(9);

  t.equal(
    outputFileSync('tmp_file', 'foo', 'utf8'), null,
    'should return null when it doesn\'t create any directories.'
  );

  t.equal(fs.readFileSync('tmp_file', 'utf8'), 'foo', 'should create a file.');

  t.equal(outputFileSync('tmp/foo/bar', 'ə', {
    encoding: 'ascii',
    mode: 33260
  }), path.resolve('tmp'), 'should return the path of the first created directory.');

  t.equal(fs.readFileSync('tmp/foo/bar', 'utf8'), 'Y', 'should accept fs.writeFile\'s option.');

  t.equal(
    fs.statSync('tmp/foo/bar').mode,
    /*eslint-disable no-multi-spaces */
    process.platform === 'win32' ? /* istanbul ignore next */ 33206 : 33260,
    /*eslint-enable no-multi-spaces */
    'should accept mkdir\'s option.'
  );

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

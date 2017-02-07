'use strict';

const fs = require('graceful-fs');
const path = require('path');

const outputFileSync = require('.');
const readRemoveFile = require('read-remove-file');
const test = require('tape');

test('outputFileSync()', t => {
  t.plan(21);

  t.equal(outputFileSync.name, 'outputFileSync', 'should have a function name.');

  t.equal(
    outputFileSync('tmp_file', 'foo', 'utf8'),
    null,
    'should return null when it doesn\'t create any directories.'
  );

  readRemoveFile('tmp_file', 'utf8', (...args) => {
    t.deepEqual(
      args,
      [null, 'foo'],
      'should create a file into the existing directory.'
    );
  });

  t.equal(
    outputFileSync('tmp/foo', new Buffer('a'), {mode: '0744'}),
    path.resolve('tmp'),
    'should return the path of the first created directory.'
  );

  fs.stat('tmp/foo', (statErr, stat) => {
    t.strictEqual(statErr, null, 'should accept mkdirp\'s option.');

    /* istanbul ignore next */
    const expected = process.platform === 'win32' ? '100666' : '100744';

    t.equal(
      stat.mode.toString(8), expected,
      'should reflect `mode` option to the file mode.'
    );

    readRemoveFile('tmp/foo', 'utf8', (...args) => {
      t.deepEqual(
        args,
        [null, 'a'],
        'should create a file into the new directory.'
      );
    });
  });

  fs.stat('tmp', (err, stat) => {
    t.strictEqual(err, null, 'should create a directory.');

    /* istanbul ignore next */
    const expected = process.platform === 'win32' ? '40666' : '40744';

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

  fs.stat('t/m', (err, stat) => {
    t.strictEqual(err, null, 'should create multiple directories.');

    /* istanbul ignore next */
    const expected = process.platform === 'win32' ? '40666' : '40745';

    t.equal(
      stat.mode.toString(8), expected,
      'should reflect `dirMode` option to the directory mode.'
    );
  });

  fs.stat('t/m/p', (statErr, stat) => {
    t.strictEqual(statErr, null, 'should create a file into the new directories.');

    /* istanbul ignore next */
    const expected = process.platform === 'win32' ? '100666' : '100644';

    t.equal(
      stat.mode.toString(8), expected,
      'should reflect `fileMode` option to the file mode.'
    );

    readRemoveFile('t/m/p', 'utf8', (...args) => {
      t.deepEqual(
        args,
        [null, 'Y'],
        'should accept fs.writeFile\'s option.'
      );
    });
  });

  t.throws(
    () => outputFileSync('./', '0123456789'),
    /EISDIR/,
    'should throw an error when fs.writeFile fails.'
  );

  t.throws(
    () => outputFileSync('index.js/foo', ''),
    /EEXIST/,
    'should throw an error when mkdirp fails.'
  );

  t.throws(
    () => outputFileSync('foo', '', 'utf9'),
    /Unknown encoding.*utf9/,
    'should throw an error when the option is not valid for fs.writeFile.'
  );

  t.throws(
    () => outputFileSync('f/o/o', '', {fs: []}),
    /TypeError/,
    'should throw a type error when the option is not valid for mkdirp.'
  );

  t.throws(
    () => outputFileSync(['a', Buffer.from('b')], ''),
    /TypeError.*\[ 'a', <Buffer 62> \] is not a string\. Expected a file path to write a file\./,
    'should throw a type error when the first argument is not a string.'
  );

  t.throws(
    () => outputFileSync('', ''),
    /Error.*Expected a file path to write a file, but received an empty string instead\./,
    'should throw an error when the first argument is an empty string.'
  );

  t.throws(
    () => outputFileSync(),
    /TypeError.*path/,
    'should throw a type error when it takes no arguments.'
  );
});

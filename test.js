'use strict';

const path = require('path');

const lstat = require('lstat');
const outputFileSync = require('.');
const readUtf8File = require('read-utf8-file');
const rmfr = require('rmfr');
const test = require('tape');

test('outputFileSync()', t => {
  t.plan(16);

  t.strictEqual(
    outputFileSync('tmp_file', 'foo', 'utf8'),
    null,
    'should return null when it doesn\'t create any directories.'
  );

  readUtf8File('tmp_file').then(contents => {
    t.strictEqual(contents, 'foo', 'should create a file into the existing directory.');

    return rmfr('tmp_file');
  })
  .catch(t.fail);

  t.strictEqual(
    outputFileSync('tmp/foo', new Buffer('a'), {mode: '0744'}),
    path.resolve('tmp'),
    'should return the path of the first created directory.'
  );

  Promise.all([lstat('tmp'), lstat('tmp/foo')])
  .then(([dirStat, fileStat]) => {
    t.strictEqual(
      dirStat.mode.toString(8),
      process.platform === /* istanbul ignore next */'win32' ? '40666' : '40744',
      'should reflect `mode` option to the directory mode.'
    );

    t.strictEqual(
      fileStat.mode.toString(8),
      process.platform === /* istanbul ignore next */'win32' ? '100666' : '100744',
      'should reflect `mode` option to the file mode.'
    );

    return readUtf8File('tmp/foo');
  })
  .then(contents => {
    t.strictEqual(contents, 'a', 'should create a file into the new directory.');

    return rmfr('tmp');
  })
  .catch(t.fail);

  outputFileSync('t/m/p', 'ə', {
    dirMode: '0745',
    fileMode: '0644',
    encoding: 'ascii'
  });

  Promise.all([lstat('t/m'), lstat('t/m/p')])
  .then(([dirStat, fileStat]) => {
    t.strictEqual(
      dirStat.mode.toString(8),
      process.platform === /* istanbul ignore next */'win32' ? '40666' : '40745',
      'should reflect `dirMode` option to the directory mode.'
    );

    t.strictEqual(
      fileStat.mode.toString(8),
      process.platform === /* istanbul ignore next */'win32' ? '100666' : '100644',
      'should reflect `fileMode` option to the file mode.'
    );

    return readUtf8File('t/m/p');
  })
  .then(contents => {
    t.strictEqual(contents, Buffer.from('ə', 'ascii').toString(), 'should accept fs.writeFile\'s option.');

    return rmfr('t');
  })
  .catch(t.fail);

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
    /^TypeError/,
    'should throw a type error when the option is not valid for mkdirp.'
  );

  t.throws(
    () => outputFileSync(['a', Buffer.from('b')], ''),
    /^TypeError.*Expected a file path to write a file, but got a non-string value \[ 'a', <Buffer 62> ]\./,
    'should throw a type error when the first argument is not a string.'
  );

  t.throws(
    () => outputFileSync('', ''),
    /^Error.*Expected a file path to write a file, but got '' \(empty string\)\./,
    'should throw an error when the first argument is an empty string.'
  );

  t.throws(
    () => outputFileSync(),
    /^TypeError.*path/,
    'should throw a type error when it takes no arguments.'
  );
});

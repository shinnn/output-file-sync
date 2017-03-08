'use strict';

const path = require('path');

const getMode = require('get-mode');
const outputFileSync = require('.');
const readUtf8File = require('read-utf8-file');
const rmfr = require('rmfr');
const test = require('tape');

test('outputFileSync()', t => {
  t.plan(11);

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

  Promise.all([getMode('tmp'), getMode('tmp/foo')])
  .then(([dirMode, fileMode]) => {
    t.strictEqual(
      dirMode.toString(8),
      process.platform === /* istanbul ignore next */'win32' ? '40666' : '40744',
      'should reflect `mode` option to the directory mode.'
    );

    t.strictEqual(
      fileMode.toString(8),
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
    dirMode: 485,
    fileMode: '0644',
    encoding: 'ascii'
  });

  Promise.all([getMode('t/m'), getMode('t/m/p')])
  .then(([dirMode, fileMode]) => {
    t.strictEqual(
      dirMode.toString(8),
      process.platform === /* istanbul ignore next */'win32' ? '40666' : '40745',
      'should reflect `dirMode` option to the directory mode.'
    );

    t.strictEqual(
      fileMode.toString(8),
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
    () => outputFileSync('index.js/foo', new Uint8Array()),
    /EEXIST/,
    'should throw an error when mkdirp fails.'
  );
});

test('Argument validation for outputFileSync()', t => {
  t.throws(
    () => outputFileSync(),
    /^TypeError.*, but got a non-string value undefined\./,
    'should throw an error when it takes no arguments.'
  );

  t.throws(
    () => outputFileSync(['a', Buffer.from('b')], ''),
    /^TypeError.*Expected a file path to write a file, but got a non-string value \[ 'a', <Buffer 62> ]\./,
    'should throw an error when the first argument is not a string.'
  );

  t.throws(
    () => outputFileSync('', ''),
    /^Error.*Expected a file path to write a file, but got '' \(empty string\)\./,
    'should throw an error when the first argument is an empty string.'
  );

  t.throws(
    () => outputFileSync('_', new Set()),
    /^TypeError.*Expected file content to be a string, Buffer or Uint8Array, but got Set {} instead\./,
    'should throw an error when the second argument is not a valid file content.'
  );

  t.throws(
    () => outputFileSync('_', '', 1),
    /^TypeError.*Expected a string to specify file encoding or an object to specify output-file-sync options/,
    'should throw an error when the third argument is provided but is neither string nor an object.'
  );

  t.throws(
    () => outputFileSync('_', '', 'utf\0'),
    /^Error.*for exmaple 'utf8' and 'ascii', but got 'utf\\u0000' instead\./,
    'should throw an error when the third argument is an invalid encoding.'
  );

  t.throws(
    () => outputFileSync('_', '', ''),
    /^Error.*Expected a string to be a valid encoding, .*but got '' \(empty string\)\./,
    'should throw an error when the third argument is an empty string.'
  );

  t.throws(
    () => outputFileSync('_', '', {encoding: Math.sign}),
    /^TypeError.*Expected `encoding` option to be a valid encoding,.* got \[Function: sign] instead\./,
    'should throw an error when `encoding` option is not a string.'
  );

  t.throws(
    () => outputFileSync('_', '', {encoding: ''}),
    /^Error.*Expected `encoding` option to be a valid encoding,.* got '' \(empty string\)\./,
    'should throw an error when `encoding` option is an empty string.'
  );

  t.throws(
    () => outputFileSync('_', '', {encoding: 'asciii'}),
    /^Error.*valid encoding, for exmaple 'utf8' and 'ascii', but got 'asciii' instead\./,
    'should throw an error when `encoding` option is an invalid encoding.'
  );

  t.throws(
    () => outputFileSync('_', '', {fs: []}),
    /^TypeError/,
    'should throw an error when the option is not valid for mkdirp.'
  );

  t.throws(
    () => outputFileSync('_', '', {mode: Infinity}),
    /^RangeError.*`mode` option to be a positive integer or a string of octal code.*but got Infinity\./,
    'should throw an error when mode option is infinite.'
  );

  t.throws(
    () => outputFileSync('_', '', {dirMode: Number.MAX_SAFE_INTEGER + 1}),
    /^RangeError.*Expected `dirMode` option to be.*but got a too large number\./,
    'should throw an error when mode option exceeds the max safe integer.'
  );

  t.throws(
    () => outputFileSync('_', '', {fileMode: -1}),
    /^RangeError.*Expected `fileMode` option to be.* but got a negative number -1\./,
    'should throw an error when mode option is a negative number.'
  );

  t.throws(
    () => outputFileSync('_', '', {mode: 0.1}),
    /^Error.*Expected `mode` option to be.* but got a non-integer number 0\.1\./,
    'should throw an error when mode option is a non-integer number.'
  );

  t.throws(
    () => outputFileSync('_', '', {mode: ''}),
    /^Error.*Expected `mode` option to be.* but got '' \(empty string\)\./,
    'should throw an error when mode option is a non-integer number.'
  );

  t.throws(
    () => outputFileSync('_', '', {mode: '9'}),
    /^RangeError.*Expected `mode` option to be.* but got an invalid octal '9'\./,
    'should throw an error when mode option is an invalid octal.'
  );

  t.throws(
    () => outputFileSync('_', '', {mode: '-1'}),
    /^RangeError.*Expected `mode` option to be.* but got a negative octal '-1'\./,
    'should throw an error when mode option is an invalid octal.'
  );

  t.throws(
    () => outputFileSync('_', '', {mode: new WeakMap()}),
    /^TypeError.*Expected `mode` option to be.* but got WeakMap \{\} instead\./,
    'should throw an error when mode option is neither string nor number.'
  );

  t.end();
});

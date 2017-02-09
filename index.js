/*!
 * output-file-sync | MIT (c) Shinnosuke Watanabe
 * https://github.com/shinnn/output-file-sync
*/
'use strict';

const dirname = require('path').dirname;
const writeFileSync = require('graceful-fs').writeFileSync;
const inspect = require('util').inspect;

const isPlainObj = require('is-plain-obj');
const mkdirpSync = require('mkdirp').sync;

const PATH_ERROR = 'Expected a file path to write a file';

module.exports = function outputFileSync(filePath, data, options) {
  if (typeof filePath !== 'string') {
    throw new TypeError(`${PATH_ERROR}, but got a non-string value ${inspect(filePath)}.`);
  }

  if (filePath.length === 0) {
    throw new Error(`${PATH_ERROR}, but got '' (empty string).`);
  }

  if (options !== null && options !== undefined) {
    if (typeof options === 'string') {
      options = {encoding: options};
    } else if (!isPlainObj(options)) {
      throw new TypeError(
        'Expected a string to specify file encoding or ' +
        `an object to specify output-file-sync options, but got ${inspect(options)}.`
      );
    }
  } else {
    options = {};
  }

  const createdDirPath = mkdirpSync(dirname(filePath), options.dirMode !== undefined ? Object.assign({}, options, {
    mode: options.dirMode
  }) : options);

  writeFileSync(filePath, data, options.fileMode !== undefined ? Object.assign({}, options, {
    mode: options.fileMode
  }) : options);

  return createdDirPath;
};

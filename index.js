/*!
 * output-file-sync | MIT (c) Shinnosuke Watanabe
 * https://github.com/shinnn/output-file-sync
*/
'use strict';

var dirname = require('path').dirname;
var writeFileSync = require('fs').writeFileSync;

var mkdirpSync = require('mkdirp').sync;

module.exports = function outputFileSync(filePath, data, options) {
  var mkdirpOptions;
  if (typeof options === 'object') {
    mkdirpOptions = options;
  } else {
    mkdirpOptions = null;
  }

  var createdDirPath = mkdirpSync(dirname(filePath), mkdirpOptions);
  writeFileSync(filePath, data, options);
  return createdDirPath;
};

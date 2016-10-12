import walk from './walk';
import path = require('path');

function requireAll(base: string, extensions: string[]) {
  return walk(base).reduce((map, file) => {
    if (
      !extensions.some(ext => file.substr(file.length - ext.length) === ext) ||
      file.indexOf('/_') > -1 ||
      file.indexOf('/.git/') > -1 ||
      file.indexOf('/.svn/') > -1
    ) {
      return map;
    }

    const basename = file.substr(0, file.length - 3);
    const module = require(path.join(base, file));
    map[basename] = module;

    return map;
  }, {} as { [path: string]: any });
}

export default requireAll;

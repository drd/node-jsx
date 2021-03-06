var fs = require('fs');
var React = require('react-tools');

var installed = false;

function install(options) {
  if (installed) {
    return;
  }

  options = options || {};

  // Import everything in the transformer codepath before we add the import hook
  React.transform('', options);

  require.extensions[options.extension || '.js'] = function(module, filename) {
    var src = fs.readFileSync(filename, {encoding: 'utf8'});
    if (typeof options.additionalTransform == 'function') {
      console.warn("node-jsx: please change additionalTransform to preTransform");
      options.preTransform = options.additionalTransform;
    }
    if (typeof options.preTransform == 'function') {
      src = options.preTransform(src, filename);
    }
    try {
      src = React.transform(src, options);
    } catch (e) {
      throw new Error('Error transforming ' + filename + ' to JSX: ' + e.toString());
    }
    if (typeof options.postTransform == 'function') {
      src = options.postTransform(src, filename);
    }
    module._compile(src, filename);
  };

  installed = true;
}

module.exports = {
  install: install
};

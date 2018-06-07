const { injectBabelPlugin } = require('react-app-rewired');
const rewireLess = require('react-app-rewire-less');

module.exports = function override(config, env) {
  config = injectBabelPlugin('transform-decorators-legacy', config);
  config = injectBabelPlugin(
    ['import', { libraryName: 'antd', style: true }],
    config
  );
  config = rewireLess.withLoaderOptions({
    modifyVars: { '@primary-color': '#2596DB', '@text-color': '#314659' }
  })(config, env);

  return config;
};

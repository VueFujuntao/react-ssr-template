const axios = require('axios');
const webpack = require('webpack');
const path = require('path');
const MemoryFs = require('memory-fs');
const proxy = require('http-proxy-middleware');
const ReactDOMServer = require('react-dom/server');
const asyncBootstrap = require('react-async-bootstrapper').default;
const serverConfig = require('../../build/webpack.config.server.js');
const ejs = require('ejs');
const serialize = require('serialize-javascript');

const getTemplate = () => {
  return new Promise((resolve, reject) => {
    axios.get('http://localhost:8888/public/server.ejs').then(res => {
      resolve(res);
    }).catch(error => {
      reject(error);
    })
  })
}

const NativeModule = require('module');
const vm = require('vm');

const getModuleFromString = (bundle, filename) => {
  const m = { exports: {} }
  const wrapper = NativeModule.wrap(bundle);
  const script = new vm.Script(wrapper, {
    filename: filename,
    displayErrors: true
  });
  const result = script.runInThisContext();
  result.call(m.exports, m.exports, require, m);
  return m;
}

const mfs = new MemoryFs
const serverCompiler = webpack(serverConfig);
serverCompiler.outputFileSystem = mfs;
let serverBundle, createStoreMap;
serverCompiler.watch({}, (err, stats) => {
  if (err) throw err;
  stats = stats.toJson();
  stats.errors.forEach(element => {
    console.error('error' + element);
  });
  stats.warnings.forEach(element => {
    console.warn('waring  ' + element);
  });

  const bundlePath = path.join(
    serverConfig.output.path,
    serverConfig.output.filename
  )

  const bundle = mfs.readFileSync(bundlePath, 'utf-8');
  // const m = new Module();
  // m._compile(bundle, 'server-entry.js');
  const m = getModuleFromString(bundle, 'server-entry.js');
  console.log(m)
  serverBundle = m.exports.default;
  createStoreMap = m.exports.createStoreMap;
})

const getStoreState = (stores) => {
  return Object.keys(stores).reduce((result, storeName) => {
    result[storeName] = stores[storeName].toJson();
    return result;
  }, {})
}

module.exports = function (app) {
  app.use('/public', proxy({
    target: 'http://localhost:8888'
  }));
  app.get('*', function (req, res) {
    getTemplate().then(template => {
      let routerContext = {};
      console.log(createStoreMap)
      const stores = createStoreMap();
      const app = serverBundle(stores, routerContext, req.url);
      asyncBootstrap(app).then(() => {
        if (routerContext.url) {
          res.status(302).setHeader('Location', routerContext.url);
          res.end();
          return;
        }
        const state = getStoreState(stores);
        const content = ReactDOMServer.renderToString(app);
        const html = ejs.render(template.data, {
          appString: content,
          initalState: serialize(state)
        })
        res.send(html);
      })
    })
  })
}
// Make catalogService and require globally accessible to EJS rendering templates
try {
  global.catalogService = require('./services/catalogService');
  global.siteRequire = require;

  // Install clean URL mapping for /:cat and /:cat/:product routes
  const { installUrlMapping } = require('./services/urlMapping');
  installUrlMapping();
} catch (e) {
  // ignore in non-server contexts
}

module.exports = {
  name: 'Corporate Site',
  slug: 'corporate',
  title: 'Corporate Site',
  description: 'Built with Treecraft CMS',
  domain: 'corporate.local',
  port: 4000,
  dbPrefix: 'treecraft_',
  dbName: 'treecraft_corporate',
  admin: {
    path: '/admin',
  },
};

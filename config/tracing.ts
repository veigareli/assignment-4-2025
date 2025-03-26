const tracer = require('dd-trace').init({
  service: process.env.DD_SERVICE_NAME || 'assignment-4-2025',
  env: process.env.NODE_ENV || 'development',      
  version: process.env.VERSION || '1.0.0',           
  analytics: true                                   
});

const StatsD = require('hot-shots');
const dogstatsd = new StatsD();

dogstatsd.increment('page.views');

module.exports = { tracer, dogstatsd };

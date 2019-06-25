/*
In NativeScript, the app.js file is the entry point to your application.
You can use this file to perform app-level initialization, but the primary
purpose of the file is to pass control to the app’s first module.
*/
require('./bundle-config');
const app = require('tns-core-modules/application');
const cubeClient = require('~/services/connectycube-service');

cubeClient.start();

app.run({ moduleName: 'app-root/app-root' });
     
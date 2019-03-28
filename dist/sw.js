'use strict';
importScripts('sw-toolbox.js'); 
toolbox.precache(['index.php','mssql-report.css','daypicker.css','mssql-report.js','sw.js','sw-toolbox.js']); 
toolbox.router.get('./pwa/*', toolbox.cacheFirst); 
toolbox.router.get('./*', toolbox.networkFirst, { networkTimeoutSeconds: 5});
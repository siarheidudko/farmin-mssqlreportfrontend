'use strict';
importScripts('sw-toolbox.js'); 
toolbox.precache(['index.php','mssql-report.css','daypicker.css','mssql-report.js','sw.js','sw-toolbox.js', '../images/fon1.jpg']); 
toolbox.router.get('pwa/*', toolbox.cacheFirst); 
toolbox.router.get('*', toolbox.networkFirst, { networkTimeoutSeconds: 5});
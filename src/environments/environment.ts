export const environment = {
  production: true,
  apiUrl: 'https://localhost:7083/api/',
  jwt: {
    issuer: 'https://your-prod-api.com',
    audience: 'https://your-prod-api.com',
    expireMinutes: 1440 
  },
  app: {
    version: '1.0.0',
    currency: 'PKR',
    language: 'en'
  },
  features: {
    multiTenancy: true,
    auditLogging: true,
    pagination: { defaultSize: 10, maxSize: 100 }
  }
};


// export const environment = {
//     production: true,
//     // apiUrl: 'api/',
//     apiUrl: 'https://localhost:7083/api/',  // Your .NET API base
//     hubsUrl: 'https://localhost:7083/hubs/',
    
//     assetsBasePath: '/browser/assets' 
// };

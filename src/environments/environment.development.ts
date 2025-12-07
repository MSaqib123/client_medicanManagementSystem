// src/environments/environment.ts
/**
 * Development environment configuration.
 * @description Base config for local dev. Override in prod for security.
 */
export const environment = {
  production: false,
  apiUrl: 'https://localhost:7083/api/',  // Your .NET API base
  jwt: {
    issuer: 'https://localhost:7083',
    audience: 'https://localhost:7083',
    expireMinutes: 60
  },
  app: {
    version: '1.0.0-dev',
    currency: 'PKR',
    language: 'en'
  },
  features: {
    multiTenancy: true,  // Enable TenantId filtering in services
    auditLogging: true,  // Log actions via interceptors
    pagination: { defaultSize: 10, maxSize: 100 }
  }
} as const;

/**
 * Production environment configuration.
 * @description Secure prod settings. Use secrets manager (e.g., Azure Key Vault) in CI/CD.
 */
export type ProdEnvironment = typeof environment;  // Type guard for consistency


// export const environment = {
//     production: false,
//     // apiUrl: 'api/',
//     apiUrl: 'https://localhost:5001/api/',
//     hubsUrl: 'https://localhost:5001/hubs/',
//     assetsBasePath: './assets'
// };

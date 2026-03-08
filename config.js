// Protected Endpoints
const protectedEndpoints = ['/api/user', '/api/settings'];

// Fallback Configuration for External Services
const fallbackConfig = {
    serviceA: {
        url: 'https://fallback-service-a.com',
        timeout: 5000
    },
    serviceB: {
        url: 'https://fallback-service-b.com',
        timeout: 5000
    }
};

module.exports = { protectedEndpoints, fallbackConfig };
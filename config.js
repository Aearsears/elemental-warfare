export const CONFIG = {
    isDev:
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1',
    SERVER_URL: 'ws://localhost:8080'
};

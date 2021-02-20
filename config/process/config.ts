const config = {
    ports: {
        server: 3003,
        gateway: 3002,
        app: 8080
    },
    urls: {
        server: 'http://127.0.0.1:8003',
        gateway: 'ws://127.0.0.1:8002',
        app: 'http://127.0.0.1:8080'
    }
}

export default config

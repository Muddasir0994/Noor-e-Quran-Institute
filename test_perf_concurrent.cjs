const http = require('http');

const runBenchmark = async () => {
    const NUM_REQUESTS = 1000;
    const start = Date.now();
    let completed = 0;

    // First request to fill cache
    http.get('http://localhost:3000/', (res) => {
        res.on('data', () => {});
        res.on('end', () => {
            const batchStart = Date.now();
            for (let i = 0; i < NUM_REQUESTS; i++) {
                http.get('http://localhost:3000/', (res) => {
                    res.on('data', () => {});
                    res.on('end', () => {
                        completed++;
                        if (completed === NUM_REQUESTS) {
                            const end = Date.now();
                            console.log(`Completed ${NUM_REQUESTS} requests in ${end - batchStart}ms`);
                            process.exit(0);
                        }
                    });
                }).on('error', (err) => {
                    console.error(err);
                    process.exit(1);
                });
            }
        });
    });
};

runBenchmark();

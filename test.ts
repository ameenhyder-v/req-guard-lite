import express from 'express';
import { Request, Response } from 'express';
import { rateLimit } from './dist/index'; 

const app = express();
const port = 3000;

// Apply rate limiter: 3 requests per 1 minute
const limiter = rateLimit({
    windowMs: 60 * 1000, 
    max: 3,
    message: 'You have exceeded the 3 requests in 1 minute limit!',
    statusCode: 429
});

// Apply to all requests
app.use(limiter);

app.get('/', (req: Request, res: Response) => {
    res.send('Hello World!');
});

const server = app.listen(port, async () => {
    console.log(`Test server running at http://localhost:${port}`);
    
    console.log('\n--- Starting Rate Limit Test ---');

    const makeRequest = async (i: number) => {
        try {
            const response = await fetch(`http://localhost:${port}/`);
            console.log(`Request ${i}: Status ${response.status} - ${response.status === 200 ? 'Success' : 'Blocked'}`);
        } catch (error) {
            console.error(`Request ${i} failed:`, error);
        }
    };

    // Make 5 requests (Limit is 3)
    for (let i = 1; i <= 5; i++) {
        await makeRequest(i);
    }

    console.log('--- Test Complete ---');
    server.close(); // Stop server
});

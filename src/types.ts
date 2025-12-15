export type RateLimitOptions = {
    windowMs: number; //time window in milliseconds
    max: number; //maximum requests allowed within the window
    message: string; //message to return when the rate limit is exceeded
    statusCode: number; //status code to return when the rate limit is exceeded
}

// export type RateLimitRecord = {
//     count: number;
//     startTime: number;
//   };
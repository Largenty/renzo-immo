# Upstash Redis Setup Guide

This application uses Upstash Redis for rate limiting to protect against abuse and DoS attacks.

## Why Upstash Redis?

- **Rate Limiting**: Protects API endpoints from spam and abuse
- **Serverless-friendly**: Works perfectly with Next.js and Vercel
- **Free tier**: Generous free tier available

## Setup Instructions

### 1. Create an Upstash Account

1. Go to [upstash.com](https://upstash.com)
2. Sign up for a free account
3. Create a new Redis database

### 2. Get Your Credentials

After creating a database, you'll see:
- **REST URL**: Something like `https://your-db-name.upstash.io`
- **REST Token**: A long token string

### 3. Configure Environment Variables

Add these to your `.env` file:

```env
UPSTASH_REDIS_REST_URL=https://your-db-name.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token_here
```

**Important**: These exact variable names are required by the Upstash SDK.

### 4. Restart Your Development Server

After adding the environment variables:

```bash
# Stop the dev server (Ctrl+C)
# Then restart it
npm run dev
```

## Rate Limits Configured

The application has the following rate limits:

- **Image Generation**: 10 requests per 10 seconds per user
- **Status Check**: 30 requests per 10 seconds per user
- **Login**: 5 attempts per 15 minutes per IP
- **Signup**: 3 attempts per hour per IP

## Development Without Upstash

If you're developing locally and don't want to set up Upstash yet, you have two options:

### Option 1: Disable Rate Limiting (Not Recommended)

Comment out the rate limiting checks in:
- [app/api/generate-image/route.ts](app/api/generate-image/route.ts)
- [app/api/check-generation-status/route.ts](app/api/check-generation-status/route.ts)

### Option 2: Use Local Redis (For Testing)

Install Redis locally and update [src/lib/rate-limit.ts](src/lib/rate-limit.ts:22) to use a local Redis URL.

## Troubleshooting

### Error: Unable to find environment variable

If you see this error:
```
[Upstash Redis] Unable to find environment variable: UPSTASH_REDIS_REST_URL
```

**Solution**: Make sure your `.env` file contains the correct variable names (not `REDIS_URL` or `REDIS_TOKEN`).

### Error: Failed to parse URL from /pipeline

This means the Redis client was initialized without proper credentials. Follow the setup steps above.

## Learn More

- [Upstash Documentation](https://docs.upstash.com/redis)
- [Upstash Ratelimit SDK](https://github.com/upstash/ratelimit)

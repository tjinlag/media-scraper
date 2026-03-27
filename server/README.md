# Media Scraper Server

## Tech Stack

- Node.js
- TypeScript
- SQLite
- Express
- Axios
- Cheerio
- BullMQ
- Redis

## Steps to run

1. Run Redis by docker-compose

```bash
docker-compose up -d redis
```

or

```bash
docker-compose up docker-compose.dev.yml
```

2. Run worker

```bash
cd server
npm install
npm run worker
```

3. Run Server

```bash
cd server
npm run dev
```

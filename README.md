# Media Scraper

## Tech Stack

### Back-end

- Node.js
- TypeScript
- SQLite
- Express
- Axios
- Cheerio
- BullMQ
- Redis

### Front-end

- ReactJS (Vite)
- TypeScript
- TanStack React Query
- Tailwind CSS
- Shadcn UI

## How to run

### Docker

```bash
docker-compose up --build
```

The Client will be running at `http://localhost:3000`

### Local

```bash
# Install dependencies
npm install

# Run the server
cd server
npm run dev

# Run the client
cd client
npm run dev
```

The Client will be running at `http://localhost:5173` and the Server will be running at `http://localhost:3001`.

## How to run load-test

### Requirements

- Node 20
- k6: `brew install k6`

### Steps

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

4. Run Load Test command

```bash
k6 run ./server/src/load-tests/scrape.js
```

## Performance Improvement by time

Create a Job Record for every URL from the request
-> Batching SQL Insert for all URLs one time
-> Use Redis to store job metadata, while pushing the jobs to BullMQ to do later

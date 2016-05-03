
To start running the server:
redis-server

To pull data:
npm run fetch

To build locally:
npm run dev

To clear local build:
redis-cli KEYS "feed*" | xargs redis-cli DEL
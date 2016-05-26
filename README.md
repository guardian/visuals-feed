Setup
=====

- `npm install`
- Install redis (depends on your OS)
- Put production CAPI key in gu-overrides.json

Fetch content
=============

`npm run fetch`

redis-cli KEYS "feed*" | xargs redis-cli DEL

Launch web server
=================

`npm run www`

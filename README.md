# Automatic Charging Station Management System

Build with [Typescript](https://www.typescriptlang.org), [Express](https://expressjs.com), [TypeORM](https://typeorm.io) and [Postgres](https://www.postgresql.org).
Testing with [Jest](https://jestjs.io) &  [Supertest](https://github.com/visionmedia/supertest).

Credit: This project was developed based on [Simple booking API](https://github.com/ihaback/booking-api).

# Prerequisites
- Node
- Docker

# Project setup
```
npm install
```

# Rename .env.example to env
Change `NODE_ENV` to `prod` if you want to test building prod version locally.

```yaml
NODE_ENV=dev
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_INSTANCE=postgres
DB_SYNCHRONIZE=true
JWT_SECRET=secret
```

# Run docker compose for Postgres DB
```
docker-compose up
```

# Start dev server and seed database with initial data
```
npm run dev
```

# Run tests against Postgres DB with jest & supertest
First make sure Postgres already run

```
npm run test
```

# Lint code to detect issues
```
npm run lint
```

# Build code for production
Make sure your `NODE_ENV` is set to `prod`.

```
npm run build
```

# Sample Requests

## Create company (cURL)
```bash
curl --location --request POST 'http://localhost:3000/api/companies' \
--header 'Content-Type: application/json' \
--data-raw '{
	"name": "Sample Parent",
	"parentCompanyId": ""
}'
```

## Get all companies (cURL)
```bash
curl --location --request GET 'http://localhost:3000/api/companies'
```

## Get single company
```bash
curl --location --request GET 'http://localhost:3000/api/companies/1'
```

## Update company
```bash
curl --location --request PUT 'http://localhost:3000/api/companies/1' \
--header 'Content-Type: application/json' \
--data-raw '{
	"name": "Update Sample Company",
	"parentCompanyId": ""
}'
```

## Delete company
```bash
curl --location --request DELETE 'http://localhost:3000/api/companies/6'
```

# Automatic Charging Station Management System

Build with [Typescript](https://www.typescriptlang.org), [Express](https://expressjs.com), [TypeORM](https://typeorm.io) and [Postgres](https://www.postgresql.org).
Testing with [Jest](https://jestjs.io) &  [Supertest](https://github.com/visionmedia/supertest).

Credit: This project was developed based on [Simple booking API](https://github.com/ihaback/booking-api).

# Prerequisites
- Node
- Docker

Note: for this development, I use Node v16.18.0

# Project setup
```
npm install
```

# Prepare Environment

## Rename .env.example to env
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
```

## Run docker compose for Postgres DB
```
docker-compose up
```

# Run Development with Dummy Data

## Start dev server and seed database with initial dummy data
```
npm run dev
```

Initial data:
- 3 companies: 
    - Company 1, company 2, company 3
    - Companies 2 and 3 are child companies of company 1
- 1 station type:
    - Station type 1 with maxPower = 10
- 5 stations:
    - Company 1 owns stations 5
    - Company 2 owns stations 2, 3
    - Company 3 owns stations 1, 4
    - All stations have station type 1

Existing setting:
- Every time the application dev restart, the data will reset to this initial state.

## Sample Requests

### POSTMAN Template
Use this template [sample requests on Postman](Sample_Requests.postman_collection.json) for sample API requests.

### Sample with cURL

POST Create Company
```
curl --location --request POST 'http://localhost:3000/api/companies' \
--header 'Content-Type: application/json' \
--data-raw '{
	"name": "Sample Company"
}'
```

Get All Stations
```
curl --location --request GET 'http://localhost:3000/api/stations'
```

Get Station Type id 1
```
curl --location --request GET 'http://localhost:3000/api/station-types/1'
```

DELETE Station type id 4
```
curl --location --request DELETE 'http://localhost:3000/api/station-types/4'
```

PUT Update Company id 3
```
curl --location --request PUT 'http://localhost:3000/api/companies/3' \
--header 'Content-Type: application/json' \
--data-raw '{
	"name": "New Company Name",
	"parentCompanyId": 2
}'
```

POST Script Parser
```
curl --location --request POST 'http://localhost:3000/api/scripts/parser' \
--header 'Content-Type: application/json' \
--data-raw '{
	"separator": "\n",
	"script": "Begin\nStart station 1\nWait 5\nStart station 2\nWait 10\nStart station all\nWait 10\nStop station 2\nWait 10\nStop station 3\nWait 5\nStop station all\nEnd"
}'
```

# Run Test

## Run tests against Postgres DB with jest & supertest
First, make sure Postgres is already run (run docker compose) and shut down the local run application (run test will clear DB).

```
npm run test
```

## Lint code to detect issues
```
npm run lint
```

# Build code for production
Make sure your `NODE_ENV` is set to `prod`.

```
npm run build
```

# Next Improvements
- Before deleting, check if the data (for example: company or station type) is referenced elsewhere or not.
- Improve validation, especially for input script parser.
- Improve documentation (README, etc) and error info.
- ...
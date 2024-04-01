# Running Locally

### Set up local database
```docker run --name postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=secret -e POSTGRES_DB=tasklab -p 5432:5432 -d postgres:latest```

### Environmental Variables
Follow the `.env.example` to create `.env.` files in your local project directories.

### Server
```go run main.go```

### UI
```
npm install
npm run dev
```
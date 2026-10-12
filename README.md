# Ecommerce Backend

Backend-only ecommerce project built with JavaScript, Express, MongoDB, and Docker Compose.

## Services and ports

| Service | Port | Main endpoint |
|---|---:|---|
| Order | 5003 | `/orders` |
| Payment | 5004 | `/payments` |
| Inventory | 5005 | `/inventory` |
| Product | 5006 | `/products` |
| Category | 5007 | `/categories` |
| Review | 5008 | `/reviews` |

## Structure

Each service is an independent Node.js microservice with its own:

- `index.js` API server
- Mongoose schema
- MongoDB connection
- `package.json`
- `Dockerfile`

Start all services with:

```bash
docker compose up --build
```

## Run and test with Podman

Start the backend from the project folder:

```bash
podman compose up --build -d
```

In Podman Desktop, open the published ports or test them in a browser:

```text
http://localhost:5003/
http://localhost:5004/
http://localhost:5005/
http://localhost:5006/
http://localhost:5007/
http://localhost:5008/
```

The API endpoints are available at the service port followed by its path, for example:

```text
http://localhost:5006/products
http://localhost:5007/categories
http://localhost:5008/reviews
```

Check or stop the containers:

```bash
podman compose ps
podman compose down
```

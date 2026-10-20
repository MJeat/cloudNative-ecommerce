# Ecommerce Backend

Backend-only ecommerce system using JavaScript, Express, MongoDB, Docker, and
independent microservices.

## Three-server EC2 layout

Use three EC2 instances:

```text
Client
  |
  v
Nginx load balancer :8080
  |
  +--> Gateway A :5011
  |       +--> all identity and commerce microservices
  |
  +--> Gateway B :5011
          +--> identical identity and commerce microservices
```

Gateway A and Gateway B each contain their own copy of all microservices.
Nginx balances requests between both gateway EC2 private IPs. MongoDB Atlas is
external and both gateway servers use the same MongoDB URLs and JWT secret.

## Ports

| Server or service | Port |
|---|---:|
| Nginx load balancer | 80 |
| Gateway A | 5011 |
| Gateway B | 5011 |
| Identity services on each gateway | internal `5001-5004` |
| Commerce services on each gateway | internal `5005-5010` |

## Local run

For local testing, use the root `docker-compose.yml`:

```env
MONGO_URL=your_identity_mongodb_url
COMMERCE_MONGO_URL=your_commerce_mongodb_url
JWT_SECRET=your_shared_secret
```

Start all three server roles:

```bash
docker compose up --build -d
```

Test through the load balancer:

```text
http://localhost:8080/
http://localhost:8080/products
http://localhost:8080/categories
http://localhost:8080/reviews
```

Refresh `http://localhost:8080/` to see the gateway hostname handling the
request and the shared visit count. Redis keeps the count consistent even when
Nginx sends consecutive refreshes to different gateways.

Gateway-specific testing:

```text
http://localhost:5011/
http://localhost:5012/
```

Check status or stop the stack:

```bash
docker compose ps
docker compose logs -f nginx
docker compose down
```

## Upload to EC2

Copy the repository to all three EC2 instances. Each instance uses one file
named `.env`. The gateway `.env` files must use the same values for
`JWT_SECRET`, `MONGO_URL`, and `COMMERCE_MONGO_URL`.

### Gateway A

```bash
# Copy the existing .env to Gateway A and set GATEWAY_ID=gateway-a.
docker compose -f docker-compose.gateway-a.yml up -d --build
```

### Gateway B

```bash
# Copy the same .env to Gateway B and set GATEWAY_ID=gateway-b.
docker compose -f docker-compose.gateway-b.yml up -d --build
```

Both gateway instances listen on port `5011` on their own EC2 host. Allow
port `5011` only from the Nginx EC2 security group.

### Nginx

```bash
# Copy the existing .env to Nginx and set both gateway private IP values.
docker compose -f docker-compose.nginx.yml up -d
```

Allow port `80` from the public clients and allow the Nginx EC2 security group
to reach port `5011` on both gateway EC2 instances.

Test the load balancer at:

```text
http://<NGINX_PUBLIC_IP>/
```

### 2 GB EC2 sizing

Two GB RAM is workable for one gateway server at low traffic because MongoDB is
external and Nginx runs on its own small instance. Keep only one gateway stack
per 2 GB host, avoid building all images concurrently, and enable at least
2 GB swap on each gateway host. Monitor memory with `free -h` and
`docker stats`; upgrade the gateway instances if traffic or concurrent builds
cause memory pressure.

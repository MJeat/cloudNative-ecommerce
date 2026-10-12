# Ecommerce Backend

Backend-only ecommerce project built with JavaScript, Express, MongoDB, and Docker Compose.

See [API_REFERENCE.md](API_REFERENCE.md) for service responsibilities, ports, endpoints, request formats, authentication requirements, and response examples.

## Services and ports

| Service | Port | Main endpoint |
|---|---:|---|
| Order | 5009 | `/orders` |
| Payment | 5010 | `/payments` |
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

Set `MONGO_URL` in the root `.env` file. Compose passes this same connection string to each database-backed service; the `.env` file is ignored by Git.

## EC2 Load-Balanced Deployment

Use three EC2 instances in the same VPC:

1. EC2 A runs Nginx and Gateway A.
2. EC2 B runs Gateway B.
3. EC2 C runs the Identity and Commerce services.

Clone this repository onto each instance. Create ignored environment files from the root `.env` values; do not commit database credentials or JWT secrets.

On EC2 A and B, create `gateway.env` with the shared `JWT_SECRET` and private addresses for the services on EC2 C:

```dotenv
JWT_SECRET=<same-long-random-secret-on-all-instances>
ADMIN_SERVICE_URL=http://<EC2-C-PRIVATE-IP>:5001
LOGIN_SERVICE_URL=http://<EC2-C-PRIVATE-IP>:5004
USER_SERVICE_URL=http://<EC2-C-PRIVATE-IP>:5002
REGISTRATION_SERVICE_URL=http://<EC2-C-PRIVATE-IP>:5003
ORDER_SERVICE_URL=http://<EC2-C-PRIVATE-IP>:5009
PRODUCT_SERVICE_URL=http://<EC2-C-PRIVATE-IP>:5006
CATEGORY_SERVICE_URL=http://<EC2-C-PRIVATE-IP>:5007
REVIEW_SERVICE_URL=http://<EC2-C-PRIVATE-IP>:5008
PAYMENT_SERVICE_URL=http://<EC2-C-PRIVATE-IP>:5010
INVENTORY_SERVICE_URL=http://<EC2-C-PRIVATE-IP>:5005
```

On EC2 A, create `nginx.env` with the private IPs of Gateway A and Gateway B:

```dotenv
GATEWAY_A_PRIVATE_IP=<EC2-A-PRIVATE-IP>
GATEWAY_B_PRIVATE_IP=<EC2-B-PRIVATE-IP>
```

Start both stacks on EC2 A:

```bash
docker compose --env-file gateway.env -f docker-compose.gateway.yml up -d --build
docker compose --env-file nginx.env -f docker-compose.nginx.yml up -d --build
```

Start the gateway stack on EC2 B:

```bash
docker compose --env-file gateway.env -f docker-compose.gateway.yml up -d --build
```

On EC2 C, create `identity.env` and `commerce.env` containing the same `MONGO_URL`, then start both stacks:

```bash
docker compose --env-file identity.env -f docker-compose.identity.yml up -d --build
docker compose --env-file commerce.env -f docker-compose.commerce.yml up -d --build
```

Configure security groups to allow inbound TCP 80 to EC2 A from your client IP; TCP 5011 to EC2 A/B from EC2 A's security group; and service ports 5001-5010 to EC2 C from the gateway security group. Keep backend services off public ingress.

Allow EC2 C's outbound public IP in MongoDB Atlas Network Access so the database-backed services can connect.

In Postman, use `http://<EC2-A-PUBLIC-IP>/` as the base URL. For example, register with `POST /register/register`, then log in with `POST /login/log`; send the returned token as `Authorization: Bearer <token>` for protected routes. Nginx distributes requests across the two gateway instances.

Check service status on each instance with `docker compose ps`; view logs with `docker compose logs -f`.

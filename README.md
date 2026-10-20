# Ecommerce Backend

Backend-only ecommerce project built with JavaScript, Express, MongoDB, Docker,
and independent microservices.

## Four-EC2 AWS topology

This deployment uses exactly **four EC2 instances**:

| EC2 instance | Runs | Inbound application port |
|---|---|---|
| Nginx | Nginx reverse proxy and load balancer | 80 |
| Gateway A | One API Gateway container | 5011 |
| Gateway B | One API Gateway container | 5011 |
| Backend | Identity and Commerce services | 5001-5010 |

Nginx is the load balancer. It distributes requests to either Gateway A or
Gateway B. Both gateways forward requests to the same private Backend EC2
instance.

```text
Client
  |
  v
Nginx EC2 :80
  |
  +--> Gateway A EC2 :5011
  |       |
  |       +--> Backend EC2 :5001-5010
  |
  +--> Gateway B EC2 :5011
          |
          +--> Backend EC2 :5001-5010
```

An AWS Application Load Balancer is not required for this four-instance design:
Nginx is the required load balancer. If HTTPS is needed, terminate TLS at Nginx
with an ACM-compatible design or a certificate installed on Nginx.

## Services and ports

| Service | Port | Main endpoint |
|---|---:|---|
| Admin | 5001 | `/admin` |
| User | 5002 | `/user` |
| Registration | 5003 | `/register` |
| Login | 5004 | `/login` |
| Inventory | 5005 | `/inventory` |
| Product | 5006 | `/products` |
| Category | 5007 | `/categories` |
| Review | 5008 | `/reviews` |
| Order | 5009 | `/orders` |
| Payment | 5010 | `/payments` |
| API Gateway | 5011 | `/` |
| Nginx | 80 | `/` |

The API Gateway listens on port 5000 inside its container and is published as
port 5011 on each gateway EC2 host.

## Local deployment

Create a root `.env` from `.env.example`, set `MONGO_URL` and `JWT_SECRET`, then:

```bash
docker compose up --build
```

## AWS setup

Put all four EC2 instances in the same VPC. Use private IP addresses for
instance-to-instance traffic. If possible, place the two gateway instances in
different Availability Zones.

### 1. Backend EC2

Clone the repository and create `identity.env`:

```dotenv
MONGO_URL=mongodb+srv://<username>:<password>@<cluster>/identity_db?retryWrites=true&w=majority
JWT_SECRET=<same-long-random-secret-used-by-both-gateways>
```

Create `commerce.env`:

```dotenv
MONGO_URL=mongodb+srv://<username>:<password>@<cluster>/commerce_db?retryWrites=true&w=majority
```

Start both service groups on the Backend EC2:

```bash
docker compose --env-file identity.env -f docker-compose.identity.yml up -d --build
docker compose --env-file commerce.env -f docker-compose.commerce.yml up -d --build
```

The Backend EC2 therefore runs ports `5001` through `5010`. It does not run
Nginx or the API Gateway.

### 2. Gateway A and Gateway B EC2 instances

Create the same `gateway.env` on both gateway instances. Replace
`<BACKEND_PRIVATE_IP>` with the private IP of the Backend EC2:

```dotenv
JWT_SECRET=<same-long-random-secret-used-on-the-backend>
GATEWAY_HOST_PORT=5011
GATEWAY_ID=gateway-a

ADMIN_SERVICE_URL=http://<BACKEND_PRIVATE_IP>:5001
USER_SERVICE_URL=http://<BACKEND_PRIVATE_IP>:5002
REGISTRATION_SERVICE_URL=http://<BACKEND_PRIVATE_IP>:5003
LOGIN_SERVICE_URL=http://<BACKEND_PRIVATE_IP>:5004
INVENTORY_SERVICE_URL=http://<BACKEND_PRIVATE_IP>:5005
PRODUCT_SERVICE_URL=http://<BACKEND_PRIVATE_IP>:5006
CATEGORY_SERVICE_URL=http://<BACKEND_PRIVATE_IP>:5007
REVIEW_SERVICE_URL=http://<BACKEND_PRIVATE_IP>:5008
ORDER_SERVICE_URL=http://<BACKEND_PRIVATE_IP>:5009
PAYMENT_SERVICE_URL=http://<BACKEND_PRIVATE_IP>:5010
```

Run this command on both Gateway A and Gateway B:

Use `GATEWAY_ID=gateway-a` on Gateway A and `GATEWAY_ID=gateway-b` on
Gateway B.

```bash
docker compose --env-file gateway.env -f docker-compose.gateway.yml up -d --build
```

Both gateway instances must use the same `JWT_SECRET`, because a token created
through one gateway must also be accepted by the other gateway.

### 3. Nginx EC2 instance

Create `nginx.env` containing the private IPs of Gateway A and Gateway B:

```dotenv
GATEWAY_A_PRIVATE_IP=<GATEWAY_A_PRIVATE_IP>
GATEWAY_B_PRIVATE_IP=<GATEWAY_B_PRIVATE_IP>
```

Start Nginx:

```bash
docker compose --env-file nginx.env -f docker-compose.nginx.yml up -d
```

The Nginx configuration in `nginx/nginx.conf` sends requests to:

```text
gateway-a:5011
gateway-b:5011
```

The Compose `extra_hosts` entries resolve those names to the two private IP
addresses. Nginx uses its upstream group to distribute requests between the
gateways and automatically avoids a gateway that is unavailable for new
connections.

### How `gateway-a` and `gateway-b` work

`gateway-a` and `gateway-b` are private names created inside the Nginx
container by `extra_hosts`; they are not AWS DNS records and they are not
Docker containers on the Nginx EC2 instance. Compose creates this mapping:

```yaml
extra_hosts:
  - "gateway-a:172.31.37.82"
  - "gateway-b:172.31.35.83"
```

Therefore Nginx resolves:

```text
gateway-a -> 172.31.37.82 -> Gateway A EC2 port 5011
gateway-b -> 172.31.35.83 -> Gateway B EC2 port 5011
```

When Nginx selects `server gateway-a:5011`, it opens a TCP connection to
`172.31.37.82:5011`. When it selects `server gateway-b:5011`, it connects to
`172.31.35.83:5011`. The gateway containers then use their
`ADMIN_SERVICE_URL`, `LOGIN_SERVICE_URL`, and other service URLs to connect to
the Backend EC2 private address.

You can show the mapping on the Nginx EC2 with:

```bash
docker compose --env-file nginx.env -f docker-compose.nginx.yml config
docker exec ecommerce_nginx getent hosts gateway-a gateway-b
```

### Proving that load balancing works

The gateway health endpoint includes the gateway identity:

```json
{
  "service": "api-gateway",
  "status": "ok",
  "gateway": "gateway-a"
}
```

The same request also returns these response headers:

```text
X-Load-Balanced-By: nginx
X-Gateway-Upstream: <gateway-private-ip>:5011
```

Run repeated requests from a client:

```bash
for i in {1..20}; do
  curl -sD - http://<NGINX_PUBLIC_IP>/ -o -
  echo
done
```

On Windows PowerShell:

```powershell
1..20 | ForEach-Object {
  $response = Invoke-WebRequest "http://<NGINX_PUBLIC_IP>/"
  "$($response.Headers['X-Gateway-Upstream']) $($response.Content)"
}
```

The output should show both `gateway-a` and `gateway-b` over multiple requests.
For your current Nginx public IP, use:

```powershell
1..20 | ForEach-Object {
  $r = Invoke-WebRequest http://35.172.221.6/
  "$($r.Headers['X-Gateway-Upstream']) $($r.Content)"
}
```

The output should include both gateway IDs and the header
`X-Load-Balanced-By: nginx`. On the Nginx EC2 instance, the access log also
records the selected upstream:

```bash
docker logs ecommerce_nginx
```

To make the demonstration especially clear, stop Gateway A temporarily,
repeat the requests, and show that Gateway B continues responding. Restart
Gateway A and repeat the test. This demonstrates both distribution and
failover without exposing backend services publicly.

## Security groups

Use separate security groups and security-group references instead of opening
backend ports to the internet.

### Nginx security group

Inbound:

```text
TCP 80  from 0.0.0.0/0
TCP 22  from your fixed administrator IP only
```

Outbound:

```text
TCP 5011 to Gateway-SG
TCP 443 to the internet
```

### Gateway security group

Inbound:

```text
TCP 5011 from Nginx-SG
TCP 22   from your fixed administrator IP only
```

Outbound:

```text
TCP 5001-5010 to Backend-SG
TCP 443 to the internet
```

Do not allow public access to port 5011.

### Backend security group

Inbound:

```text
TCP 5001-5010 from Gateway-SG
TCP 22       from your fixed administrator IP only
```

Outbound:

```text
TCP 443 to MongoDB Atlas and required package repositories
```

Do not allow public access to ports 5001-5010. In MongoDB Atlas Network Access,
allow the public/NAT egress IP used by the Backend EC2, not its private IP.

## Validation

Check each instance:

```bash
docker compose ps
docker compose logs --tail=100
```

Use the **Nginx EC2 public IP** or DNS name as the Postman base URL:

```text
http://<NGINX_PUBLIC_IP>/
```

The root endpoint should return the API Gateway health JSON. Stop Gateway A
temporarily and send requests again; Nginx should continue routing requests to
Gateway B. Repeat with Gateway B to demonstrate the load-balancing behavior.

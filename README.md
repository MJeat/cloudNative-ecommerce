# Ecommerce Backend

Three-EC2 backend deployment:

1. **Nginx EC2** - load balancer
2. **Gateway A EC2** - complete microservice stack
3. **Gateway B EC2** - identical complete microservice stack

## Compose file per server

| EC2 server | Compose file |
|---|---|
| Nginx | `docker-compose.nginx.yml` |
| Gateway A | `docker-compose.gateway-a.yml` |
| Gateway B | `docker-compose.gateway-b.yml` |

Run on each server:

```bash
docker compose -f <compose-file> up -d --build
```

## `.env` settings

Each EC2 server uses one `.env` file.

Gateway A:

```env
GATEWAY_ID=gateway-a
```

Gateway B:

```env
GATEWAY_ID=gateway-b
```

On the **Nginx EC2**, update the gateway private IPs in `.env`:

```env
GATEWAY_A_PRIVATE_IP=<Gateway-A-private-IP>
GATEWAY_B_PRIVATE_IP=<Gateway-B-private-IP>
```

Gateway A and B must use the same `JWT_SECRET`, `MONGO_URL`, and
`COMMERCE_MONGO_URL`.

## EC2 setup

- Increase each server storage to at least **10 GB**.
- For testing, allow inbound TCP ports **80-7000** from `0.0.0.0/0`.
- In production, restrict these rules to the required ports and trusted sources.

## Add 2 GB swap

Run on each EC2 server:

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile swap swap defaults 0 0' | sudo tee -a /etc/fstab
free -h
```

The public application URL is the Nginx server:

```text
http://<NGINX_PUBLIC_IP>/
```


# Structure

                    ┌─────────────────────┐
                    │   Client / Browser  │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │  EC2 1: Nginx       │
                    │  Load Balancer :80  │
                    └───────┬─────┬───────┘
                            │     │
              Private IP:5011     │ Private IP:5011
                            │     │
             ┌──────────────▼─┐ ┌─▼──────────────┐
             │ EC2 2: Gateway A│ │ EC2 3: Gateway B│
             │ API Gateway     │ │ API Gateway     │
             │ Port 5011       │ │ Port 5011       │
             ├─────────────────┤ ├─────────────────┤
             │ Admin           │ │ Admin           │
             │ User            │ │ User            │
             │ Registration    │ │ Registration    │
             │ Login           │ │ Login           │
             │ Inventory       │ │ Inventory       │
             │ Product         │ │ Product         │
             │ Category        │ │ Category        │
             │ Review          │ │ Review          │
             │ Order           │ │ Order           │
             │ Payment         │ │ Payment         │
             │ Redis           │ │ Redis           │
             └────────┬────────┘ └────────┬────────┘
                      │                   │
                      └─────────┬─────────┘
                                ▼
                       ┌──────────────────┐
                       │   MongoDB Atlas  │
                       └──────────────────┘


- Gateway A  -> docker-compose.gateway-a.yml
- Gateway B  -> docker-compose.gateway-b.yml
- Nginx      -> docker-compose.nginx.yml


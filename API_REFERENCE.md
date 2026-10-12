# E-Supermarket API Reference

## Base URLs and Auth

For local Docker Compose, send requests through the gateway at `http://localhost:5011`. If using Nginx, use `http://localhost` locally or `http://<nginx-public-ip>` on EC2. Backend ports listed below are service/container ports; they are not all published directly to the host.

For protected endpoints, send `Authorization: Bearer <token>`. Obtain a token with the login endpoint. Valid token roles are `admin`, `user`, and `student`. A route marked `Admin` requires role `admin`; `Any authenticated role` accepts any of those three roles.

JSON request bodies require `Content-Type: application/json`.

## Gateway

**Responsibility:** Public entry point; proxies API paths to services and enforces route authentication/authorization.

**Port:** `5000` in the container; `5011` on the local host.

| Method | URL | Request | Auth | Expected response |
|---|---|---|---|---|
| GET | `/` | None | Public | `200`: `{"service":"api-gateway","status":"ok"}` |

## Registration

**Responsibility:** Creates an account and hashes its password.

**Port:** `5003`.

| Method | URL | Request | Auth | Expected response |
|---|---|---|---|---|
| POST | `/register` | JSON: `name` (or `firstname`), `email`, `password`, `role`; optional `phone` (or `mobile`). Roles: `admin`, `user`, `student`. | Public | `201`: `{"message":"Registration successful","user":{"id":"...","name":"...","email":"...","role":"user","phone":"..."}}`; duplicate email: `409`. |
| GET | `/register` | None | Public | `200`: `Hello Register` |

Example body:

```json
{
  "name": "Alex Example",
  "email": "alex@example.com",
  "password": "example-password",
  "role": "user",
  "phone": "555-0100"
}
```

## Login

**Responsibility:** Checks credentials and returns a signed JWT.

**Port:** `5004`.

| Method | URL | Request | Auth | Expected response |
|---|---|---|---|---|
| POST | `/login/log` | JSON: `email`, `password`, `role` (`admin`, `user`, or `student`). | Public | `200`: `{"message":"Login successful","token":"..."}`; invalid credentials: `401`. |
| GET | `/login` | None | Public | `200`: `Hello Login` |

## User

**Responsibility:** Creates, searches, lists, and updates user records and profiles. Password hashes are excluded from normal responses.

**Port:** `5002`.

| Method | URL | Request | Auth | Expected response |
|---|---|---|---|---|
| GET | `/user` | None | Any authenticated role | `200`: array of user objects without `passwordHash`. |
| POST | `/user` | JSON: required `name`, `email`, `password`, `role`; optional `phone`. | Any authenticated role | `201`: user fields `name`, `email`, `role`, `phone`; duplicate email: `409`. |
| GET | `/user/email/:email` | Path parameter `email`. | Any authenticated role | `200`: matching user; `404` if absent. |
| GET | `/user/search?name=...&email=...` | Optional query parameters `name`, `email`; either or both may be supplied. | Any authenticated role | `200`: `{"message":"User Found","users":[...]}`; no matches: `404`. |
| GET | `/user/viewprofile` | User ID is taken from the validated token. | Any authenticated role | `200`: `{"message":"Profile retrieved successfully","user":{...}}`. |
| PUT | `/user/updateprofile` | JSON with any fields to change: `name`, `email`, `phone`, `password`. | Any authenticated role | `200`: `{"message":"Profile updated successfully","user":{...}}`. |

## Admin

**Responsibility:** Searches, lists, and deletes user accounts.

**Port:** `5001`.

| Method | URL | Request | Auth | Expected response |
|---|---|---|---|---|
| GET | `/admin` | None | Admin | `200`: `{"service":"admin","status":"ok"}` |
| GET | `/admin/searchuser?name=...&email=...` | Optional query parameters `name`, `email`. | Admin | `200`: `{"message":"Users found","users":[...]}`. |
| GET | `/admin/viewallusers` | None | Admin | `200`: array of users without `passwordHash`. |
| DELETE | `/admin/deleteuser?email=...` | Required query parameter `email`. | Admin | `200`: `{"message":"User deleted successfully"}`; missing email: `400`; unknown email: `404`. |

## Product

**Responsibility:** Creates, lists, updates, and deletes products.

**Port:** `5006`.

| Method | URL | Request | Auth | Expected response |
|---|---|---|---|---|
| GET | `/products` | None | Public | `200`: array of products. |
| GET | `/products/:id` | Path parameter `id`. | Public | `200`: product; `404` if absent. |
| POST | `/products` | JSON: required `name`, `price` (number, at least 0), `categoryId`; optional `description`, `imageUrl`. | Admin | `201`: created product. |
| PATCH | `/products/:id` | Path parameter `id`; JSON with product fields to update. | Admin | `200`: updated product; `404` if absent. |
| DELETE | `/products/:id` | Path parameter `id`. | Admin | `204`: empty response; `404` if absent. |

## Category

**Responsibility:** Creates and manages product categories.

**Port:** `5007`.

| Method | URL | Request | Auth | Expected response |
|---|---|---|---|---|
| GET | `/categories` | None | Public | `200`: array of categories. |
| GET | `/categories/:id` | Path parameter `id`. | Public | `200`: category; `404` if absent. |
| POST | `/categories` | JSON: required `name`; optional `description`. | Admin | `201`: created category. |
| PATCH | `/categories/:id` | Path parameter `id`; JSON with `name`, `description`, or `active`. | Admin | `200`: updated category; `404` if absent. |
| DELETE | `/categories/:id` | Path parameter `id`. | Admin | `204`: empty response; `404` if absent. |

## Inventory

**Responsibility:** Tracks product stock and warehouse location.

**Port:** `5005`.

| Method | URL | Request | Auth | Expected response |
|---|---|---|---|---|
| GET | `/inventory` | None | Admin | `200`: array of inventory records. |
| GET | `/inventory/:productId` | Path parameter `productId`. | Admin | `200`: inventory record; `404` if absent. |
| POST | `/inventory` | JSON: required `productId`, `productName`, `stock` (number); optional `warehouseLocation`. | Admin | `201`: `{"message":"Inventory item added successfully","inventory":{...}}`. |
| PATCH | `/inventory/:productId` | Path parameter `productId`; JSON: required `stock` (number). | Admin | `200`: `{"message":"Stock updated successfully","inventory":{...}}`; `404` if absent. |

## Order

**Responsibility:** Creates and manages order records and status.

**Port:** `5009`.

| Method | URL | Request | Auth | Expected response |
|---|---|---|---|---|
| GET | `/orders` | None | Any authenticated role | `200`: array of orders. |
| GET | `/orders/:id` | Path parameter `id`. | Any authenticated role | `200`: order; `404` if absent. |
| POST | `/orders` | JSON: required `customerEmail`, `productId`, `productName`, `quantity`, `totalPrice`. | Any authenticated role | `201`: `{"message":"Order created successfully","order":{...,"status":"Pending"}}`. |
| PATCH | `/orders/:id` | Path parameter `id`; JSON: `status`. | Any authenticated role | `200`: `{"message":"Order status updated successfully","order":{...}}`; `404` if absent. |

## Payment

**Responsibility:** Creates and retrieves payment records.

**Port:** `5010`.

| Method | URL | Request | Auth | Expected response |
|---|---|---|---|---|
| GET | `/payments` | None | Any authenticated role | `200`: array of payments. |
| GET | `/payments/:id` | Path parameter `id`. | Any authenticated role | `200`: payment; `404` if absent. |
| GET | `/payments/order/:orderId` | Path parameter `orderId`. | Any authenticated role | `200`: payment; `404` if absent. |
| POST | `/payments` | JSON: required `orderId`, `customerEmail`, `amount`, `paymentMethod`. | Any authenticated role | `201`: `{"message":"Payment processed successfully","payment":{...,"status":"Completed"}}`. |

## Review

**Responsibility:** Creates and manages product reviews.

**Port:** `5008`.

| Method | URL | Request | Auth | Expected response |
|---|---|---|---|---|
| GET | `/reviews` | Optional query parameter `productId`. | Any authenticated role | `200`: array of reviews, filtered by product when requested. |
| GET | `/reviews/:id` | Path parameter `id`. | Any authenticated role | `200`: review; `404` if absent. |
| POST | `/reviews` | JSON: required `productId`, `userId`, `rating` (1-5); optional `comment`. | Any authenticated role | `201`: created review. |
| PATCH | `/reviews/:id` | Path parameter `id`; JSON with review fields to update. | Any authenticated role | `200`: updated review; `404` if absent. |
| DELETE | `/reviews/:id` | Path parameter `id`. | Any authenticated role | `204`: empty response; `404` if absent. |

## Common Authentication Errors

| Status | Meaning |
|---|---|
| `401` | Missing, invalid, or expired bearer token on a protected route. |
| `403` | Valid token, but its role is not permitted for the route. |
| `502` | Gateway could not reach the target service. |

# Console errors, failed requests & links

Captured 2026-11-26 with Playwright (Chrome), production builds (`next start`). `wip` = working tree on :3001, `committed` = 8362a18 on :3002.

> Note: the `localhost:3000` CORS errors are partly an artefact of the audit setup (NEXTAUTH_URL is :3000 and the apps ran on :3001/:3002). The underlying behaviour is real though: Next `<Link>` prefetches `/login`, `/staff`, `/admin` for users who cannot open them, and middleware redirects each prefetch.

## committed

| Viewport | Route | HTTP | Console errors | Failed requests | Small (<24px) targets | Unnamed buttons/links | H-scroll |
|---|---|---|---|---|---|---|---|
| desktop | `/` | 200 | 1 | 4 | 10 | 2 | no |
| desktop | `/menu` | 200 | 1 | 4 | 10 | 2 | no |
| desktop | `/login` | 200 | 0 | 0 | 11 | 2 | no |
| desktop | `/register` | 200 | 0 | 0 | 11 | 2 | no |
| desktop | `/checkout` | 200 | 5 | 1 | 11 | 2 | no |
| desktop | `/history` | 200 | 5 | 1 | 11 | 2 | no |
| desktop | `/order/[id]` | 200 | 5 | 2 | 12 | 2 | no |
| desktop | `/staff` | 200 | 0 | 0 | 13 | 3 | no |
| desktop | `/staff/scan` | 200 | 0 | 0 | 13 | 5 | no |
| desktop | `/admin` | 200 | 0 | 0 | 13 | 3 | no |
| desktop | `/admin/products` | 200 | 1 | 4 | 13 | 19 | no |
| desktop | `/admin/categories` | 200 | 0 | 0 | 13 | 7 | no |
| desktop | `/admin/orders` | 200 | 0 | 0 | 13 | 3 | no |
| mobile | `/` | 200 | 1 | 2 | 9 | 2 | no |
| mobile | `/menu` | 200 | 1 | 2 | 9 | 2 | no |
| mobile | `/login` | 200 | 0 | 0 | 10 | 2 | no |
| mobile | `/register` | 200 | 0 | 0 | 10 | 2 | no |
| mobile | `/checkout` | 200 | 5 | 1 | 9 | 2 | no |
| mobile | `/history` | 200 | 5 | 1 | 9 | 2 | no |
| mobile | `/order/[id]` | 200 | 2 | 2 | 10 | 2 | no |
| mobile | `/staff` | 200 | 0 | 0 | 9 | 3 | no |
| mobile | `/staff/scan` | 200 | 2 | 1 | 9 | 5 | no |
| mobile | `/admin` | 200 | 0 | 0 | 9 | 3 | no |
| mobile | `/admin/products` | 200 | 1 | 2 | 9 | 19 | no |
| mobile | `/admin/categories` | 200 | 0 | 0 | 9 | 7 | no |
| mobile | `/admin/orders` | 200 | 2 | 1 | 9 | 3 | no |

### Unique messages

- `Failed to load resource: the server responded with a status of 404 (Not Found)` — home, menu, admin-products
- `404 /_next/image?url=https%3A%2F%2Fimages.unsplash.com%2Fphoto-1485808191679-5f8c7c8606af%3Fw%3D400%26h%3D400%26fit%3Dcrop%26q%3D80&w=1920&q=75` — home, menu
- `404 /_next/image?url=https%3A%2F%2Fimages.unsplash.com%2Fphoto-1559478371-6a4bf4d2ac02%3Fw%3D400%26h%3D400%26fit%3Dcrop&w=1920&q=75` — home, menu
- `404 /_next/image?url=https%3A%2F%2Fimages.unsplash.com%2Fphoto-1517701604599-bb29b5c7faaf%3Fw%3D400%26h%3D400%26fit%3Dcrop%26q%3D80&w=1920&q=75` — home, menu
- `404 /_next/image?url=https%3A%2F%2Fimages.unsplash.com%2Fphoto-1515823664409-787933b123e6%3Fw%3D400%26h%3D400%26fit%3Dcrop%26q%3D80&w=1920&q=75` — home, menu
- `Access to fetch at 'http://localhost:3000/' (redirected from 'http://localhost:3002/staff?_rsc=…') from origin 'http://localhost:3002' has been blocked by CORS policy: Response to preflight request do` — checkout-empty, history, order-detail
- `Failed to load resource: net::ERR_FAILED` — checkout-empty, history, order-detail, staff-scan, admin-orders
- `Access to fetch at 'http://localhost:3000/' (redirected from 'http://localhost:3002/admin?_rsc=…') from origin 'http://localhost:3002' has been blocked by CORS policy: Response to preflight request do` — checkout-empty, history, order-detail
- `Access to fetch at 'http://localhost:3000/' (redirected from 'http://localhost:3002/staff/scan?_rsc=…') from origin 'http://localhost:3002' has been blocked by CORS policy: Response to preflight reque` — checkout-empty, history, order-detail
- `Access to fetch at 'http://localhost:3000/' (redirected from 'http://localhost:3002/login?_rsc=…') from origin 'http://localhost:3002' has been blocked by CORS policy: Response to preflight request do` — checkout-empty, history, order-detail, staff-scan, admin-orders
- `FAILED http://localhost:3000/ net::ERR_FAILED` — checkout-empty, history, order-detail, staff-scan, admin-orders
- `FAILED https://images.unsplash.com/photo-1515823664409-787933b123e6?w=400&h=400&fit=crop&q=80 net::ERR_BLOCKED_BY_ORB` — order-detail
- `404 /_next/image?url=https%3A%2F%2Fimages.unsplash.com%2Fphoto-1485808191679-5f8c7c8606af%3Fw%3D400%26h%3D400%26fit%3Dcrop%26q%3D80&w=256&q=75` — admin-products
- `404 /_next/image?url=https%3A%2F%2Fimages.unsplash.com%2Fphoto-1515823664409-787933b123e6%3Fw%3D400%26h%3D400%26fit%3Dcrop%26q%3D80&w=256&q=75` — admin-products
- `404 /_next/image?url=https%3A%2F%2Fimages.unsplash.com%2Fphoto-1559478371-6a4bf4d2ac02%3Fw%3D400%26h%3D400%26fit%3Dcrop&w=256&q=75` — admin-products
- `404 /_next/image?url=https%3A%2F%2Fimages.unsplash.com%2Fphoto-1517701604599-bb29b5c7faaf%3Fw%3D400%26h%3D400%26fit%3Dcrop%26q%3D80&w=256&q=75` — admin-products
- `404 /_next/image?url=https%3A%2F%2Fimages.unsplash.com%2Fphoto-1559478371-6a4bf4d2ac02%3Fw%3D400%26h%3D400%26fit%3Dcrop&w=640&q=75` — home
- `404 /_next/image?url=https%3A%2F%2Fimages.unsplash.com%2Fphoto-1517701604599-bb29b5c7faaf%3Fw%3D400%26h%3D400%26fit%3Dcrop%26q%3D80&w=640&q=75` — home
- `404 /_next/image?url=https%3A%2F%2Fimages.unsplash.com%2Fphoto-1515823664409-787933b123e6%3Fw%3D400%26h%3D400%26fit%3Dcrop%26q%3D80&w=640&q=75` — menu
- `404 /_next/image?url=https%3A%2F%2Fimages.unsplash.com%2Fphoto-1485808191679-5f8c7c8606af%3Fw%3D400%26h%3D400%26fit%3Dcrop%26q%3D80&w=640&q=75` — menu

### Internal links checked (as admin, no redirects followed)

- `/` → 200
- `/menu` → 200
- `/login` → 307
- `/menu?product=1` → 200
- `/menu?product=2` → 200
- `/menu?product=3` → 200
- `/menu?product=4` → 200
- `/menu?product=5` → 200
- `/menu?product=6` → 200
- `/menu?product=7` → 200
- `/menu?product=8` → 200
- `/checkout` → 200
- `/staff` → 200
- `/staff/scan` → 200
- `/admin` → 200
- `/register` → 200
- `/history` → 200
- `/order/6b08512d494440e85420a290` → 200
- `/order/6b0850ed7aec6891cf52466b` → 200
- `/admin/products` → 200
- `/admin/categories` → 200
- `/admin/orders` → 200

## wip

| Viewport | Route | HTTP | Console errors | Failed requests | Small (<24px) targets | Unnamed buttons/links | H-scroll |
|---|---|---|---|---|---|---|---|
| desktop | `/` | 200 | 1 | 4 | 5 | 0 | no |
| desktop | `/menu` | 200 | 1 | 4 | 4 | 0 | no |
| desktop | `/login` | 200 | 0 | 0 | 1 | 0 | no |
| desktop | `/register` | 200 | 0 | 0 | 1 | 0 | no |
| desktop | `/checkout` | 200 | 2 | 1 | 4 | 0 | no |
| desktop | `/history` | 200 | 2 | 1 | 4 | 0 | no |
| desktop | `/order/[id]` | 200 | 2 | 2 | 5 | 0 | no |
| desktop | `/staff` | 200 | 0 | 0 | 0 | 1 | no |
| desktop | `/staff/scan` | 200 | 0 | 0 | 0 | 3 | no |
| desktop | `/admin` | 200 | 0 | 0 | 0 | 1 | no |
| desktop | `/admin/products` | 200 | 1 | 4 | 0 | 17 | no |
| desktop | `/admin/categories` | 200 | 0 | 0 | 0 | 5 | no |
| desktop | `/admin/orders` | 200 | 0 | 0 | 0 | 1 | no |
| mobile | `/` | 200 | 1 | 3 | 6 | 0 | no |
| mobile | `/menu` | 200 | 1 | 4 | 5 | 0 | no |
| mobile | `/login` | 200 | 0 | 0 | 2 | 0 | no |
| mobile | `/register` | 200 | 0 | 0 | 2 | 0 | no |
| mobile | `/checkout` | 200 | 2 | 1 | 4 | 0 | no |
| mobile | `/history` | 200 | 0 | 0 | 4 | 0 | no |
| mobile | `/order/[id]` | 200 | 0 | 1 | 5 | 0 | no |
| mobile | `/staff` | 200 | 0 | 0 | 0 | 1 | no |
| mobile | `/staff/scan` | 200 | 0 | 0 | 0 | 3 | no |
| mobile | `/admin` | 200 | 0 | 0 | 0 | 1 | no |
| mobile | `/admin/products` | 200 | 1 | 2 | 0 | 17 | no |
| mobile | `/admin/categories` | 200 | 0 | 0 | 0 | 5 | no |
| mobile | `/admin/orders` | 200 | 0 | 0 | 0 | 1 | no |

### Unique messages

- `Failed to load resource: the server responded with a status of 404 (Not Found)` — home, menu, admin-products
- `404 /_next/image?url=https%3A%2F%2Fimages.unsplash.com%2Fphoto-1517701604599-bb29b5c7faaf%3Fw%3D400%26h%3D400%26fit%3Dcrop%26q%3D80&w=256&q=75` — home, admin-products, menu
- `404 /_next/image?url=https%3A%2F%2Fimages.unsplash.com%2Fphoto-1559478371-6a4bf4d2ac02%3Fw%3D400%26h%3D400%26fit%3Dcrop&w=256&q=75` — home, admin-products, menu
- `404 /_next/image?url=https%3A%2F%2Fimages.unsplash.com%2Fphoto-1515823664409-787933b123e6%3Fw%3D400%26h%3D400%26fit%3Dcrop%26q%3D80&w=256&q=75` — home, admin-products, menu
- `404 /_next/image?url=https%3A%2F%2Fimages.unsplash.com%2Fphoto-1485808191679-5f8c7c8606af%3Fw%3D400%26h%3D400%26fit%3Dcrop%26q%3D80&w=256&q=75` — home, admin-products, menu
- `404 /_next/image?url=https%3A%2F%2Fimages.unsplash.com%2Fphoto-1515823664409-787933b123e6%3Fw%3D400%26h%3D400%26fit%3Dcrop%26q%3D80&w=384&q=75` — menu
- `404 /_next/image?url=https%3A%2F%2Fimages.unsplash.com%2Fphoto-1485808191679-5f8c7c8606af%3Fw%3D400%26h%3D400%26fit%3Dcrop%26q%3D80&w=384&q=75` — menu
- `404 /_next/image?url=https%3A%2F%2Fimages.unsplash.com%2Fphoto-1517701604599-bb29b5c7faaf%3Fw%3D400%26h%3D400%26fit%3Dcrop%26q%3D80&w=384&q=75` — menu
- `404 /_next/image?url=https%3A%2F%2Fimages.unsplash.com%2Fphoto-1559478371-6a4bf4d2ac02%3Fw%3D400%26h%3D400%26fit%3Dcrop&w=384&q=75` — menu
- `Access to fetch at 'http://localhost:3000/' (redirected from 'http://localhost:3001/login?_rsc=…') from origin 'http://localhost:3001' has been blocked by CORS policy: Response to preflight request do` — checkout-empty, history, order-detail
- `Failed to load resource: net::ERR_FAILED` — checkout-empty, history, order-detail
- `FAILED http://localhost:3000/ net::ERR_FAILED` — checkout-empty, history, order-detail
- `FAILED https://images.unsplash.com/photo-1515823664409-787933b123e6?w=400&h=400&fit=crop&q=80 net::ERR_BLOCKED_BY_ORB` — order-detail

### Internal links checked (as admin, no redirects followed)

- `/` → 200
- `/menu` → 200
- `/login` → 307
- `/#how-it-works` → 200
- `/history` → 200
- `/register` → 200
- `/order/6b0850ed7aec6891cf52466b` → 200
- `/staff` → 200
- `/staff/scan` → 200
- `/admin` → 200
- `/admin/products` → 200
- `/admin/categories` → 200
- `/admin/orders` → 200

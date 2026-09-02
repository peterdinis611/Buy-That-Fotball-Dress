# KIT VAULT

Match-worn football shirts. Highest bid when the clock hits zero wins.

.NET 10 microservices behind a YARP gateway, Next.js App Router on the concourse. English UI. Day / Night via Lights.

## Run

Docker Desktop, .NET 10, Node 20+.

```bash
./dev.sh
```

Opens [http://localhost:3000](http://localhost:3000). Ctrl+C stops everything.

Backends only: `./dev.sh --no-web`. After you change a service DLL, stop and run `./dev.sh` again — running processes hold the old binaries.

## Tests

```bash
dotnet test
```

SQLite in memory, no RabbitMQ. Covers lot provenance, injury time, relist, house cut, desk till / tracking / dispute, card slips, search rules, hung tape, and squad-name validation.

Frontend:

```bash
cd web && npm test
```

Vitest. Worn stamp, sell/bid validation, live cache, search fuse.

## Sign in

Seed password for every squad name: `PitchSide!1`

| Username | Role on the seeded Ronaldo desk |
| --- | --- |
| `kitvault` | Buyer — pay, confirm received |
| `selecao.archive` | Seller — add tracking, mark shipped |
| `steward` | Match official — `/office` tunnel |

Other seed accounts: `jerseyhunter`, `campnou.store`, `anfield.kits`, `munich.matchworn`, `intermiami.official`, `oldtrafford.vault`, `tehelne.kits`.

## Ports

| What | Where |
| --- | --- |
| Web | http://localhost:3000 |
| Gateway | http://localhost:5027 |
| Auction | :5025 |
| Search | :5026 |
| Identity | :5028 |
| Bids | :5029 |
| Notifications (SignalR `/hubs/notifications`) | :5030 |
| Settlement (desk) | :5031 |
| Email | :5032 |
| Admin (office) | :5033 |
| Payment (till) | :5034 |
| Redis | :6379 |
| RabbitMQ UI | http://localhost:15672 (`guest` / `guest`) |
| Mailpit (letters) | http://localhost:8025 SMTP `:1025` |

The browser talks to the **gateway**. Direct service ports are for debugging.

## How a lot closes

1. Bids go to BidService while the lot is Live. A bid in the last **3 minutes** adds injury time: the clock jumps to now + 3 minutes and the board shows **+3 min**.
2. When the clock hits zero with a winner, SettlementService opens a **desk**. Hammer is the winning bid. **Desk** is 10% house. **Due** is hammer + desk. PaymentService opens a **Held** till for the due amount. Seller takes hammer.
3. Buyer pays (`POST /api/settlements/{id}/pay`) → Settlement asks PaymentService to capture. Empty `Stripe:SecretKey` stamps a **CARD-…** slip locally. With a secret key, PaymentService opens **Stripe Checkout** in the browser and returns `checkoutUrl`. After Stripe, `/profile?desk={id}&session_id=…` finishes the desk. Then `PaymentCaptured` and the desk is **Paid**.
4. Seller enters a **tracking** number and marks shipped.
5. Buyer confirms **shirt received**. Either side can **dispute** with a written reason before that.

Unsold lots (`ReserveNotMet`) can **Hang again** (`POST /api/auctions/{id}/relist` with a new `auctionEnd`). Same shirt, new clock. Old bids come off the book.

Locker → **Desk** lists your open tills. **Letters** (bay 07) is the in-app shelf for outbid / won / ship it / tape match. Mailpit is still the SMTP tray.

Seeded unpaid desk: Brazil / Ronaldo Nazário, `kitvault` buys from `selecao.archive`. Hammer €620, desk €62, due €682. Lot id `9c5b1e08-6a24-4d73-8f91-3e0b7c2a5466`.

### Desk API (via gateway)

All mutating routes need a JWT from Identity.

- `GET /api/settlements/mine`
- `GET /api/settlements/by-auction/{auctionId}`
- `POST /api/settlements/{id}/pay` optional `{ "sessionId", "successUrl", "cancelUrl" }` — returns `checkoutUrl` when Stripe Checkout is on
- `GET /api/payments/mine`
- `GET /api/payments/by-settlement/{settlementId}`
- `POST /api/payments/{settlementId}/charge` (Settlement calls this; you can hit it via the gateway too)
- `POST /api/settlements/{id}/ship` `{ "tracking": "…" }` (min 4 characters)
- `POST /api/settlements/{id}/receive`
- `POST /api/settlements/{id}/dispute` `{ "note": "…" }` (min 8 characters)
- `POST /api/auctions/{id}/relist` `{ "auctionEnd": "…" }` (seller, unsold lots only)
- `GET /api/letters` (JWT) — locker letters, newest first

## Match office

Sign in as `steward` / `PitchSide!1` and open **Office** (`/office`). AdminService sits behind the gateway at `/api/admin`. The steward can:

- Read the squad sheet, every peg, and every till
- **Verify** a lot (steward stamp on collar / wash / label / COA)
- **Scratch** a live lot off the wall (sold desks stay)
- **Whistle** a disputed desk back to the last honest step (paid / shipped / opened)

Each scratch and whistle is stamped on the office clip (`office.db`).

## Letters and the LED tape

NotificationService listens on RabbitMQ and pushes the live board over SignalR. IdentityService is on the same bus: a new squad name publishes `UserCreated`.

Personal letters (outbid, you won, paid / ship it, shirt shipped, tape match, you're on the sheet) are composed by NotificationService and published as `LetterRequested`. **EmailService** shelves every letter in `mail.db` first, then looks up the mailbox at Identity `GET /api/auth/users/{username}` and sends SMTP.

Locker bay **07 Letters** (`GET /api/letters`) is that shelf. Locally `./dev.sh` also starts **Mailpit**. Open [http://localhost:8025](http://localhost:8025) for the SMTP inbox (`board@kitvault.test`). Production: set `Smtp:Host` (and optional `Port`, `From`, `Username`, `Password`, `Ssl`) on EmailService. Empty host means SMTP is skipped; the locker still holds the letter.

The same events show as LED toasts and Board tape when you are signed in as the person they are for.

## Provenance

A lot can carry the **match**, the **date**, the **opponent**, a **photo from the grass**, plus **collar / wash / label** shots and an optional **COA**. Fill match, opponent, and date and the shirt gets a **Worn** stamp. A steward can **verify** the lot in the office. That is KIT VAULT, not a generic listing.

Bids can carry a **snag** (max). BidService jumps the book +1 € against the runner until a ceiling loses.

The search rail and the live wall filter by league, size, kit, price, and “ends in 2h”. Sign in and **hang this filter** — SearchService writes a tape peg and publishes `LetterRequested` when a matching shirt hangs.

## Layout

```
src/
  AuctionService
  BidService
  SearchService
  IdentityService
  NotificationService
  EmailService
  AdminService
  SettlementService
  PaymentService
  GatewayService
  Contracts
  Caching
web/          Next.js (npm run dev / npm run storybook)
```

SQLite files live next to each service (`identity.db`, `settlement.db`, `payment.db`, …).

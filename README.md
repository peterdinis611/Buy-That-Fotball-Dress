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

SQLite in memory, no RabbitMQ. Covers lot provenance, bid floor, desk till / tracking / dispute, search rules, and squad-name validation.

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
| Redis | :6379 |
| RabbitMQ UI | http://localhost:15672 (`guest` / `guest`) |
| Mailpit (letters) | http://localhost:8025 SMTP `:1025` |

The browser talks to the **gateway**. Direct service ports are for debugging.

## How a lot closes

1. Bids go to BidService while the lot is Live.
2. When the clock hits zero with a winner, SettlementService opens a **desk**.
3. Buyer pays at the till → status **Paid**, slip `TILL-…` (not Stripe yet).
4. Seller enters a **tracking** number and marks shipped.
5. Buyer confirms **shirt received**. Either side can **dispute** with a written reason before that.

Locker → **Desk** lists your open tills. The same till sits on the lot board after Sold for.

Seeded unpaid desk: Brazil / Ronaldo Nazário, `kitvault` buys from `selecao.archive` for 620. Lot id `9c5b1e08-6a24-4d73-8f91-3e0b7c2a5466`.

### Desk API (via gateway)

All mutating routes need a JWT from Identity.

- `GET /api/settlements/mine`
- `GET /api/settlements/by-auction/{auctionId}`
- `POST /api/settlements/{id}/pay`
- `POST /api/settlements/{id}/ship` `{ "tracking": "…" }` (min 4 characters)
- `POST /api/settlements/{id}/receive`
- `POST /api/settlements/{id}/dispute` `{ "note": "…" }` (min 8 characters)

## Match office

Sign in as `steward` / `PitchSide!1` and open **Office** (`/office`). AdminService sits behind the gateway at `/api/admin`. The steward can:

- Read the squad sheet, every peg, and every till
- **Scratch** a live lot off the wall (sold desks stay)
- **Whistle** a disputed desk back to the last honest step (paid / shipped / opened)

Each scratch and whistle is stamped on the office clip (`office.db`).

## Letters and the LED tape

NotificationService listens on RabbitMQ and pushes the live board over SignalR. IdentityService is on the same bus: a new squad name publishes `UserCreated`.

Personal letters (outbid, you won, paid / ship it, shirt shipped, you're on the sheet) are composed by NotificationService and published as `LetterRequested`. **EmailService** looks up the mailbox at Identity `GET /api/auth/users/{username}` and sends SMTP.

Locally `./dev.sh` starts **Mailpit**. Open [http://localhost:8025](http://localhost:8025) for the inbox (`board@kitvault.test`). Production: set `Smtp:Host` (and optional `Port`, `From`, `Username`, `Password`, `Ssl`) on EmailService. Empty host means the letter stays in the EmailService log.

The same events show as LED toasts and Board tape when you are signed in as the person they are for.

## Provenance

A lot can carry the **match**, the **date**, the **opponent**, and a **photo from the grass**. Fill match, opponent, and date and the shirt gets a **Worn** stamp on the peg and the lot board. The pitch photo is optional and sits on the ticket. That is KIT VAULT, not a generic listing.

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
  GatewayService
  Contracts
  Caching
web/          Next.js (npm run dev / npm run storybook)
```

SQLite files live next to each service (`identity.db`, `settlement.db`, …).

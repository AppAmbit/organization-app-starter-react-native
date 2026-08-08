# Automated backend setup

Connect the AppAmbit MCP server to your AI assistant once, paste one prompt, and the backend
configures itself: content types, all content entries with their relations resolved, the auth
database, and your `.env`.

What is left for you is short and honest:

| Automated by the prompt | Still yours |
| --- | --- |
| Create the 4 CMS content types | Create the app in the AppAmbit dashboard (needs a human) |
| Create every entry, in dependency order | Flip two fields to *many* relations (see checkpoint below) |
| Resolve `@content_type:lookup_key` → real entry ids | Upload images to the media library |
| Create + link the database, create the `users` table | Firebase / APNs push credentials |
| Write `APPAMBIT_APP_KEY_*` into `.env` | Running the app |
| Verify the import by re-querying the CMS | |

---

## 1. Get a token

AppAmbit dashboard → **Settings → AI Assistant**. Create and copy the personal access token — it is scoped to your team, so treat it like a password.

## 2. Connect the MCP server

**Claude Code** — from the repo root:

```sh
claude mcp add --transport http appambit https://appambit.com/mcp/appambit \
  --header "Authorization: Bearer YOUR_TOKEN"
```

Add `--scope project` to write it into the repo's `.mcp.json` and share the server (not the token —
see the warning below) with your team.

**Any other MCP client** (Cursor, VS Code, Claude Desktop, Windsurf) — copy
[`.mcp.json.example`](../.mcp.json.example) to `.mcp.json`, drop your token in, and point the client
at it. Same shape everywhere:

```json
{
  "mcpServers": {
    "appambit": {
      "type": "http",
      "url": "https://appambit.com/mcp/appambit",
      "headers": { "Authorization": "Bearer YOUR_TOKEN" }
    }
  }
}
```

> **Your token is not a repo file.** `.mcp.json` is gitignored for this reason. If you clone a fork
> that already has one, replace the token with your own — a stranger's token points at a stranger's
> team.

**Check it works.** Ask the assistant: *"list my AppAmbit apps"*. You should get your apps with
their `app_key`s. If not, the token is wrong or was not sent as a `Bearer` header.

## 3. Create the app in the dashboard

The MCP server can read and write your team's data, but it cannot create an app — do that in the
dashboard (one app per platform: iOS and Android). You do not need to copy the keys by hand; the
prompt below reads them back and writes `.env` for you.

---

## 4. The prompt

Fill in the two bracketed values, paste it into your assistant with this repo open. It is short
because the assistant reads the rest from the repo:

````text
Set up my AppAmbit backend with the MCP tools. Read the "Rules" section of
samples/AUTOMATED-SETUP.md first and follow it.

App name: [My App Name]
Dataset: samples/datasets/[blog].json

1. list-apps-tool -> find my app_key(s), write them into .env.
2. Create the 4 content types from samples/schema/content-types.json in one call.
3. STOP: tell me to switch the two fields to MANY relations, and wait for me to confirm.
4. Create the dataset entries in import_order, resolving the @ tokens as you go.
5. Create/link the database and run the users DDL.
6. Verify, then tell me what is left for me to do by hand.
````

### Rules

The prompt points here on purpose — this is the part that has to be right, and it does not change
between runs.

- **`.env`** — copy `.env.example` first if it does not exist. Set only `APPAMBIT_APP_KEY_ANDROID`
  and `APPAMBIT_APP_KEY_IOS`.
- **Content types** — pass the `content_types` array from `samples/schema/content-types.json`
  unchanged, in a single `create-content-type-tool` call.
- **The checkpoint (step 3)** is a real stop. `create-content-type-tool` has no `multiple` flag, so
  both relation fields come out single-valued and every section holding more than one card fails
  validation until you fix it in the dashboard. Fifteen seconds of work:

  > Content types → **Feed Carousel** → field `carousel` → set to a **many** relation. Repeat for
  > **Content Details** → field `content`.

- **Entries** — one `create-content-entry-tool` call per content type, in the dataset's
  `import_order` (`content_detail_items` → `content_details` → `carousel_items` → `feed_carousel`).
  Each `data` goes as a JSON string, `status: "published"`, `locale: "en"`.
- **Relations** — `@content_type:lookup_key` tokens, not ids (for `content_details`, the key is its
  `title`). There is **no update-entry tool**, so keep a `lookup_key → id` map from each call and
  substitute *before* creating the entry that references it. `import_order` is bottom-up, so every
  target already exists in time.
- **Database** — `list-databases-tool` first and reuse a linked database if there is one; otherwise
  `create-database-tool` with the `app_key` so it links in the same call. Then
  `execute-database-statement-tool` with `transaction: true`:

  ```sql
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL,
    token TEXT,
    expires_at TEXT
  );
  CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users (email);
  ```

  No sessions table — the hashed session token and its expiry live on the user row.
- **Verify** — `query-content-tool` on `feed_carousel` and `carousel_items`: counts should match the
  dataset and no field should still contain an `@` token. Then `list-database-tables-tool` for
  `users`.
- **Two apps** — content types and entries are per-app, so repeat the content and database steps for
  the second `app_key` (iOS and Android are separate apps).

---

## 5. After the run

```sh
npm start
npm run ios      # or: npm run android
```

Register an account, and the feed should be your imported content. If a section shows a single card
instead of a carousel, step 4 was skipped — fix the field, then re-run step 5 of the prompt for
`feed_carousel` only.

Images are still empty at this point. That is deliberate: see [Images](README.md#images) for the
slot sizes and the checker.

---

## Other prompts worth keeping

**Switch the app to a different vertical:**

```text
Import samples/datasets/movies.json into my AppAmbit app <app_key> using the MCP tools, following
import_order and resolving @content_type:lookup_key tokens to real ids as you go. The content types
already exist — do not recreate them. Tell me which of the old entries are now orphaned.
```

**Generate a dataset for my own vertical:**

```text
Read samples/datasets/blog.json to learn the shape, then write samples/datasets/<mine>.json for a
[real-estate listings] app: 5 feed sections (one featured, two small, one large collection, one
banner), 12 carousel_items, 2 content_details with 4-5 blocks each. Keep the same schema, the same
@token relation style, and the same images block with slots and aspect ratios. Then import it.
```

**Health check:**

```text
Using the AppAmbit MCP tools, check app <app_key>: verify-sdk-integration-tool, list-crashes-tool
for the last 7 days, and query-content-tool for feed_carousel. Tell me if anything looks wrong.
```

---

## Troubleshooting

| Symptom | Cause |
| --- | --- |
| Assistant says it has no AppAmbit tools | MCP server not connected, or the client was not restarted after editing `.mcp.json` |
| `401` / empty app list | Token wrong, expired, or belongs to another team |
| Relation validation errors on `feed_carousel` | Step 4 checkpoint skipped — `carousel` is still a single relation |
| Entries created but the feed is empty | Entries are `draft`; only `published` reaches the SDK |
| `@carousel_items:...` still in the data | The assistant created entries out of order — recreate them following `import_order` |
| Cards render without images | Expected. Upload art and set `image` / `banner_image` |

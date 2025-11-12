# Deploy to Cloudflare Workers - Step by Step Guide

This guide explains how to deploy your n8n workflow dashboard to Cloudflare Workers and Pages.

## What You're Deploying

- **Frontend (React Dashboard)** → Cloudflare Pages (static files)
- **Backend (API + WebSockets)** → Cloudflare Workers + Durable Objects

## Prerequisites

1. A Cloudflare account (free tier works!)
2. Wrangler CLI installed (already done in this project)
3. A GitHub/GitLab account (for Pages deployment)

---

## Step 1: Build the Frontend

First, build the React frontend into static files:

```bash
npm run build
```

This creates a `dist/public` folder with your HTML, CSS, and JavaScript files.

---

## Step 2: Login to Cloudflare

Open your terminal and login to Cloudflare:

```bash
npx wrangler login
```

This will open a browser window. Click "Allow" to authorize Wrangler.

---

## Step 3: Deploy the Worker (Creates Durable Objects)

Your app uses Durable Objects for storage and WebSockets. The first deployment will:
1. Create the `WorkflowStorage` Durable Object class
2. Run migrations to set up the binding
3. Deploy your Worker code

Deploy with:

```bash
npx wrangler deploy
```

**Important**: On first deployment, you might see a migration prompt. Type `yes` to apply the migration that creates the Durable Object binding.

---

## Step 4: Verify the Deployment

After deployment completes, you'll see:

```
✨ Built successfully
📦 Uploading...
⛅ Durable Objects migration successful
🌍  https://n8n-dashboard.YOUR-SUBDOMAIN.workers.dev
```

**Save this URL!** This is your production endpoint where:
- n8n will send webhooks → `<URL>/api/webhook`
- You'll view the dashboard → `<URL>/`
- WebSocket connects → `<URL>/ws`

---

## Step 5: Test Your Deployment

### Test the API endpoint:

```bash
curl https://n8n-dashboard.YOUR-SUBDOMAIN.workers.dev/api/outputs
```

You should see: `[]` (empty array)

### Test the webhook:

```bash
curl -X POST https://n8n-dashboard.YOUR-SUBDOMAIN.workers.dev/api/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "status": "success",
    "data": {
      "message": "Test from Cloudflare",
      "value": 123
    }
  }'
```

You should get back the created workflow output with an ID.

---

## Step 6: Update Your n8n Workflows

In your n8n workflows, update the webhook URL to:

```
https://n8n-dashboard.YOUR-SUBDOMAIN.workers.dev/api/webhook
```

**Required JSON format:**
```json
{
  "status": "success",
  "data": {
    "your": "workflow data here"
  }
}
```

---

## Step 7: View Your Dashboard

Open your browser and go to:

```
https://n8n-dashboard.YOUR-SUBDOMAIN.workers.dev
```

You should see the dashboard! It will automatically connect via WebSocket and show live updates when you send webhook data from n8n.

---

## Local Development with Workers

To test locally before deploying:

```bash
npx wrangler dev
```

This starts a local server at `http://localhost:8787`

---

## Pricing

**Cloudflare Free Tier includes:**
- 100,000 Worker requests per day
- 1,000 Durable Object requests per day
- 1 GB Durable Object storage

For most n8n monitoring use cases, this is more than enough!

**Paid tier ($5/month):**
- 10 million Worker requests
- Unlimited Durable Object requests
- 1 GB storage (included), $0.20/GB after

---

## Environment Variables / Secrets

If you need to add secrets (like API keys):

```bash
npx wrangler secret put MY_SECRET_NAME
```

Then use them in your code:
```typescript
env.MY_SECRET_NAME
```

---

## Troubleshooting

### "Worker threw exception"
Check the live logs:
```bash
npx wrangler tail
```

### WebSocket not connecting
Make sure you're accessing via HTTPS (not HTTP). Cloudflare Workers only support secure WebSocket connections (wss://).

### Webhook returns 400
Check the JSON format. Required fields:
- `status` (string)
- `data` (object)

---

## Updating Your Deployment

Whenever you make changes:

1. Build the frontend:
   ```bash
   npm run build
   ```

2. Deploy the Worker:
   ```bash
   npx wrangler deploy
   ```

That's it! Your changes are live.

---

## Alternative: Deploy Frontend to Cloudflare Pages

If you want to use Cloudflare Pages for the frontend (instead of serving it from the Worker), follow these steps:

### Step 1: Update wrangler.toml

Remove the `[site]` section from `wrangler.toml`:

```toml
# Comment out or remove this:
# [site]
# bucket = "./dist/public"
```

### Step 2: Deploy the Worker (Backend Only)

```bash
npx wrangler deploy
```

Save the Worker URL (e.g., `https://n8n-dashboard.YOUR-SUBDOMAIN.workers.dev`)

### Step 3: Create a Pages Project

1. Go to https://dash.cloudflare.com
2. Click "Workers & Pages"
3. Click "Create application" → "Pages" → "Connect to Git"
4. Connect your GitHub/GitLab repository
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist/public`
   - **Root directory**: (leave empty)

### Step 4: Add Environment Variable

In Pages settings, add an environment variable:
- **Name**: `VITE_API_URL`
- **Value**: Your Worker URL (e.g., `https://n8n-dashboard.YOUR-SUBDOMAIN.workers.dev`)

### Step 5: Update Frontend Code

Create `client/.env.production`:

```env
VITE_API_URL=https://n8n-dashboard.YOUR-SUBDOMAIN.workers.dev
```

Update API calls to use this environment variable if needed.

### Step 6: Deploy

Push to your git repository. Cloudflare Pages will automatically build and deploy your frontend.

**Result:**
- Frontend: `https://your-project.pages.dev`
- Backend: `https://n8n-dashboard.YOUR-SUBDOMAIN.workers.dev`
- n8n webhook URL: `https://n8n-dashboard.YOUR-SUBDOMAIN.workers.dev/api/webhook`

---

## Custom Domain (Optional)

To use your own domain instead of `workers.dev`:

1. Go to Cloudflare Dashboard → Workers & Pages
2. Click your worker (n8n-dashboard)
3. Go to Settings → Triggers → Custom Domains
4. Click "Add Custom Domain"
5. Enter your domain (must be on Cloudflare)

Example: `dashboard.yourdomain.com`

---

## Monitor Your Worker

View analytics and logs:

1. **Dashboard**: https://dash.cloudflare.com → Workers & Pages
2. **Live Logs**: Run `npx wrangler tail` in your terminal
3. **Analytics**: See request count, errors, and performance metrics

---

## Important Notes

✅ **What works:**
- Real-time WebSocket updates
- Webhook endpoint for n8n
- Data persists (stored in Durable Objects)
- Automatic scaling
- Global CDN

⚠️ **Limitations:**
- Storage is limited (1 GB free tier)
- Currently stores last 20 workflow outputs (configurable in code)
- CPU execution time limited to 30 seconds per request

---

## Need Help?

- **Cloudflare Workers Docs**: https://developers.cloudflare.com/workers/
- **Durable Objects**: https://developers.cloudflare.com/durable-objects/
- **Wrangler CLI**: https://developers.cloudflare.com/workers/wrangler/

---

## Next Steps

1. ✅ Deploy the Worker
2. ✅ Test the webhook endpoint
3. ✅ Update n8n workflows with new URL
4. ✅ Monitor your dashboard
5. (Optional) Add custom domain
6. (Optional) Add authentication for security

# Render Backend Deployment

This project already includes a Render Blueprint at `render.yaml` for the FastAPI backend.

## 1. Push the repository to GitHub

Render deploys from a Git repository. Commit and push the current files first.

## 2. Create the Render service

Recommended path:

1. Open Render Dashboard.
2. Click **New +** -> **Blueprint**.
3. Connect this repository.
4. Select `render.yaml`.
5. Create the service.

The Blueprint uses:

```yaml
rootDir: backend
buildCommand: pip install -r requirements.txt
startCommand: uvicorn app.main:app --host 0.0.0.0 --port $PORT
healthCheckPath: /api/health
```

## 3. Set required environment variables

Render will ask for variables marked with `sync: false`.

Required:

```text
TMDB_API_KEY=your_tmdb_api_key
BACKEND_CORS_ORIGINS=https://dearonfox.github.io
```

Optional:

```text
TMDB_ACCESS_TOKEN=your_tmdb_access_token
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-mini
```

If your frontend is deployed somewhere else, add that URL to `BACKEND_CORS_ORIGINS`.
For multiple frontend URLs, separate them with commas:

```text
https://dearonfox.github.io,https://your-frontend.example.com
```

## 4. Verify deployment

After deploy finishes, open:

```text
https://YOUR_RENDER_SERVICE.onrender.com/api/health
```

Expected response:

```json
{
  "ok": true,
  "service": "Netflix Clone API",
  "environment": "production"
}
```

## 5. Connect the frontend

Set the frontend environment variable to the Render backend URL:

```text
REACT_APP_API_BASE_URL=https://YOUR_RENDER_SERVICE.onrender.com
```

Then rebuild and redeploy the frontend.

## Notes

- The current backend uses SQLite. On Render free web services, local files can disappear between deploys/restarts. This is fine for temporary movie notes, but use Render Postgres if you need persistent production data.
- Free web services can sleep after inactivity, so the first request after a while may be slow.

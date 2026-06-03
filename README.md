# Rita Client

Static React frontend for a WordPress-backed portfolio API.

## Requirements

- Node.js `>=22.8.0`
- A WordPress backend exposing the standard REST API at `/wp-json/wp/v2`.
- The Advanced Custom Fields (ACF) WordPress plugin, with the work field group set to show in the REST API.
- Works are read from standard WordPress posts:
  - `GET /wp-json/wp/v2/posts?per_page=100&_embed=1`
  - `GET /wp-json/wp/v2/posts?slug=:slug&_embed=1`
- About and Contact are read from standard WordPress pages:
  - `GET /wp-json/wp/v2/pages?slug=about&_embed=1`
  - `GET /wp-json/wp/v2/pages?slug=contact&_embed=1`
- Custom menu links are read from a WordPress page with slug `home`:
  - `GET /wp-json/wp/v2/pages?slug=home&_embed=1`

Production uses `https://ritaborralhosilva.com/wp-json/wp/v2` for WordPress REST requests.

## Local Development

1. Install dependencies.

   ```bash
   npm install
   ```

2. Create `.env` from the example.

   ```bash
   cp .env.example .env
   ```

3. Set the API and site URLs in `.env`.

   ```bash
   VITE_SERVER_API_URL="https://ritaborralhosilva.com/wp-json/wp/v2"
   SITE_URL="http://localhost:5173"
   ```

4. Start the dev server.

   ```bash
   npm run dev
   ```

## WordPress Hosting Build

1. Create the WordPress build env file.

   ```bash
   cp .env.wordpress.example .env.wordpress
   ```

2. Edit `.env.wordpress`.

   Root domain install:

   ```bash
   VITE_SERVER_API_URL="https://ritaborralhosilva.com/wp-json/wp/v2"
   SITE_URL="https://ritaborralhosilva.com"
   ```

   Subdirectory install, for example `https://example.com/portfolio/`:

   ```bash
   VITE_SERVER_API_URL="https://ritaborralhosilva.com/wp-json/wp/v2"
   VITE_BASE_PATH="/portfolio/"
   SITE_URL="https://ritaborralhosilva.com/portfolio"
   ```

3. Build the static site.

   ```bash
   npm run build:wordpress
   ```

4. Upload the contents of `dist/` to the target public directory on the WordPress host.

## WordPress Hosting Notes

- Upload the files inside `dist/`, not the `dist` folder itself, unless the site should live at `/dist/`.
- `public/.htaccess` is copied into `dist/.htaccess` during the build. It lets direct visits to React routes resolve to `index.html` while leaving `/wp-admin`, `/wp-content`, `/wp-includes`, and `/wp-json` to WordPress.
- If deploying to the WordPress document root, do not overwrite an existing WordPress `.htaccess` without a backup. Merge the React fallback rules above the WordPress block instead.
- WordPress REST requests use `VITE_SERVER_API_URL` when set. Production defaults to `https://ritaborralhosilva.com/wp-json/wp/v2`.
- If the frontend and WordPress are moved to different domains, set `VITE_SERVER_API_URL` to the absolute API URL and make sure the WordPress API allows CORS for the public frontend domain.
- Works are read from the standard WordPress REST collection `wp/v2/posts`.
- About and Contact are read from WordPress pages with slugs `about` and `contact`.
- Optional custom menu links are read from the content of the WordPress page with slug `home`. Use a normal WordPress List block and make each list item a link. Plain list items in the format `Title | https://example.com` are also supported.
- Work fields are mapped from standard WordPress fields plus optional `acf` or `meta` keys: `dimensions`, `technique`, `medium`, `year`, `media`, and `urls`.
- In WordPress, create or keep an ACF field group for posts with **Show in REST API** enabled. The portfolio expects `technique` as a text field and `year` as a number field. `medium` remains supported as a fallback for older data.
- Images are read from featured media via `_embed`, or from full WordPress-hosted URLs in custom media fields. Relative media paths resolve against `/wp-content/uploads` on the WordPress host.
- `VITE_BASE_PATH` is optional for root-domain installs. Set it only for subdirectory installs, for example `/portfolio/`.

## Sitemap

Set `SITE_URL` and `VITE_SERVER_API_URL`, then run:

```bash
npm run sitemap
```

The generated sitemap is written to `public/sitemap.xml` and will be included in the next build.

### Monthly Cron

Use the included wrapper to regenerate the deployed sitemap once per month.

1. Edit `deploy/cron/sitemap.cron.example` on the server and replace:

   ```text
   /home/USER/ritas-client
   /home/USER/public_html
   ```

   `APP_DIR` should point to this project. `PUBLIC_DIR` should point to the live static site directory where `sitemap.xml` is served.

2. Install the cron entry:

   ```bash
   crontab deploy/cron/sitemap.cron.example
   ```

The schedule runs at `03:15` on the first day of every month:

```cron
15 3 1 * *
```

The wrapper script loads `.env.wordpress` by default and writes directly to `$PUBLIC_DIR/sitemap.xml` by setting `SITEMAP_OUTPUT_PATH`.

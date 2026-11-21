# karlreid.ie

Karl Reid’s personal website. Static HTML, CSS and a small script for legacy hash links and the copyright year. No third-party runtime or build dependencies.

## Build and preview

Use Node 22 or newer:

```sh
npm ci
npm run build
python3 -m http.server 8080 --directory dist
```

Home is `/`; contact is `/contact/`. Old `/#/contact` bookmarks redirect in the browser. Assets use absolute paths so nested pages work.

## Production

Serve `dist/` with NGINX on ingram. Keep DNS registration, nameservers and email records unchanged. Deploy into a versioned release directory, validate the NGINX configuration, then switch the document-root symlink. Keep the preceding release for rollback. Do not install development tools or run the old Grunt/Bower/PhantomJS pipeline on the server.

## Content

Edit `app/index.html` and `app/contact/index.html`. Shared styling is in `app/styles/site.css`. No analytics or tracking cookies are included.

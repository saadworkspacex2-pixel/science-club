# Vercel ambiguous API route fix

Target: `saadworkspacex2-pixel/science-club`, branch `main` (the repo Vercel built at commit `c3765ec`). This is a **small overlay**, not a replacement for the whole repository.

## Apply

1. Extract this ZIP into the root of a local clone of `science-club`, allowing the included file to replace `src/app/api/files/[name]/route.ts`.
2. From the repository root, run:

   ```bash
   git rm 'src/app/api/admin/[resource]/route.ts' 'src/app/api/files/[id]/route.ts'
   git add 'src/app/api/files/[name]/route.ts'
   git commit -m "Resolve ambiguous API routes"
   git push origin main
   ```

3. Vercel should then build the new `main` commit.

The replacement `[name]` handler serves files by filename and keeps legacy numeric `site_files.id` URLs working, including base64 data-URI records. It allows the conflicting `[id]` route to be removed.

The current admin UI uses `[entity]`; the old `[resource]` handler is stale (it imports `getAdminSession`, which the current auth module does not export). It also contains legacy `/api/admin/settings` and `/api/admin/memberaccounts` behavior. The current UI does not call those endpoints. If another client still requires them, migrate that behavior to explicit static routes before removing `[resource]`.

After pushing, check the next Vercel log: this change addresses the route-pattern conflict, but a later build step could reveal a separate issue.

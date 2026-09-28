# Changesets

Create one changeset for every user-facing or operational change:

```bash
pnpm changeset
```

Select `patch`, `minor`, or `major` based on the impact. The release workflow opens a
version pull request on `main`; private template packages are versioned for changelog
history but are not published to a registry.

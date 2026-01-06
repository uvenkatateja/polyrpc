# Changesets

This folder is used by [Changesets](https://github.com/changesets/changesets) to manage versioning and changelogs.

## Adding a changeset

```bash
pnpm changeset
```

Follow the prompts to describe your changes.

## Releasing

```bash
pnpm version    # Update versions based on changesets
pnpm release    # Build and publish to npm
```

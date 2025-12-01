Gitmon is an open-source experiment that turns your commits and contributions into evolving monsters. Built with Next.js, GitHub API, and a bit of chaos.

## 🌐 https://gitmon.xyz/

If you’re into game design, systems, or balancing you can dive into how Gitmon is designed to work at https://www.gitmon.xyz/docs.

# 🧾 License & Usage

Gitmon’s source code is open and free to explore.
You can read it, fork it, learn from it, or build on top of it. Just **don’t** reuse the GitMonster characters, images, or names outside of this project.

All art, character designs, and names are © Gitmon.xyz — not for commercial or personal redistribution.

## Contributing

- **Report issues:** Open an issue for bugs or feature requests. Include steps to reproduce, expected vs actual behavior, environment (browser/node), and screenshots or logs when helpful.
- **Develop locally:** Fork the repo, clone your fork, then:

```bash
npm install
cp .env.example .env
# Fill `.env` values (see `.env.example`)
npm run dev
```

- **Branch & PR:** Create a descriptive branch name like `feature/add-x` or `fix/typo-x`. Open a pull request against `main` with a short description, list of changes, and link to any related issue.
- **Code style & checks:** Follow existing TypeScript and formatting patterns. Run lint/format before opening a PR:

```bash
npm run lint
npm run format
```

- **Tests:** If you add behavior that can be unit-tested, include tests and instructions to run them (e.g. `npm test`).
- **Secrets & sensitive data:** Never commit secrets or `.env` files. Use `.env.example` for placeholders only.
- **Contact:** For ownership, sponsorship, or other non-standard contributions, contact the project owner via the repo or website.

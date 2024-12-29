<div align="center">

<img src="public/android-chrome-192x192.png" align="center" width="120px" height="120px">

<h3>Dikaios</h3>
<p>A comprehensive desktop suite of IP address management tools.<p>

[![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/yehezkieldio/dikaios/publish.yml?style=flat&logo=tauri&label=Build)](https://github.com/yehezkieldio/dikaios/actions)
[![GitHub Release Status](https://img.shields.io/github/v/release/yehezkieldio/dikaios?style=flat&logo=tauri&label=Release)](https://github.com/yehezkieldio/dikaios/releases)

</div>

---

**Dikaios** is a experimental project to build a comprehensive desktop suite of IP address management tools. It is designed to help network administrators manage their IP address space more effectively. It provides a simple and intuitive user interface for calculate ip address, subnet mask, broadcast address, and more.

In ancient Greek, δίκαιος (dikaios) is an adjective that means "just" or "righteous."

---

## Setup Project

### Prerequisites

-   [Bun](https://bun.sh/) >= 1.1.42 _or/and Node.js >= 23.5.0_
-   [Rust](https://www.rust-lang.org/) >= 1.85.0-nightly

Tauri requires various system dependencies to build the application. You can find the list of dependencies and its installation instructions in the [Tauri documentation](https://v2.tauri.app/start/prerequisites/#system-dependencies).

### Initial Setup

> This is a step by step how to build and run a local development environment. Just [R.T.F.M.](https://en.wikipedia.org/wiki/RTFM) if you know what you're doing.

- Make sure you have installed all the prerequisites.
- Clone the repository using [Git](https://git-scm.com/).

```bash
git clone https://github.com/yehezkieldio/dikaios
```

- Install dependencies using `bun install`.

### Running the Project

- Run the project using `bun run tauri dev`.
- The application will be opened in a new window.

### Building the Project

- Build the project for all targets using `bun run tauri build`.
  - To make AppImage bundling to work on Arch-based distributions, you need to append `NO_STRIP=1` to the start of the command.
  - For Windows, you can get a NSIS installer by appending `--bundles nsis` to the end of the command.
- The build executable will be located in the `src-tauri/target/release` and artifacts will be located in the `src-tauri/target/release/bundle` directory.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

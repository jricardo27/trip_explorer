# Contributing to Trip Explorer

First off, thank you for considering contributing to Trip Explorer! Your help is appreciated.

## How Can I Contribute?

### Reporting Bugs

If you find a bug, please report it by opening an issue on our [GitHub Issues page](https://github.com/jricardo27/online_trip_explorer/issues).

Please include:
- A clear and descriptive title.
- Steps to reproduce the bug.
- What you expected to happen.
- What actually happened.
- Your browser and operating system, if relevant.

### Suggesting Features

If you have an idea for a new feature or an enhancement to an existing one, please open an issue on our [GitHub Issues page](https://github.com/jricardo27/online_trip_explorer/issues).

Please include:
- A clear and descriptive title.
- A detailed description of the proposed feature and its benefits.
- Any potential drawbacks or considerations.

### Code Contributions

If you'd like to contribute code, please follow these steps:

#### Setting up the Development Environment

1.  **Prerequisites:**
    *   Node.js (LTS version recommended, e.g., v18.x or v20.x)
    *   npm (comes with Node.js)
2.  **Fork the repository** on GitHub.
3.  **Clone your fork** locally:
    ```bash
    git clone https://github.com/YOUR_USERNAME/online_trip_explorer.git
    cd online_trip_explorer
    ```
4.  **Install dependencies:**
    ```bash
    npm install
    ```
5.  **Run the development server:**
    ```bash
    npm run dev
    ```
    This will start the Vite development server, typically at `http://localhost:5173`.

#### Coding Standards

*   **Language:** The project uses TypeScript. Please follow TypeScript best practices.
*   **Linting:** We use ESLint for linting. Configuration is in `eslint.config.js`. Please ensure your code adheres to the linting rules. You can run the linter with `npm run lint`.
*   **Formatting:** Consistent code formatting is important. ESLint (potentially with Prettier plugins, or ESLint's own formatting rules) helps maintain this. Consider configuring your editor to format on save based on the project's ESLint setup.

#### Pull Request Process

1.  **Create a new branch** for your feature or bugfix:
    ```bash
    git checkout -b feature/your-feature-name
    ```
    or
    ```bash
    git checkout -b fix/your-bugfix-name
    ```
2.  **Make your changes.**
3.  **Test your changes:**
    *   Run unit tests: `npm run test`
    *   Ensure the application builds: `npm run build`
    *   Manually test your changes in the browser.
4.  **Commit your changes** with a clear and descriptive commit message. Follow conventional commit message formats if possible (e.g., `feat: Add new feature X`, `fix: Resolve bug Y`).
5.  **Push your branch** to your fork:
    ```bash
    git push origin feature/your-feature-name
    ```
6.  **Open a Pull Request (PR)** from your fork's branch to the `main` branch of the `jricardo27/online_trip_explorer` repository.
7.  Provide a clear description of your PR, including what changes you've made and why. Link to any relevant issues.
8.  Your PR will be reviewed, and feedback may be provided. Please address any feedback promptly.

Thank you for your contribution!

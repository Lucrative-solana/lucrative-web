
# Lucrative Web

Frontend for the Lucrative decentralized application (dApp) built using Next.js and React. This UI layer connects to the backend services and Solana blockchain, enabling interactive features through a modern and responsive dashboard.

---

## 📚 Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Usage](#usage)
- [Scripts](#scripts)
- [Dependencies](#dependencies)
- [License](#license)

---

## 🚀 Introduction

Lucrative Web is a Next.js 15 project using React 19 and Tailwind CSS. It provides the user interface for interacting with Solana blockchain functionalities, such as token management, wallet connections, and visual dashboards using chart.js.

---

## ✨ Features

- Next.js 15 with App Router
- React 19
- Tailwind CSS for modern UI
- Solana wallet adapter integration (via browser extension)
- Chart visualizations with Chart.js and React-ChartJS-2
- Dashboard for monitoring or interacting with blockchain data
- React Router DOM for enhanced navigation

---

## 🧩 Project Structure

```
lucrative-web/
│
├── public/              # Static assets
├── src/                 # Source code and components
├── .gitignore
├── package.json
├── next.config.ts       # Next.js configuration
├── tsconfig.json        # TypeScript configuration
├── tailwind.config.js   # Tailwind configuration (via postcss)
```

---

## 🛠 Installation

```bash
# Clone the repository
git clone <repo-url>
cd lucrative-web

# Install dependencies
npm install
```

---

## 🧪 Usage

To start the development server:

```bash
npm run dev
```

Then visit [http://localhost:3000](http://localhost:3000) in your browser.

Use the Chrome Solana wallet extension (e.g., Phantom) for testing blockchain interactions.

---

## ⚙️ Scripts

| Command        | Description                 |
|----------------|-----------------------------|
| `dev`          | Run development server      |
| `build`        | Create production build     |
| `start`        | Run production server       |
| `lint`         | Run ESLint checks           |

---

## 📦 Dependencies

- **Framework**: `next`, `react`, `react-dom`
- **Solana Wallets**: `@solana/wallet-adapter-*`, `@solana/web3.js`
- **Charts**: `chart.js`, `react-chartjs-2`
- **Routing**: `react-router-dom`
- **Crypto**: `tweetnacl`, `bs58`
- **Styling**: `tailwindcss`

---

## 🪪 License

UNLICENSED – This project is currently proprietary and not licensed for distribution.

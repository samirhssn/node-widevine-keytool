# Widevine Key Fetcher

A simple Node.js script to fetch **Widevine Content Keys (KID + KEY)** from the **Widevine CWIP Test Server**.  
Useful for **video encryption demos, testing with Shaka Packager, and DRM workflows**.

⚠️ **Note:** This is for **testing only** with Widevine-provided sample signer/keys. Do **not** use in production.

---

## ✨ Features
- Fetches Widevine **KID** (Key ID) and **Key** in HEX format
- Supports content ID input as **hex** or **plain text**
- Outputs optional **PSSH** if present
- Prints `--keys` flag format for use with [Shaka Packager](https://github.com/shaka-project/shaka-packager) or other DRM tools
- Pure Node.js (no extra dependencies for Node.js v18+)

---

## 📦 Prerequisites
- **Node.js 18+** (comes with global `fetch`)
- For Node <18, install [`node-fetch`](https://www.npmjs.com/package/node-fetch):
  ```bash
  npm install node-fetch

// fetch_wv_key.js
// Fetch a Widevine (CWIP) key/KID using "widevine_test" credentials,
// then print them as lowercase HEX for Shaka Packager raw-key use.
//
// Usage:
//   node fetch_wv_key.js --content-id-hex 7465737420636f6e74656e74206964
//   node fetch_wv_key.js --content-id-text "test content id"
//
// Requires Node 18+ (global fetch). No extra deps.
const crypto = require("crypto");

// ---- CONFIG: Widevine CWIP (test) ----
const KEY_SERVER_URL = "https://license.uat.widevine.com/cenc/getcontentkey/widevine_test";
const SIGNER = "widevine_test";
const AES_SIGNING_KEY = "1ae8ccd0e7985cc0b6203a55855a1034afc252980e970ca90e5202689f947ab9"; // hex
const AES_SIGNING_IV = "d58ce954203b7c9a9a9d467f59839249";                                   // hex

// ---- Parse CLI args ----
const args = process.argv.slice(2);
let contentIdBase64 = null;

function hexToBase64(hex) {
    return Buffer.from(hex.replace(/\s+/g, ""), "hex").toString("base64");
}
function textToBase64(txt) {
    return Buffer.from(txt, "utf8").toString("base64");
}

for (let i = 0; i < args.length; i++) {
    if (args[i] === "--content-id-hex" && args[i + 1]) {
        contentIdBase64 = hexToBase64(args[i + 1]); i++;
    } else if (args[i] === "--content-id-text" && args[i + 1]) {
        contentIdBase64 = textToBase64(args[i + 1]); i++;
    }
}

if (!contentIdBase64) {
    console.error("Usage: node fetch_wv_key.js --content-id-hex <HEX>  OR  --content-id-text \"<TEXT>\"");
    process.exit(1);
}

const requestObj = {
    content_id: contentIdBase64,
    drm_types: ["WIDEVINE"],
    tracks: [{ type: "AUDIO" }, { type: "SD" }, { type: "HD" }],
    policy: ""
};
const requestText = JSON.stringify(requestObj);

const sha1 = crypto.createHash("sha1").update(requestText).digest();
const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(AES_SIGNING_KEY, "hex"), Buffer.from(AES_SIGNING_IV, "hex"));
const signatureB64 = Buffer.concat([cipher.update(sha1), cipher.final()]).toString("base64");

// ---- Envelope ----
const envelope = {
    request: Buffer.from(requestText, "utf8").toString("base64"),
    signature: signatureB64,
    signer: SIGNER
};

// ---- POST to CWIP ----
(async () => {
    const res = await fetch(KEY_SERVER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(envelope)
    });

    if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(`CWIP HTTP ${res.status}: ${t}`);
    }

    const outer = await res.json();
    const inner = JSON.parse(Buffer.from(outer.response, "base64").toString("utf8"));

    let track = inner.tracks?.find(t => t.type === "HD") || inner.tracks?.[0];
    if (!track || !track.key_id || !track.key) throw new Error("No track/key found in CWIP response.");

    const kidHex = Buffer.from(track.key_id, "base64").toString("hex").toLowerCase();
    const keyHex = Buffer.from(track.key, "base64").toString("hex").toLowerCase();

    const psshB64 = track.pssh?.[0]?.data || null;

    console.log("KID_HEX=", kidHex);
    console.log("KEY_HEX=", keyHex);
    if (psshB64) console.log("PSSH_B64=", psshB64);

    console.log("\n--keys key_id=%s:key=%s:iv=%s", kidHex, keyHex, kidHex);
})().catch(e => {
    console.error("ERROR:", e.message || e);
    process.exit(2);
});

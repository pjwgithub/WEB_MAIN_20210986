const encoder = new TextEncoder();
const decoder = new TextDecoder();

async function generateKey() {
    const rawKey = "key".padEnd(32, " ");
    return await crypto.subtle.importKey(
        "raw",
        encoder.encode(rawKey),
        { name: "AES-GCM" },
        false,
        ["encrypt", "decrypt"]
    );
}

// 암호화 함수 (AES-GCM)
export async function encrypt_text_gcm(password) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await generateKey();

    const encrypted = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        encoder.encode(password)
    );

    const encryptedBytes = new Uint8Array(encrypted);
    const combined = new Uint8Array(iv.length + encryptedBytes.length);
    combined.set(iv);
    combined.set(encryptedBytes, iv.length);

    return btoa(String.fromCharCode(...combined));
}

// 복호화 함수 (AES-GCM)
export async function decrypt_text_gcm() {
    const encryptedBase64 = sessionStorage.getItem("Session_Storage_pass2");
    if (!encryptedBase64) {
        console.warn("Session_Storage_pass2 값이 없습니다.");
        return;
    }

    const combined = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);
    const key = await generateKey();

    try {
        const decrypted = await crypto.subtle.decrypt(
            { name: "AES-GCM", iv },
            key,
            data
        );
        console.log("(GCM) 복호화된 값:", decoder.decode(decrypted));
    } catch (e) {
        console.error("복호화 실패:", e);
    }
}
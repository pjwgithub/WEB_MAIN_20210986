function encodeByAES256(key, data){
    const cipher = CryptoJS.AES.encrypt(data, CryptoJS.enc.Utf8.parse(key), {
        iv: CryptoJS.enc.Utf8.parse(""),
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC
    });
    return cipher.toString();
}

function decodeByAES256(key, data){
    const cipher = CryptoJS.AES.decrypt(data, CryptoJS.enc.Utf8.parse(key), {
        iv: CryptoJS.enc.Utf8.parse(""),
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC
    });
    return cipher.toString(CryptoJS.enc.Utf8);
}

function encrypt_text_cbc(password){
    const k = "key";
    const rk = k.padEnd(32, " ");
    return encodeByAES256(rk, password);
}

function decrypt_text_cbc(){
    const k = "key";
    const rk = k.padEnd(32, " ");
    const eb = sessionStorage.getItem("Session_Storage_pass");
    if (!eb) {
        console.warn("Session_Storage_pass 값이 없습니다.");
        return;
    }
    const decrypted = decodeByAES256(rk, eb);
    console.log("(CBC) 복호화된 값:", decrypted);
} 
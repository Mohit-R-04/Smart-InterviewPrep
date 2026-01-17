import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const KEY_FILE = path.join(process.cwd(), 'admin/secret.key');
const INPUT_FILE = path.join(process.cwd(), 'src/data/problems.json');
const OUTPUT_FILE = path.join(process.cwd(), 'public/problems.lock');

function encrypt() {
    if (!fs.existsSync(KEY_FILE)) {
        console.error("❌ Key file missing. Run 'node scripts/generate_key.js' first.");
        process.exit(1);
    }

    if (!fs.existsSync(INPUT_FILE)) {
        console.error("❌ Problems file missing.");
        process.exit(1);
    }

    const key = fs.readFileSync(KEY_FILE); // 32 bytes
    const text = fs.readFileSync(INPUT_FILE, 'utf8'); // JSON string

    // Generate random IV
    const iv = crypto.randomBytes(12); // 96-bit IV for GCM

    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

    let encrypted = cipher.update(text, 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    const authTag = cipher.getAuthTag(); // 16 bytes

    // Format: [IV (12)][AuthTag (16)][EncryptedData]
    // This allows easy extraction in the browser
    const output = Buffer.concat([iv, authTag, encrypted]);

    fs.writeFileSync(OUTPUT_FILE, output);
    console.log(`🔒 Encrypted data written to ${OUTPUT_FILE}`);
    console.log(`   Size: ${(output.length / 1024).toFixed(2)} KB`);
}

encrypt();

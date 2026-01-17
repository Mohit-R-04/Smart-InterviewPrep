import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const KEY_FILE = path.join(process.cwd(), 'admin/secret.key');

function generateKey() {
    if (fs.existsSync(KEY_FILE)) {
        console.log(`🔑 Key already exists at ${KEY_FILE}`);
        return;
    }

    // Generate 256-bit key (32 bytes)
    const key = crypto.randomBytes(32);
    fs.writeFileSync(KEY_FILE, key);
    console.log(`✅ Generated new secret key at ${KEY_FILE}`);
    console.log(`⚠️  KEEP THIS FILE SAFE. DO NOT COMMIT IT.`);
}

generateKey();

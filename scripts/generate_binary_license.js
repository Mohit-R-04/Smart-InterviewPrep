import { webcrypto } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Constants
const KEY_FILE_PATH = path.join(__dirname, '../admin/secret.key');
const LICENSE_FILE_PATH = path.join(__dirname, '../admin/smart-interview.license');
const HASH_FILE_PATH = path.join(__dirname, '../src/constants/licenseHash.js');

async function generateLicense() {
    console.log('🔒 Generating Secure License Key...');

    // 1. Read the Secret Key
    try {
        await fs.access(KEY_FILE_PATH);
    } catch {
        console.error("❌ Key file missing. Run 'node scripts/generate_key.js' first.");
        process.exit(1);
    }

    const keyBuffer = await fs.readFile(KEY_FILE_PATH);

    // 2. Write the License File (It IS the key)
    await fs.mkdir(path.dirname(LICENSE_FILE_PATH), { recursive: true });
    await fs.writeFile(LICENSE_FILE_PATH, keyBuffer);
    console.log(`✅ License file created at: ${LICENSE_FILE_PATH}`);

    // 3. Calculate SHA-256 Hash of the Key
    // This allows the frontend to verify "Is this file the correct key?" without knowing the key itself beforehand.
    const hashBuffer = await webcrypto.subtle.digest('SHA-256', keyBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // 4. Update the App's validation logic
    const hashFileContent = `export const LICENSE_HASH = "${hashHex}";
export const LICENSE_SIZE = ${keyBuffer.length}; // Should be 32
`;

    await fs.mkdir(path.dirname(HASH_FILE_PATH), { recursive: true });
    await fs.writeFile(HASH_FILE_PATH, hashFileContent);
    console.log(`✅ Application validation hash updated at: ${HASH_FILE_PATH}`);
    console.log(`🔑 Key Hash: ${hashHex}`);
}

generateLicense().catch(console.error);

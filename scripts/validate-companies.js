#!/usr/bin/env node

/**
 * Company Name Validator
 * 
 * This script validates that all company names in the wizard presets
 * match the actual company names in the problems data.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the companies list
const companiesPath = path.join(__dirname, '../public/companies-list.json');
const companies = JSON.parse(fs.readFileSync(companiesPath, 'utf8'));

// Extract all valid company names
const validCompanyNames = new Set(companies.map(c => c.name));

console.log('📊 Total companies in data:', validCompanyNames.size);
console.log('\n🔍 Checking wizard presets...\n');

// Wizard presets (from Wizard.jsx)
const wizardPresets = ['Google', 'Facebook', 'Amazon', 'Microsoft', 'Apple', 'Netflix', 'Uber', 'Airbnb'];

let allValid = true;

wizardPresets.forEach(company => {
    if (validCompanyNames.has(company)) {
        console.log(`✅ ${company} - Valid`);
    } else {
        console.log(`❌ ${company} - NOT FOUND in data`);
        allValid = false;

        // Try to find similar names
        const similar = Array.from(validCompanyNames).filter(name =>
            name.toLowerCase().includes(company.toLowerCase()) ||
            company.toLowerCase().includes(name.toLowerCase())
        );
        if (similar.length > 0) {
            console.log(`   💡 Did you mean: ${similar.join(', ')}?`);
        }
    }
});

console.log('\n' + '='.repeat(50));
if (allValid) {
    console.log('✅ All wizard presets are valid!');
} else {
    console.log('⚠️  Some wizard presets need to be updated.');
}
console.log('='.repeat(50));

// Show top 20 companies by problem count
console.log('\n📈 Top 20 Companies by Problem Count:\n');
companies.slice(0, 20).forEach((company, index) => {
    console.log(`${(index + 1).toString().padStart(2, ' ')}. ${company.name.padEnd(25, ' ')} - ${company.count} problems`);
});

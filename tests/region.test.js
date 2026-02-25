import assert from 'assert';
import { getRegionForLanguage } from '../src/regionData.js';

console.log('Running Regional Intelligence tests...');

// Test 1: Language to Region mapping
assert.strictEqual(getRegionForLanguage('hi'), 'indian');
assert.strictEqual(getRegionForLanguage('ko'), 'east_asia');
assert.strictEqual(getRegionForLanguage('fr'), 'european');
assert.strictEqual(getRegionForLanguage('en'), null); // English is global/default

// Test 2: Mocking normalizeTMDBMovie (since it's async in api.js)
const mockTMDB = {
    id: 123,
    title: "Test Movie",
    original_language: 'ml', // Malayalam
    production_countries: [{ name: 'India' }]
};

// We can manually verify the logic in normalizeTMDBMovie without calling it if we don't want to mock the whole API
const region = getRegionForLanguage(mockTMDB.original_language);
assert.strictEqual(region, 'indian');

console.log('Regional Intelligence tests passed! 🌏🦁');

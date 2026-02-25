/**
 * Cinemaholic Visual Regression Smoke Test
 * 
 * This script checks for critical design tokens and element visibility 
 * ensuring the 'Cinemaholic' theme is correctly applied.
 */

const checkTheme = () => {
    console.log("🎬 Starting Cinemaholic Visual Smoke Test...");

    const errors = [];

    // 1. Check for CSS variables
    const styles = getComputedStyle(document.documentElement);
    const gold = styles.getPropertyValue('--cin-accent-2').trim();
    if (gold !== '#E6B91E') errors.push("CRITICAL: --cin-accent-2 is incorrect or missing.");

    // 2. Check for Typography
    const font = styles.getPropertyValue('font-family');
    // Note: This might represent the resolved font, we check if it includes 'Inter' or 'Playfair'
    const body = document.body;
    const bodyFont = getComputedStyle(body).fontFamily;
    if (!bodyFont.includes("Inter")) errors.push("WARNING: Body font 'Inter' may not be loaded.");

    // 3. Check for Hero Visibility
    const hero = document.querySelector('.hero-section');
    if (!hero || getComputedStyle(hero).display === 'none') errors.push("CRITICAL: Hero section is hidden.");

    // 4. Check for Film Grain
    const grain = document.querySelector('.film-grain');
    if (!grain) errors.push("WARNING: Film grain overlay is missing.");

    if (errors.length === 0) {
        console.log("✅ PASS: Cinemaholic theme looks premium and correctly applied.");
    } else {
        console.error("❌ FAIL: Visual regressions detected:");
        errors.forEach(err => console.error(`  - ${err}`));
    }
};

// In a real browser environment, we'd run this. In a script, we export it.
if (typeof window !== 'undefined') {
    window.addEventListener('load', checkTheme);
} else {
    // Basic node check for tokens in vars.css
    const fs = require('fs');
    try {
        const vars = fs.readFileSync('styles/vars.css', 'utf8');
        if (vars.includes('--cin-bg-900: #050508;')) {
            console.log("✅ PASS: Critical tokens found in styles/vars.css");
        } else {
            console.error("❌ FAIL: Stylesheet is missing critical tokens.");
        }
    } catch (e) {
        console.error("❌ FAIL: Could not read styles/vars.css");
    }
}

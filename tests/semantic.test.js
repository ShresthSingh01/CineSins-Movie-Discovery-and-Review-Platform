import { parseQueryToFilters } from '../src/semanticSearch.js';

console.log("Running Semantic Search Parser Tests...");

async function test() {
    // Case 1: Light and funny under 90
    const query1 = "Something light and funny under 90 minutes";
    const res1 = await parseQueryToFilters(query1);
    console.log(`Query: "${query1}" =>`, res1);

    if (res1.minComfort >= 0.6 && res1.maxRuntime <= 90) {
        console.log("✅ Case 1 passed!");
    } else {
        console.error("❌ Case 1 failed result:", res1);
        process.exit(1);
    }

    // Case 2: Dark, slow, thought-provoking sci-fi
    const query2 = "Dark, slow, thought-provoking sci-fi";
    const res2 = await parseQueryToFilters(query2);
    console.log(`Query: "${query2}" =>`, res2);

    if (res2.minCognitive >= 0.7 && res2.preferGenres.includes("Sci-Fi")) {
        console.log("✅ Case 2 passed!");
    } else {
        console.error("❌ Case 2 failed result:", res2);
        process.exit(1);
    }

    // Case 3: Negation rules
    const query3 = "Something not too violent";
    const res3 = await parseQueryToFilters(query3);
    console.log(`Query: "${query3}" =>`, res3);

    if (res3.minComfort >= 0.6) {
        console.log("✅ Case 3 passed (Negation handled)!");
    } else {
        console.error("❌ Case 3 failed result:", res3);
        process.exit(1);
    }

    console.log("All Semantic Search tests passed! 🧠✨");
}

test().catch(err => {
    console.error("Test execution error:", err);
    process.exit(1);
});

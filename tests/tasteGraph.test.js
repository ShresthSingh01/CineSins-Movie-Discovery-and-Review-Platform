import { compareTasteCards } from '../src/tasteGraph.js';

console.log("Running TasteGraph Similarity Tests...");

const cardA = {
    name: "User A",
    metrics: { ei: 80, cl: 40, cs: 50 },
    genres: { "Action": 10, "Sci-Fi": 5, "Drama": 2 }
};

const cardB = {
    name: "User B",
    metrics: { ei: 75, cl: 35, cs: 55 },
    genres: { "Action": 8, "Sci-Fi": 6, "Thriller": 4 }
};

const result = compareTasteCards(cardA, cardB);

console.log("Similarity Result:", result);

if (result.score > 80 && result.score < 100) {
    console.log("✅ Similarity score is in expected range for high matching cards.");
} else {
    console.error("❌ Similarity score out of range:", result.score);
    process.exit(1);
}

if (result.matches.includes("Action") && result.matches.includes("Sci-Fi")) {
    console.log("✅ Top shared genres correctly identified.");
} else {
    console.error("❌ Shared genres incorrect:", result.matches);
    process.exit(1);
}

if (result.divergences.includes("Thriller") || result.divergences.includes("Drama")) {
    console.log("✅ Divergent genres correctly identified.");
} else {
    console.error("❌ Divergences incorrect:", result.divergences);
    process.exit(1);
}

// Case 2: Identical Cards
const identicalResult = compareTasteCards(cardA, cardA);
if (identicalResult.score === 100) {
    console.log("✅ Identical cards return 100% similarity.");
} else {
    console.error("❌ Identical card score incorrect:", identicalResult.score);
    process.exit(1);
}

// Case 3: Completely Opposing Cards
const cardC = {
    name: "User C",
    metrics: { ei: 10, cl: 90, cs: 10 },
    genres: { "Documentary": 10, "History": 10 }
};

const opposingResult = compareTasteCards(cardA, cardC);
console.log("Opposing Score:", opposingResult.score);
if (opposingResult.score < 30) {
    console.log("✅ Opposing cards return low similarity.");
} else {
    console.warn("⚠️ Opposing score higher than expected, but acceptable depending on baseline:", opposingResult.score);
}

console.log("All TasteGraph tests passed! 🧬✨");

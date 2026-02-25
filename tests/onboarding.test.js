import { computeArchetype } from '../src/archetype.js';

console.log("Running Onboarding Personality Tests...");

// Simulation of "Intellectual Explorer" pattern
// Answers: Realism, Slow Depth, No feels, Puzzles, Subtext
const explorerAnswers = [
    { cognitiveLoad: 70, comfortScore: 30 },
    { cognitiveLoad: 80 },
    { comfortScore: 80 },
    { cognitiveLoad: 90 },
    { cognitiveLoad: 85 }
];

const finalMetricsExplorer = { emotionalIntensity: 0, cognitiveLoad: 0, comfortScore: 0 };
explorerAnswers.forEach(a => {
    if (a.emotionalIntensity) finalMetricsExplorer.emotionalIntensity += a.emotionalIntensity;
    if (a.cognitiveLoad) finalMetricsExplorer.cognitiveLoad += a.cognitiveLoad;
    if (a.comfortScore) finalMetricsExplorer.comfortScore += a.comfortScore;
});

const explorerProfile = {
    totalMoviesSaved: 5,
    avgEmotional: Math.round(finalMetricsExplorer.emotionalIntensity / 2),
    avgCognitive: Math.round(finalMetricsExplorer.cognitiveLoad / 2),
    avgComfort: Math.round(finalMetricsExplorer.comfortScore / 2),
    genreCounts: {}
};

const res1 = computeArchetype(explorerProfile);
console.log("Explorer Profile Result:", res1.label);

if (res1.id === 'intellectual_explorer') {
    console.log("✅ Explorer identification passed!");
} else {
    console.error("❌ Explorer identification failed:", res1.id);
    process.exit(1);
}

// Simulation of "Comfort Watcher" pattern
const comfortAnswers = [
    { comfortScore: 70, cognitiveLoad: 40 },
    { comfortScore: 60, emotionalIntensity: 60 },
    { comfortScore: 80 },
    { comfortScore: 75 },
    { emotionalIntensity: 75, comfortScore: 50 }
];

const finalMetricsComfort = { emotionalIntensity: 0, cognitiveLoad: 0, comfortScore: 0 };
comfortAnswers.forEach(a => {
    if (a.emotionalIntensity) finalMetricsComfort.emotionalIntensity += a.emotionalIntensity;
    if (a.cognitiveLoad) finalMetricsComfort.cognitiveLoad += a.cognitiveLoad;
    if (a.comfortScore) finalMetricsComfort.comfortScore += a.comfortScore;
});

const comfortProfile = {
    totalMoviesSaved: 5,
    avgEmotional: Math.round(finalMetricsComfort.emotionalIntensity / 2),
    avgCognitive: Math.round(finalMetricsComfort.cognitiveLoad / 2),
    avgComfort: Math.round(finalMetricsComfort.comfortScore / 2),
    genreCounts: {}
};

const res2 = computeArchetype(comfortProfile);
console.log("Comfort Profile Result:", res2.label);

if (res2.id === 'comfort_watcher') {
    console.log("✅ Comfort identification passed!");
} else {
    console.error("❌ Comfort identification failed:", res2.id);
    process.exit(1);
}

console.log("All Onboarding tests passed! 🎯🧬");

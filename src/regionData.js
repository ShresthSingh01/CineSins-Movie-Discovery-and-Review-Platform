/**
 * Region Data & Cultural Mappings
 */

export const REGIONS = {
    'indian': {
        label: 'Indian Cinema',
        languages: ['hi', 'te', 'ta', 'ml', 'kn', 'bn'],
        primaryMoods: ['Emotional', 'Exciting', 'Comfort'],
        blurb: 'From the grand spectacles of Bollywood to the grounded masterpieces of Malayalam cinema, Indian films offer unparalleled emotional depth and vibrant storytelling.',
        subRegions: ['Hindi', 'Telugu', 'Tamil', 'Malayalam']
    },
    'east_asia': {
        label: 'East Asian',
        languages: ['ko', 'ja', 'zh'],
        primaryMoods: ['Thoughtful', 'Exciting', 'Vibing'],
        blurb: 'Experience the precision of Japanese animation, the visceral thrill of South Korean cinema, and the visual poetry of Chinese wuxia.',
        subRegions: ['South Korean', 'Japanese', 'Chinese']
    },
    'european': {
        label: 'European Arthouse',
        languages: ['fr', 'de', 'it', 'es', 'sv', 'da'],
        primaryMoods: ['Thoughtful', 'Good', 'Vibing'],
        blurb: 'Deeply philosophical and stylistically innovative, European cinema remains the heart of global arthouse and experimental storytelling.',
        subRegions: ['French', 'German', 'Italian', 'Spanish', 'Nordic']
    }
};

export const REGION_SAMPLES = [
    // Indian
    { title: "RRR", region: "indian", language: "te", id: "tt11032374" },
    { title: "Manjummel Boys", region: "indian", language: "ml", id: "tt27050308" },
    { title: "Lagaan", region: "indian", language: "hi", id: "tt0273812" },
    { title: "Jai Bhim", region: "indian", language: "ta", id: "tt15097216" },
    { title: "Drishyam", region: "indian", language: "ml", id: "tt3417482" },

    // East Asia
    { title: "Parasite", region: "east_asia", language: "ko", id: "tt6751668" },
    { title: "Spirited Away", region: "east_asia", language: "ja", id: "tt0245429" },
    { title: "Oldboy", region: "east_asia", language: "ko", id: "tt0364569" },
    { title: "In the Mood for Love", region: "east_asia", language: "zh", id: "tt0208092" },
    { title: "Seven Samurai", region: "east_asia", language: "ja", id: "tt0047478" },

    // European
    { title: "Amélie", region: "european", language: "fr", id: "tt0211915" },
    { title: "The Lives of Others", region: "european", language: "de", id: "tt0405094" },
    { title: "Pan's Labyrinth", region: "european", language: "es", id: "tt0457430" },
    { title: "Bicycle Thieves", region: "european", language: "it", id: "tt0040843" },
    { title: "The Seventh Seal", region: "european", language: "sv", id: "tt0050825" }
];

export function getRegionForLanguage(lang) {
    if (!lang) return null;
    const l = lang.toLowerCase();
    for (const [key, region] of Object.entries(REGIONS)) {
        if (region.languages.includes(l)) return key;
    }
    return null;
}

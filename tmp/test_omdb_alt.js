const https = require('https');

const OMDB_API_KEY = "thewdb";
const query = "Batman";

const url = `https://www.omdbapi.com/?s=${encodeURIComponent(query)}&apikey=${OMDB_API_KEY}`;

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        try {
            console.log("Response:", JSON.stringify(JSON.parse(data), null, 2));
        } catch (e) {
            console.log("Response Data:", data);
        }
    });
}).on('error', (err) => {
    console.error("Error:", err.message);
});

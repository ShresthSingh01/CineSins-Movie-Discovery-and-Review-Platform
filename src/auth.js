import { api } from '../api.js';

const BASE_URL = 'http://localhost:5000/api';
const originalGetItem = Storage.prototype.getItem;
const originalSetItem = Storage.prototype.setItem;
const originalRemoveItem = Storage.prototype.removeItem;

const PREFIX_EXCEPTIONS = ['cinesins_profiles', 'cinesins_active_profile', 'cinesins_token'];

function getActiveProfile() {
    return originalGetItem.call(window.localStorage, 'cinesins_active_profile') || null;
}

Storage.prototype.getItem = function (key) {
    if (PREFIX_EXCEPTIONS.includes(key)) return originalGetItem.call(this, key);
    const prefix = getActiveProfile();
    return prefix ? originalGetItem.call(this, `${prefix}_${key}`) : originalGetItem.call(this, key);
};

Storage.prototype.setItem = function (key, value) {
    if (PREFIX_EXCEPTIONS.includes(key)) return originalSetItem.call(this, key, value);
    const prefix = getActiveProfile();
    return prefix ? originalSetItem.call(this, `${prefix}_${key}`, value) : originalSetItem.call(this, key, value);
};

Storage.prototype.removeItem = function (key) {
    if (PREFIX_EXCEPTIONS.includes(key)) return originalRemoveItem.call(this, key);
    const prefix = getActiveProfile();
    return prefix ? originalRemoveItem.call(this, `${prefix}_${key}`) : originalRemoveItem.call(this, key);
};

export const auth = {
    async login(email, password) {
        const res = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        if (!res.ok) throw new Error("Login failed");
        const data = await res.json();
        originalSetItem.call(window.localStorage, 'cinesins_token', data.token);
        await this.syncProfilesFromBackend();
        return true;
    },

    async register(email, password) {
        const res = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        if (!res.ok) throw new Error("Registration failed");
        return this.login(email, password);
    },

    async syncProfilesFromBackend() {
        const token = originalGetItem.call(window.localStorage, 'cinesins_token');
        if (!token) return;
        const res = await fetch(`${BASE_URL}/profiles`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) {
            const profiles = await res.json();
            // Transform _id to strings for local usage
            const mapped = profiles.map(p => ({ ...p, id: p._id }));
            originalSetItem.call(window.localStorage, 'cinesins_profiles', JSON.stringify(mapped));
        }
    },

    async createProfile(name) {
        const token = originalGetItem.call(window.localStorage, 'cinesins_token');
        if (!token) return null;

        const res = await fetch(`${BASE_URL}/profiles`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ name })
        });
        if (res.ok) {
            await this.syncProfilesFromBackend();
            const profiles = this.getProfiles();
            return profiles[profiles.length - 1]; // return newest
        }
        return null;
    },

    getProfiles() {
        return JSON.parse(originalGetItem.call(window.localStorage, 'cinesins_profiles')) || [];
    },

    getGlobalReviews(movieId) {
        // Shared anonymous reviews for demo purposes
        // In a real app, this would fetch from a global database endpoint
        return [
            { text: "Absolutely stunning visuals! A must watch.", rating: 5, profileColor: "#8b5cf6" },
            { text: "A bit slow in the middle, but the ending makes up for it.", rating: 4, profileColor: "#db2777" },
            { text: "Overrated. The book was much better.", rating: 2, profileColor: "#eab308" }
        ];
    },

    async switchProfile(id) {
        originalSetItem.call(window.localStorage, 'cinesins_active_profile', id);

        // Sync reviews and watchlist down from server to local storage for synchronous UI access
        const token = originalGetItem.call(window.localStorage, 'cinesins_token');
        if (token && id) {
            try {
                // Fetch Watchlist
                const wlRes = await fetch(`${BASE_URL}/actions/${id}/watchlist`, { headers: { 'Authorization': `Bearer ${token}` } });
                if (wlRes.ok) {
                    const wlData = await wlRes.json();
                    const formattedWl = wlData.map(d => ({ ...d.movieId, id: d.movieId._id })); // Map populated backend docs
                    originalSetItem.call(window.localStorage, `${id}_watchlist`, JSON.stringify(formattedWl));
                }

                // Fetch Reviews
                const revRes = await fetch(`${BASE_URL}/actions/${id}/reviews`, { headers: { 'Authorization': `Bearer ${token}` } });
                if (revRes.ok) {
                    const revData = await revRes.json();
                    const formattedRev = revData.map(d => ({
                        id: d.movieId._id || d.movieId,
                        rating: d.rating,
                        text: d.reviewText,
                        title: d.movieId.title,
                        poster: d.movieId.poster,
                        date: d.createdAt
                    }));
                    originalSetItem.call(window.localStorage, `${id}_reviews`, JSON.stringify(formattedRev));
                }
            } catch (e) { console.error("Sync failed", e) }
        }

        window.location.reload();
    },

    logout() {
        originalRemoveItem.call(window.localStorage, 'cinesins_active_profile');
        originalRemoveItem.call(window.localStorage, 'cinesins_token');
        window.location.reload();
    },

    // Simplified auth gate initialization for demo
    async init() {
        return new Promise((resolve) => {
            const token = originalGetItem.call(window.localStorage, 'cinesins_token');
            const active = getActiveProfile();
            const gate = document.getElementById('auth-gate');

            if (token && active) {
                if (gate) gate.style.display = 'none';
                // Add logout button
                const nav = document.getElementById('main-nav');
                if (nav) {
                    const ul = nav.querySelector('ul');
                    if (ul && !document.getElementById('nav-logout')) {
                        const li = document.createElement('li');
                        li.innerHTML = `<a href="#" id="nav-logout" style="color: #db2777;"><i class="fas fa-sign-out-alt"></i> Logout</a>`;
                        ul.appendChild(li);
                        document.getElementById('nav-logout').addEventListener('click', (e) => {
                            e.preventDefault();
                            this.logout();
                        });
                    }
                }
                resolve(true);
            } else {
                if (gate) {
                    gate.style.display = 'flex';
                    // We render a quick generic login/register prompt into the gate instead of the old profile switcher
                    gate.innerHTML = `
                        <div class="auth-container" style="background: rgba(0,0,0,0.8); padding: 30px; border-radius: 12px; border: 1px solid #333; width: 300px; text-align: center; margin: auto;">
                            <h2>Login or Register</h2>
                            <input type="email" id="auth-email" placeholder="Email" style="width: 100%; padding: 10px; margin: 10px 0; background: #111; color: #fff; border: 1px solid #444;" />
                            <input type="password" id="auth-pass" placeholder="Password" style="width: 100%; padding: 10px; margin: 10px 0; background: #111; color: #fff; border: 1px solid #444;" />
                            <button id="auth-login-btn" style="width: 100%; padding: 10px; background: #db2777; color: white; border: none; cursor: pointer; margin-top: 10px;">Login / Register</button>
                        </div>
                    `;

                    document.getElementById('auth-login-btn').onclick = async () => {
                        const em = document.getElementById('auth-email').value;
                        const pw = document.getElementById('auth-pass').value;
                        if (!em || !pw) return alert("Email and password required");
                        try {
                            try {
                                await this.login(em, pw);
                            } catch (e) { // If login fails, try register
                                await this.register(em, pw);
                            }
                            // Quick create profile if 0 profiles
                            const profs = this.getProfiles();
                            if (profs.length === 0) {
                                const newP = await this.createProfile(em.split('@')[0]);
                                await this.switchProfile(newP.id);
                            } else {
                                await this.switchProfile(profs[0].id);
                            }
                        } catch (err) {
                            alert("Auth Failed: " + err.message);
                        }
                    };
                }
                resolve(true);
            }
        });
    }
};

const originalGetItem = Storage.prototype.getItem;
const originalSetItem = Storage.prototype.setItem;
const originalRemoveItem = Storage.prototype.removeItem;
const originalClear = Storage.prototype.clear;

const PREFIX_EXCEPTIONS = ['cinesins_profiles', 'cinesins_active_profile'];

function getActiveProfile() {
    return originalGetItem.call(window.localStorage, 'cinesins_active_profile') || null;
}

// Override Storage methods
Storage.prototype.getItem = function (key) {
    if (PREFIX_EXCEPTIONS.includes(key)) {
        return originalGetItem.call(this, key);
    }
    const prefix = getActiveProfile();
    if (prefix) {
        return originalGetItem.call(this, `${prefix}_${key}`);
    }
    return originalGetItem.call(this, key);
};

Storage.prototype.setItem = function (key, value) {
    if (PREFIX_EXCEPTIONS.includes(key)) {
        return originalSetItem.call(this, key, value);
    }
    const prefix = getActiveProfile();
    if (prefix) {
        return originalSetItem.call(this, `${prefix}_${key}`, value);
    }
    return originalSetItem.call(this, key, value);
};

Storage.prototype.removeItem = function (key) {
    if (PREFIX_EXCEPTIONS.includes(key)) {
        return originalRemoveItem.call(this, key);
    }
    const prefix = getActiveProfile();
    if (prefix) {
        return originalRemoveItem.call(this, `${prefix}_${key}`);
    }
    return originalRemoveItem.call(this, key);
};

export const auth = {
    getProfiles() {
        return JSON.parse(originalGetItem.call(window.localStorage, 'cinesins_profiles')) || [];
    },

    saveProfiles(profiles) {
        originalSetItem.call(window.localStorage, 'cinesins_profiles', JSON.stringify(profiles));
    },

    createProfile(name) {
        const profiles = this.getProfiles();
        const id = 'prof_' + Date.now() + Math.floor(Math.random() * 1000);

        // Pick a random avatar color/emoji
        const emojis = ['🎭', '🎬', '🍿', '🎟️', '👽', '🧛'];
        const colors = ['#8b5cf6', '#db2777', '#10b981', '#f59e0b', '#3b82f6', '#ef4444'];

        const profile = {
            id,
            name,
            emoji: emojis[Math.floor(Math.random() * emojis.length)],
            color: colors[Math.floor(Math.random() * colors.length)]
        };

        profiles.push(profile);
        this.saveProfiles(profiles);
        return profile;
    },

    removeProfile(id) {
        // Remove from profile list
        const profiles = this.getProfiles().filter(p => p.id !== id);
        this.saveProfiles(profiles);

        // Cleanup all localStorage keys that belong to this profile
        const keysToRemove = [];
        for (let i = 0; i < window.localStorage.length; i++) {
            const key = window.localStorage.key(i);
            if (key && key.startsWith(`${id}_`)) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(k => {
            originalRemoveItem.call(window.localStorage, k);
        });
    },

    switchProfile(id) {
        originalSetItem.call(window.localStorage, 'cinesins_active_profile', id);
        // Reload page to re-initialize store and UI with new prefixed keys
        window.location.reload();
    },

    logout() {
        originalRemoveItem.call(window.localStorage, 'cinesins_active_profile');
        window.location.reload();
    },

    getGlobalReviews(movieId) {
        // Collect reviews from all profiles for a given movie
        const globalReviews = [];
        const profiles = this.getProfiles();
        const activeProfileId = getActiveProfile();

        profiles.forEach(p => {
            // Skip the current active user so they don't see their own review as anonymous
            if (p.id === activeProfileId) return;

            const rawReviews = originalGetItem.call(window.localStorage, `${p.id}_reviews`);
            if (rawReviews) {
                try {
                    const parsed = JSON.parse(rawReviews);
                    // Find if this profile reviewed this specific movie
                    const movieReview = parsed.find(r => String(r.id) === String(movieId));
                    if (movieReview && movieReview.text) {
                        // Push an anonymous version of the review
                        globalReviews.push({
                            text: movieReview.text,
                            rating: movieReview.rating,
                            date: movieReview.date || Date.now(),
                            profileColor: p.color // keep the color to distinguish users visually, but anonymize name
                        });
                    }
                } catch (e) { }
            }
        });

        // Return sorted by newest
        return globalReviews.sort((a, b) => new Date(b.date) - new Date(a.date));
    },

    init() {
        return new Promise((resolve) => {
            const active = getActiveProfile();
            const gate = document.getElementById('auth-gate');

            if (active) {
                // If logged in, hide the gate and allow app to load
                if (gate) gate.style.display = 'none';

                // Add logout button to header dynamically
                const nav = document.getElementById('main-nav');
                if (nav) {
                    const ul = nav.querySelector('ul');
                    if (ul) {
                        const li = document.createElement('li');
                        li.innerHTML = `<a href="#" id="nav-logout" style="color: #db2777;"><i class="fas fa-sign-out-alt"></i> Switch Profile</a>`;
                        ul.appendChild(li);

                        document.getElementById('nav-logout').addEventListener('click', (e) => {
                            e.preventDefault();
                            this.logout();
                        });
                    }
                }

                resolve(true);
            } else {
                // Not logged in: Show auth gate
                if (gate) {
                    gate.style.display = 'flex';
                    this.renderProfiles();

                    const createBtn = document.getElementById('create-profile-btn');
                    const input = document.getElementById('new-profile-name');

                    if (createBtn && input) {
                        createBtn.onclick = () => {
                            const name = input.value.trim();
                            if (name) {
                                const newProf = this.createProfile(name);
                                this.switchProfile(newProf.id);
                            }
                        };
                        input.onkeypress = (e) => {
                            if (e.key === 'Enter') createBtn.click();
                        };
                    }
                } else {
                    console.error("Auth Gate UI not found in DOM");
                    resolve(true); // Fallback so app doesn't freeze
                }
            }
        });
    },

    renderProfiles() {
        const container = document.getElementById('profiles-list');
        if (!container) return;

        const profiles = this.getProfiles();
        container.innerHTML = '';

        if (profiles.length === 0) {
            container.innerHTML = `<p style="grid-column: 1/-1; color: var(--cin-muted); font-size: 0.9rem;">No profiles yet. Create one to begin.</p>`;
            return;
        }

        profiles.forEach(p => {
            const div = document.createElement('div');
            div.className = 'profile-card';
            div.style.cssText = `position: relative; display: flex; flex-direction: column; align-items: center; gap: 10px; cursor: pointer; transition: transform 0.2s ease;`;
            div.innerHTML = `
                <div style="width: 80px; height: 80px; border-radius: 50%; background: ${p.color}; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; box-shadow: 0 4px 15px rgba(0,0,0,0.3); border: 2px solid rgba(255,255,255,0.1);">
                    ${p.emoji}
                </div>
                <span style="color: #fff; font-weight: 600; font-family: 'Inter', sans-serif;">${p.name}</span>
                <button class="delete-profile-btn" style="position: absolute; top: -5px; right: 0px; width: 24px; height: 24px; border-radius: 50%; background: rgba(239, 68, 68, 0.9); border: 1px solid rgba(255,255,255,0.2); color: #fff; font-size: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.5); opacity: 0; transition: opacity 0.2s ease; z-index: 10;">
                    <i class="fas fa-times"></i>
                </button>
            `;

            const delBtn = div.querySelector('.delete-profile-btn');

            div.onmouseover = () => {
                div.style.transform = 'scale(1.1)';
                delBtn.style.opacity = '1';
            };
            div.onmouseout = () => {
                div.style.transform = 'scale(1)';
                delBtn.style.opacity = '0';
            };

            div.onclick = (e) => {
                const btn = e.target.closest('.delete-profile-btn');
                if (btn) {
                    // Stop event bubbling so switchProfile isn't invoked
                    e.stopPropagation();
                    if (confirm(`Are you sure you want to delete profile "${p.name}"? All data for this profile will be lost.`)) {
                        this.removeProfile(p.id);
                        this.renderProfiles();
                    }
                } else {
                    this.switchProfile(p.id);
                }
            };
            container.appendChild(div);
        });
    }
};

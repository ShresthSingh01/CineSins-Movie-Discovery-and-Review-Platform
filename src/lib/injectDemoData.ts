export const injectDemoData = () => {
    if (typeof window === 'undefined') return;

    // 1. Hall of Shame (Recently Deported)
    const demoDeported = [
        { id: 'tt0120613', title: 'The Avengers (1998)', sins: 582, date: new Date().toISOString() },
        { id: 'tt0118688', title: 'Batman & Robin', sins: 641, date: new Date().toISOString() },
        { id: 'tt0411008', title: 'Catwoman', sins: 512, date: new Date().toISOString() },
        { id: 'tt0265666', title: 'Gigli', sins: 489, date: new Date().toISOString() },
        { id: 'tt0316465', title: 'The Room', sins: 720, date: new Date().toISOString() }
    ];
    localStorage.setItem('cinesins_deported', JSON.stringify(demoDeported));

    // 2. AI Movie Finder History (Projections)
    const demoHistory = ['tt0120613', 'tt0118688', 'tt0411008'];
    localStorage.setItem('cinesins_history', JSON.stringify(demoHistory));

    // 3. User Preferences (Custom frequency)
    localStorage.setItem('cinesins_preference', 'Sci-Fi');

    console.log('✅ CineSins Demo Data Injected. System state: POPULATED.');
};

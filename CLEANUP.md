# CinemaDNA Feature Cleanup & Flags

The following features have been disabled and placed behind feature flags in `config.js` to clear UI clutter and focus the product on its core mission: deep emotional movie analytics.

## Disabled Features

### `sceneTags`
* **Status**: Disabled
* **Reason**: Manually tagging scenes (e.g., "heist", "rain") introduces too much friction and cognitive load for the user. CinemaDNA's ethos is automated emotional analytics based on reviews and metadata, not manual taxonomy. The scene carousel is also disabled under this umbrella to keep the UI clean.

### `watchNow`
* **Status**: Disabled
* **Reason**: Deep-linking to streaming providers implies a viewing/consumption app. CinemaDNA is a post-watch or pre-watch decision analysis tool. Removing outbound streaming links keeps users focused on their own ecosystem and analytics.

### `compatibility`
* **Status**: Disabled (UI hidden)
* **Reason**: The Compatibility Mode is a fun gimmick but distracts from the core single-user personal analytics journey. The code remains intact within the repository for potential external modules but is detached from the main navigation.

### `neonUI`
* **Status**: Disabled
* **Reason**: Sprawling neon animations and "Spin Again" gimmicks dilute the clean, analytical, data-first privacy-focused aesthetic we are targeting for CinemaDNA. The UI has been stripped back to present high-contrast, distraction-free movie intelligence.

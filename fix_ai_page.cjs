const fs = require('fs');
const file = 'src/pages/AIAssistantPage.tsx';
let code = fs.readFileSync(file, 'utf8');

// replace the apiClient.sendChatMessage call to pass real lat/lng
code = code.replace(
  /const res = await apiClient\.sendChatMessage\(\{/,
  `
      // Fetch geolocation if available
      let userLat = 21.3966;
      let userLng = 79.3274;
      try {
        if ('geolocation' in navigator) {
          const pos = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
          });
          userLat = pos.coords.latitude;
          userLng = pos.coords.longitude;
        }
      } catch (err) {
        console.warn('Geolocation failed', err);
      }
      
      const res = await apiClient.sendChatMessage({
        userLat,
        userLng,`
);

fs.writeFileSync(file, code);


// backend/triage/searchTools.js
// const axios = require('axios');

// async function findDoctors(specialistType, city = "Chennai") {
//   try {
//     console.log(`🔎 Attempting to find '${specialistType}' in '${city}'...`);

//     // STEP 1: Try the specific Specialist (e.g., "Podiatrist in Chennai")
//     let query = `${specialistType} in ${city}`;
//     let url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=3`;

//     let response = await axios.get(url, {
//       headers: { 'User-Agent': 'NariSanghaHealthApp/1.0' }
//     });

//     // STEP 2: The "Fallback" - If no specialists found, search for generic Hospitals
//     if (!response.data || response.data.length === 0) {
//       console.log(`⚠️ No specific '${specialistType}' found. Falling back to 'Hospital'...`);
      
//       query = `Hospital in ${city}`;
//       url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=3`;
      
//       response = await axios.get(url, {
//         headers: { 'User-Agent': 'NariSanghaHealthApp/1.0' }
//       });
//     }

//     // If STILL nothing, give up gracefully
//     if (!response.data || response.data.length === 0) {
//       return "I couldn't find specific clinics in the database, but please visit your nearest hospital.";
//     }

//     // STEP 3: Format the results
//     const places = response.data.map(place => {
//       // Split the long address to just get the name
//       const name = place.display_name.split(',')[0]; 
//       return `- **${name}**`;
//     }).join('\n');

//     return `Here are some nearby options (based on OpenStreetMap):\n${places}`;

//   } catch (error) {
//     console.error("OSM Search Error:", error.message);
//     return "Please search for 'Doctors near me' on Google Maps.";
//   }
// }

// module.exports = { findDoctors };




// backend/triage/searchTools.js
const axios = require('axios');

async function findDoctors(specialistType, city = "Chennai") {
  try {
    console.log(`🔎 SEARCH TOOL: Looking for '${specialistType}' in '${city}'...`);

    // 1. Try Specific Search (e.g., "Neurologist in Chennai")
    let query = `${specialistType} in ${city}`;
    let url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`;

    let response = await axios.get(url, {
      headers: { 'User-Agent': 'NariSanghaHealthApp/1.0' }
    });

    let results = response.data;

    // 🕵️‍♂️ FILTER: Remove "Fake" results (Generic category labels)
    // If the place name is exactly "Neurologist" or "Doctor", it's not a real clinic.
    results = results.filter(place => {
        const name = place.display_name.split(',')[0].trim();
        return name.toLowerCase() !== specialistType.toLowerCase() && name.length > 4;
    });

    // 2. FALLBACK: If specific search failed or returned only bad labels
    if (results.length === 0) {
      console.log(`⚠️ No specific clinics found for '${specialistType}'. Switching to generic 'Hospital'...`);
      
      query = `Hospital in ${city}`;
      url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`;
      
      response = await axios.get(url, {
        headers: { 'User-Agent': 'NariSanghaHealthApp/1.0' }
      });
      results = response.data;
    }

    // 3. If STILL nothing, return a polite error
    if (!results || results.length === 0) {
      return "I couldn't find specific clinics in the database. Please search for 'Hospital' on Google Maps.";
    }

    // 4. Format the output nicely
    const places = results.map(place => {
      // Get the first part of the address (The Name)
      const name = place.display_name.split(',')[0]; 
      // Optional: Add a Google Maps link
      return `- **${name}** ([Map](https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + " " + city)}))`;
    }).join('\n');

    return `Here are some nearby options:\n${places}`;

  } catch (error) {
    console.error("❌ OSM Search Error:", error.message);
    return "I couldn't access the map service right now. Please check Google Maps.";
  }
}

module.exports = { findDoctors };
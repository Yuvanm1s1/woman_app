// const { HumanMessage, SystemMessage } = require("@langchain/core/messages");

// async function runBookingAgent(state, model) {
//   const start = Date.now();
//   const lastMessage = state.messages[state.messages.length - 1].content;
//   const txnId = state.transactionId || "BOOKING_AGENT";

//   console.log(`📅 [${txnId}] BOOKING AGENT: Processing Request...`);

//   // 1. ANALYZE CONTEXT TO FIND SPECIALIST
//   // We look at the User's input AND the Medical Chart (if Triage ran previously)
//   const contextData = `
//     User Input: "${lastMessage}"
//     Known Symptom: ${state.symptom || "None"}
//     Known Location: ${state.location || "None"}
//   `;

//   const extractionPrompt = `
//     TASK: Identify the Medical Specialist and Location for an appointment.
//     CONTEXT: ${contextData}

//     RULES:
//     1. Map symptoms/requests to the correct Specialist (e.g., "Teeth" -> "Dentist", "Skin" -> "Dermatologist", "Pregnancy" -> "Gynecologist").
//     2. If no specific symptom, default Specialist to "General Physician".
//     3. Detect Location (City/Area) from input. If missing, default Location to "Chennai".

//     OUTPUT JSON ONLY: { "specialist": "...", "location": "..." }
//   `;

//   try {
//     // We use the JSON model (if available) or the text model
//     const response = await model.invoke([new HumanMessage(extractionPrompt)]);
    
//     // Parse JSON safely (handling potential Markdown wrappers)
//     const cleanJson = response.content.replace(/```json/g, "").replace(/```/g, "").trim();
//     const data = JSON.parse(cleanJson);

//     const specialist = data.specialist || "General Physician";
//     const location = data.location || "Chennai";

//     // 2. GENERATE DEEP LINK (Google Maps Search)
//     // Query format: "Cardiologist near Chennai"
//     const query = `${specialist} near ${location}`;
//     const mapUrl = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;

//     // 3. CRAFT RESPONSE
//     const finalResponse = `I can help you schedule an appointment.\n\nBased on your request, I have located **${specialist}s** near **${location}**.\n\nPlease click the link below to view available doctors and contact details:\n\n🔗 **[View Available Specialists](${mapUrl})**`;

//     return { messages: [new SystemMessage(finalResponse)], mode: "locked" };

//   } catch (error) {
//     console.error("❌ Booking Agent Error:", error);
//     // Fallback if AI fails
//     return { messages: [new SystemMessage("I can help with that. Please search for 'Doctors near me' on Google Maps for the quickest results.")] };
//   }
// }

// module.exports = { runBookingAgent };


const { HumanMessage, SystemMessage } = require("@langchain/core/messages");

async function runBookingAgent(state, model) {
  const start = Date.now();
  const lastMessage = state.messages[state.messages.length - 1].content;
  const txnId = state.transactionId || "BOOKING_AGENT";

  console.log(`📅 [${txnId}] BOOKING AGENT: Processing Request...`);

  // 1. ANALYZE CONTEXT TO FIND SPECIALIST
  const contextData = `
    User Input: "${lastMessage}"
    Known Symptom: ${state.symptom || "None"}
    Known Location: ${state.location || "None"}
  `;

  const extractionPrompt = `
    TASK: Identify the Medical Specialist and Location for an appointment.
    CONTEXT: ${contextData}

    RULES:
    1. Map symptoms to Specialist (e.g., "Teeth" -> "Dentist", "Skin" -> "Dermatologist").
    2. If no specific symptom, default to "General Physician".
    3. Detect Location from input. If missing, default to "Chennai".

    OUTPUT JSON ONLY: { "specialist": "...", "location": "..." }
  `;

  try {
    // Model is already bound to JSON mode in graph.js
    const response = await model.invoke([new HumanMessage(extractionPrompt)]);
    
    // GPT-4o JSON mode returns clean JSON, but we parse carefully just in case
    const data = JSON.parse(response.content);

    const specialist = data.specialist || "General Physician";
    const location = data.location || "Chennai";

    // 2. GENERATE DEEP LINK
    const query = `${specialist} near ${location}`;
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

    // 3. CRAFT RESPONSE
    const finalResponse = `I can help you schedule an appointment.\n\nBased on your request, I have located **${specialist}s** near **${location}**.\n\n🔗 **[Click here to view available doctors](${mapUrl})**`;

    return { messages: [new SystemMessage(finalResponse)], mode: "locked" };

  } catch (error) {
    console.error("❌ Booking Agent Error:", error);
    return { messages: [new SystemMessage("I can help with that. Please search for 'Doctors near me' on Google Maps.")] };
  }
}

module.exports = { runBookingAgent };
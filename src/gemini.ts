import { Language } from './types';

export const generateReflection = async (messages: string[], language: Language) => {
  try {
    const langLabel = language === 'bisaya' ? 'Cebuano (Bisaya)' : 'Tagalog';
    const prompt = `
      Based on the following emotional venting session (messages from the user), provide a "SadBai Reflection".
      
      User messages:
      ${messages.join("\n")}
      
      Requirements:
      1. One empathic response in ${langLabel} that validates their feelings.
      2. "Unsay Nahitabo" (or equivalent in ${langLabel}): A neutral breakdown of what happened.
      3. "Kamatuoran" (or equivalent in ${langLabel}): Validation of their emotional truth.
      4. "Focus Sunod" (or equivalent in ${langLabel}): Small, manageable steps for tomorrow.
      
      STRICT RULE: All content MUST be in ${langLabel}. DO NOT mix English words. Use pure ${langLabel}.

      
      Format the response MUST be a valid JSON object:
      {
        "reflection": "${langLabel} text here",
        "breakdown": "Neutral breakdown in ${langLabel} here",
        "truth": "Validation in ${langLabel} here",
        "steps": "Next steps in ${langLabel} here"
      }
    `;

    const response = await fetch("/api/reflection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });

    if (!response.ok) throw new Error("Backend reflection error");
    return await response.json();
  } catch (error) {
    console.error("Reflection Generation Error:", error);
    if (language === 'tagalog') {
      return {
        reflection: "Nakikinig ako sa iyo. Okay lang na makaramdam ng kalungkutan ngayon.",
        breakdown: "Dumaan ka sa mahirap na panahon at nararamdaman mong parang wala kang patutunguhan.",
        truth: "Mahalaga ang nararamdaman mo dahil totoo iyan para sa iyo.",
        steps: "Magpahinga muna ngayon. Bukas, magsimula sa isang maliit na bagay."
      };
    }
    return {
      reflection: "Naminaw ko nimo. Okay ra na mobati ug kaguol karon.",
      breakdown: "Nag-agi ka ug lisod nga panahon ug gibati nimo nga walay padulngan.",
      truth: "Importante ang imong gibati kay tinuod na para nimo.",
      steps: "Pahuway sa karon. Ugma, pagsugod sa usa ka gamay nga butang."
    };
  }
};

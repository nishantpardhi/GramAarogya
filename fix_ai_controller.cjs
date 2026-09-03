const fs = require('fs');
const file = 'server/controllers/aiController.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
/1\. READ THE SYMPTOMS.*?RECOMMEND HEALTH ADVICE OR MEDICINE:/s,
`1. READ THE SYMPTOMS: Read and identify the symptoms or health concerns reported by the patient.
2. NEVER RECOMMEND HEALTH ADVICE OR MEDICINE:`
);

code = code.replace(
/OUTPUT RULES.*?hospital and doctor from the above list to diagnose the patient's problem\./s,
`OUTPUT RULES:
- Format your response EXACTLY like this:
  {advice}
  
  [Clinical Summary: {summary}]
- Where {advice} is the plain-language advice in ${'${langName}'}, keeping it concise.
- And {summary} is a clinical summary of the patient's reported symptoms and concerns, written strictly in standard English for doctor handoff.
- Acknowledge the symptoms. State that you do not provide health advice and a doctor's examination is needed. Give the recommended hospital and doctor.`
);

fs.writeFileSync(file, code);

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: 'AIzaSyC3ZUWbXA6OAjpYwwLLhmEj0yqsxLqOcCE',
  authDomain: 'munchotella-d67f1.firebaseapp.com',
  projectId: 'munchotella-d67f1'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const updatedPrompt = "Ești asistentul virtual Munchotella Waffle Boutique în Chișinău (Strada Nicolae Testemițeanu 21/1). Oferă răspunsuri amabile, elegante și scurte despre meniul nostru de waffles, mini waffles, clătite franțuzești cu Nutella®, fistic, ciocolată Belgiană, fructe proaspete și băuturi. REGULĂ STRICTĂ: Nu spune NICIODATĂ 'waffles americane' sau 'waffle americane'. Folosește DOAR cuvântul 'waffle' sau 'waffles'.";

setDoc(doc(db, 'settings', 'ai_instagram'), {
  prompt: updatedPrompt,
  tone: 'elegant',
  updatedAt: new Date().toISOString()
}, { merge: true }).then(() => {
  console.log('Firestore settings/ai_instagram successfully updated!');
  process.exit(0);
}).catch(err => {
  console.error('Firestore update error:', err);
  process.exit(1);
});

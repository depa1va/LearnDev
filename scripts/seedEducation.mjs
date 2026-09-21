import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { educationSeedData } from './educationSeedData.mjs';
import { validateEducationSeedData } from './educationSeedValidation.mjs';

const COLLECTIONS = ['tracks', 'courses', 'modules', 'lessons', 'concepts', 'activities', 'practicalExercises', 'courseCatalogs'];

async function getAdminOptions() {
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim() || process.env.GCLOUD_PROJECT?.trim();
  const serviceAccountPath = process.env.DEVQUEST_FIREBASE_SERVICE_ACCOUNT?.trim();
  const useEmulator = Boolean(process.env.FIRESTORE_EMULATOR_HOST?.trim());

  if (useEmulator) {
    if (!projectId) throw new Error('Defina FIREBASE_PROJECT_ID ao executar o seed com o Firestore Emulator.');
    return { projectId };
  }

  if (serviceAccountPath) {
    try {
      const credentials = JSON.parse(await readFile(resolve(serviceAccountPath), 'utf8'));
      return { projectId: projectId || credentials.project_id, credential: cert(credentials) };
    } catch {
      throw new Error('Não foi possível ler a credencial indicada em DEVQUEST_FIREBASE_SERVICE_ACCOUNT. Verifique o caminho e o JSON.');
    }
  }

  if (!projectId) throw new Error('Defina FIREBASE_PROJECT_ID ou informe DEVQUEST_FIREBASE_SERVICE_ACCOUNT.');
  return { projectId, credential: applicationDefault() };
}

function formatSummary(summary) {
  return COLLECTIONS.map((collectionName) => {
    const item = summary[collectionName];
    return `${collectionName}: ${item.created} criado(s), ${item.updated} atualizado(s)`;
  }).join('\n');
}

async function upsertSeedDocument(db, collectionName, documentId, seedData) {
  const reference = db.collection(collectionName).doc(documentId);

  return db.runTransaction(async (transaction) => {
    const current = await transaction.get(reference);
    const existingData = current.exists ? current.data() : null;
    const payload = {
      ...seedData,
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (!existingData || !Object.hasOwn(existingData, 'createdAt')) {
      payload.createdAt = FieldValue.serverTimestamp();
    }

    transaction.set(reference, payload, { merge: true });
    return current.exists ? 'updated' : 'created';
  });
}

async function main() {
  const counts = validateEducationSeedData(educationSeedData);
  const adminOptions = await getAdminOptions();
  const app = getApps().length ? getApps()[0] : initializeApp(adminOptions);
  const db = getFirestore(app);
  const summary = Object.fromEntries(COLLECTIONS.map((collectionName) => [collectionName, { created: 0, updated: 0 }]));

  console.log('LearnDev — Education Seed');
  console.log(`Manifesto validado: ${Object.values(counts).reduce((total, count) => total + count, 0)} documento(s).`);

  for (const collectionName of COLLECTIONS) {
    for (const [documentId, seedData] of Object.entries(educationSeedData[collectionName])) {
      const result = await upsertSeedDocument(db, collectionName, documentId, seedData);
      summary[collectionName][result] += 1;
    }
  }

  console.log(formatSummary(summary));
  console.log('Seed concluído. Nenhum documento fora do manifesto foi removido.');
}

main().catch((error) => {
  console.error(`Seed interrompido: ${error.message}`);
  process.exitCode = 1;
});

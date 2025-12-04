import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Initialiser l'SDK Admin pour pouvoir interagir avec Firestore
admin.initializeApp();

const db = admin.firestore();
const CREDIT_REWARD = 1; // Le nombre de crédits à attribuer pour une soumission approuvée

/**
 * Se déclenche lorsqu'un document est mis à jour dans la collection 'documents'.
 * Si le statut du document passe de 'pending' à 'approved', cette fonction
 * attribue un crédit à l'utilisateur qui a soumis le document.
 */
export const awardCreditsOnApproval = functions.firestore
  .document("documents/{documentId}")
  .onUpdate(async (change, context) => {
    const beforeData = change.before.data();
    const afterData = change.after.data();

    // Vérifier si le statut a bien changé de 'pending' à 'approved'
    if (beforeData.status === "pending" && afterData.status === "approved") {
      const uploaderId = afterData.uploaderId;

      if (!uploaderId) {
        functions.logger.error("Document approuvé sans uploaderId:", context.params.documentId);
        return null;
      }

      const userDocRef = db.collection("users").doc(uploaderId);

      try {
        // Utiliser une transaction pour garantir l'atomicité de l'opération
        await db.runTransaction(async (transaction) => {
          const userDoc = await transaction.get(userDocRef);
          if (!userDoc.exists) {
            functions.logger.error("Utilisateur non trouvé pour attribution de crédits:", uploaderId);
            return;
          }

          const newCredits = (userDoc.data()?.credits || 0) + CREDIT_REWARD;
          transaction.update(userDocRef, { credits: newCredits });
        });

        functions.logger.log(`Crédits attribués à ${uploaderId}. Nouveau solde: ${((await userDocRef.get()).data()?.credits)}`);
        return null;

      } catch (error) {
        functions.logger.error(`Erreur lors de l'attribution de crédits à ${uploaderId}:`, error);
        return null;
      }
    }

    return null; // Pas de changement de statut pertinent, on ne fait rien
  });

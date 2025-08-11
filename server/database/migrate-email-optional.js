// Script pour rendre le champ email optionnel dans la table housekeepers
import pool, { query } from '../config/database.js';

async function migrateEmailOptional() {
  console.log('Démarrage de la migration pour rendre le champ email optionnel...');
  
  try {
    // Exécuter la modification de la structure de la table
    await query('ALTER TABLE housekeepers ALTER COLUMN email DROP NOT NULL');
    
    console.log('✅ Migration terminée avec succès!');
    console.log('La colonne email est maintenant optionnelle dans la table housekeepers.');
    
    // Vérifier la structure mise à jour
    const tableInfo = await query(`
      SELECT column_name, is_nullable, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'housekeepers' AND column_name = 'email'
    `);
    
    if (tableInfo.rows.length > 0) {
      console.log('Information sur la colonne email:');
      console.log(`- Nom: ${tableInfo.rows[0].column_name}`);
      console.log(`- Type: ${tableInfo.rows[0].data_type}`);
      console.log(`- Nullable: ${tableInfo.rows[0].is_nullable}`);
    }
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  } finally {
    // Fermer la connexion à la base de données
    await pool.end();
  }
}

// Exécuter la migration
migrateEmailOptional();

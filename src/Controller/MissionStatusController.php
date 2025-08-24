<?php
/**
 * Contrôleur pour la gestion des statuts de mission
 * 
 * @package OneLogAfrica\VoyageTracker\Controller
 * @version 2.0.0
 */

declare(strict_types=1);

namespace OneLogAfrica\VoyageTracker\Controller;

use PDO;
use PDOStatement;
use InvalidArgumentException;
use RuntimeException;

/**
 * Contrôleur pour la gestion des statuts de mission
 */
class MissionStatusController {
    /** @var PDO Instance PDO pour la base de données */
    private $db;
    
    /** @var array Liste des statuts valides */
    private $validStatuses = [
        'planifiee', 'en_cours', 'en_retard', 
        'terminee', 'annulee', 'en_incident'
    ];
    
    /** 
     * Mapping des transitions de statut autorisées
     * @var array 
     */
    private $allowedTransitions = [
        'planifiee' => ['en_cours', 'annulee'],
        'en_cours' => ['en_retard', 'terminee', 'en_incident'],
        'en_retard' => ['terminee', 'en_incident'],
        'en_incident' => ['en_cours', 'annulee'],
        'terminee' => [],
        'annulee' => []
    ];
    
    /**
     * Constructeur
     * 
     * @param PDO $db Instance PDO pour la base de données
     */
    public function __construct(PDO $db) {
        $this->db = $db;
    }
    
    /**
     * Valide les données de la requête de mise à jour de statut
     * 
     * @param int $missionId
     * @param string $newStatus
     * @param string|null $comment
     * @throws InvalidArgumentException Si la validation échoue
     */
    private function validateUpdateRequest($missionId, $newStatus, $comment = null): void {
        // Validation de l'ID de mission
        if (!is_numeric($missionId) || $missionId <= 0) {
            throw new InvalidArgumentException("L'ID de mission est invalide");
        }
        
        // Validation du statut
        if (!in_array($newStatus, $this->validStatuses, true)) {
            throw new InvalidArgumentException("Le statut fourni est invalide");
        }
        
        // Validation du commentaire (optionnel)
        if ($comment !== null && !is_string($comment)) {
            throw new InvalidArgumentException("Le commentaire doit être une chaîne de caractères");
        }
    }
    
    /**
     * Vérifie si une transition de statut est autorisée
     * 
     * @param string $currentStatus
     * @param string $newStatus
     * @return bool
     */
    private function isTransitionAllowed(string $currentStatus, string $newStatus): bool {
        // Si c'est le même statut, c'est autorisé (mise à jour de commentaire uniquement)
        if ($currentStatus === $newStatus) {
            return true;
        }
        
        // Vérifie si la transition est autorisée
        return in_array($newStatus, $this->allowedTransitions[$currentStatus] ?? [], true);
    }
    
    /**
     * Met à jour le statut d'une mission
     * 
     * @param int $missionId
     * @param string $newStatus
     * @param string|null $comment
     * @return array
     * @throws RuntimeException En cas d'erreur de base de données
     */
    public function updateStatus(int $missionId, string $newStatus, ?string $comment = null): array {
        try {
            // Valider les entrées (avant toute transaction)
            $this->validateUpdateRequest($missionId, $newStatus, $comment);

            // Démarrer une transaction uniquement après validation OK
            $this->db->beginTransaction();
            
            // Récupérer le statut actuel de la mission (avec verrouillage en écriture)
            $stmt = $this->db->prepare(
                "SELECT id, statut, reference FROM missions WHERE id = ? FOR UPDATE"
            );
            $stmt->execute([$missionId]);
            $mission = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$mission) {
                throw new InvalidArgumentException("Mission non trouvée");
            }
            
            $currentStatus = $mission['statut'];
            
            // Vérifier la transition de statut
            if (!$this->isTransitionAllowed($currentStatus, $newStatus)) {
                throw new InvalidArgumentException(
                    "Transition non autorisée de $currentStatus vers $newStatus"
                );
            }
            
            // Mettre à jour le statut si nécessaire
            $updated = false;
            if ($currentStatus !== $newStatus) {
                $updateStmt = $this->db->prepare(
                    "UPDATE missions SET statut = ?, updated_at = NOW() WHERE id = ?"
                );
                $updated = $updateStmt->execute([$newStatus, $missionId]);
                
                if (!$updated) {
                    throw new RuntimeException("Échec de la mise à jour du statut");
                }
            }
            
            // Journaliser le changement de statut
            $logStmt = $this->db->prepare(
                "INSERT INTO mission_status_logs 
                (mission_id, ancien_statut, nouveau_statut, commentaire, created_at) 
                VALUES (?, ?, ?, ?, NOW())"
            );
            
            $logStmt->execute([
                $missionId,
                $currentStatus,
                $newStatus,
                $comment
            ]);
            
            $logId = (int)$this->db->lastInsertId();
            
            // Valider la transaction
            $this->db->commit();
            
            return [
                'success' => true,
                'message' => 'Statut mis à jour avec succès',
                'data' => [
                    'mission_id' => $missionId,
                    'reference' => $mission['reference'],
                    'previous_status' => $currentStatus,
                    'new_status' => $newStatus,
                    'log_id' => $logId,
                    'updated' => $updated
                ]
            ];
            
        } catch (InvalidArgumentException $e) {
            // Pas de rollback ici : aucune transaction ouverte si validation échoue
            return [
                'success' => false,
                'message' => $e->getMessage(),
                'code' => 400
            ];
        } catch (RuntimeException $e) {
            // Rollback uniquement si une transaction est ouverte
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            return [
                'success' => false,
                'message' => 'Erreur lors de la mise à jour du statut: ' . $e->getMessage(),
                'code' => 500
            ];
        } catch (\Exception $e) {
            // Rollback uniquement si une transaction est ouverte
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            return [
                'success' => false,
                'message' => 'Une erreur inattendue est survenue',
                'code' => 500,
                'error' => $e->getMessage()
            ];
        }
    }
}

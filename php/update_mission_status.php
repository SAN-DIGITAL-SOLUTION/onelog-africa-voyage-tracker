<?php
/**
 * Mise à jour du statut d'une mission
 * 
 * @version 2.0.0
 * @api
 */

// En-têtes HTTP
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Chargement des dépendances
require_once __DIR__ . '/../config/database.php';

class MissionStatusController {
    private $db;
    private $validStatuses = [
        'planifiee', 'en_cours', 'en_retard', 
        'terminee', 'annulee', 'en_incident'
    ];
    
    // Mapping des transitions de statut autorisées
    private $allowedTransitions = [
        'planifiee' => ['en_cours', 'annulee'],
        'en_cours' => ['en_retard', 'terminee', 'en_incident'],
        'en_retard' => ['terminee', 'en_incident'],
        'en_incident' => ['en_cours', 'annulee'],
        // Une fois terminée ou annulée, le statut ne peut plus changer
        'terminee' => [],
        'annulee' => []
    ];
    
    public function __construct($db) {
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
            throw new InvalidArgumentException("L'ID de mission est invalide", 400);
        }
        
        // Validation du statut
        if (!in_array($newStatus, $this->validStatuses, true)) {
            throw new InvalidArgumentException(
                "Le statut fourni est invalide. Statuts valides: " . 
                implode(', ', $this->validStatuses),
                400
            );
        }
        
        // Validation du commentaire si fourni
        if ($comment !== null && !is_string($comment)) {
            throw new InvalidArgumentException("Le commentaire doit être une chaîne de caractères", 400);
        }
        
        // Nettoyage du commentaire
        if ($comment !== null) {
            $comment = trim(htmlspecialchars(strip_tags($comment), ENT_QUOTES, 'UTF-8'));
            if (mb_strlen($comment) > 500) {
                throw new InvalidArgumentException("Le commentaire ne doit pas dépasser 500 caractères", 400);
            }
        }
    }
    
    /**
     * Vérifie si une transition de statut est autorisée
     * 
     * @param string $currentStatus
     * @param string $newStatus
     * @return bool
     */
    private function isTransitionAllowed($currentStatus, $newStatus): bool {
        // Si c'est le même statut, on considère que c'est autorisé (mise à jour du commentaire uniquement)
        if ($currentStatus === $newStatus) {
            return true;
        }
        
        // Vérification de la transition autorisée
        return in_array($newStatus, $this->allowedTransitions[$currentStatus] ?? [], true);
    }
    
    /**
     * Récupère une mission avec verrouillage optionnel
     * 
     * @param int $missionId
     * @param bool $lockForUpdate Verrouiller l'enregistrement pour mise à jour
     * @return array|false
     */
    private function getMission($missionId, $lockForUpdate = false) {
        try {
            $query = "SELECT * FROM missions WHERE id = ?";
            if ($lockForUpdate) {
                $query .= " FOR UPDATE";
            }
            
            $stmt = $this->db->prepare($query);
            $stmt->execute([$missionId]);
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Erreur lors de la récupération de la mission #$missionId: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Journalise le changement de statut d'une mission
     * 
     * @param int $missionId
     * @param string $oldStatus
     * @param string $newStatus
     * @param string|null $comment
     * @param string|null $ipAddress
     * @param string|null $userAgent
     * @return int ID de l'entrée de journal
     */
    private function logStatusChange(
        $missionId, 
        $oldStatus, 
        $newStatus, 
        $comment = null, 
        $ipAddress = null, 
        $userAgent = null
    ): int {
        try {
            $query = "INSERT INTO mission_status_history 
                     (mission_id, old_status, new_status, comment, ip_address, user_agent, created_at) 
                     VALUES (:mission_id, :old_status, :new_status, :comment, :ip_address, :user_agent, NOW())";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute([
                ':mission_id' => $missionId,
                ':old_status' => $oldStatus,
                ':new_status' => $newStatus,
                ':comment' => $comment,
                ':ip_address' => $ipAddress,
                ':user_agent' => $userAgent
            ]);
            
            return (int)$this->db->lastInsertId();
        } catch (PDOException $e) {
            error_log("Erreur lors de la journalisation du changement de statut: " . $e->getMessage());
            return 0; // Retourne 0 en cas d'erreur, mais ne bloque pas le flux principal
        }
    }
    
    /**
     * Met à jour le statut d'une mission
     * 
     * @param int $missionId
     * @param string $newStatus
     * @param string|null $comment
     * @return array
     */
    public function updateStatus($missionId, $newStatus, $comment = null): array {
        try {
            // Validation des entrées
            $this->validateUpdateRequest($missionId, $newStatus, $comment);
            
            // Nettoyage du commentaire
            $comment = $comment !== null ? trim(htmlspecialchars(strip_tags($comment), ENT_QUOTES, 'UTF-8')) : null;
            
            // Récupération de la mission actuelle avec verrouillage pour éviter les conflits
            $mission = $this->getMission($missionId, true);
            if (!$mission) {
                throw new InvalidArgumentException("La mission spécifiée n'existe pas", 404);
            }
            
            $currentStatus = $mission['statut'];
            
            // Vérification de la transition autorisée
            if (!$this->isTransitionAllowed($currentStatus, $newStatus)) {
                throw new InvalidArgumentException(
                    "Transition non autorisée de '$currentStatus' vers '$newStatus'", 
                    400
                );
            }
            
            // Si c'est le même statut et pas de commentaire, pas besoin de mettre à jour
            if ($currentStatus === $newStatus && empty($comment)) {
                return [
                    'success' => true,
                    'message' => 'Aucune modification nécessaire',
                    'data' => [
                        'mission_id' => (int)$missionId,
                        'current_status' => $currentStatus,
                        'updated' => false
                    ]
                ];
            }
            
            // Début de la transaction
            $this->db->beginTransaction();
            
            try {
                $updated = false;
                
                // Mise à jour du statut si nécessaire
                if ($currentStatus !== $newStatus) {
                    $query = "UPDATE missions 
                             SET statut = :status, 
                                 updated_at = NOW() 
                             WHERE id = :id";
                    
                    $stmt = $this->db->prepare($query);
                    $stmt->execute([
                        ':status' => $newStatus,
                        ':id' => $missionId
                    ]);
                    
                    if ($stmt->rowCount() === 0) {
                        throw new RuntimeException("Échec de la mise à jour du statut de la mission", 500);
                    }
                    
                    $updated = true;
                }
                
                // Journalisation du changement de statut (même si le statut n'a pas changé mais qu'il y a un commentaire)
                $logId = $this->logStatusChange(
                    $missionId, 
                    $currentStatus, 
                    $newStatus, 
                    $comment,
                    $_SERVER['REMOTE_ADDR'] ?? null,
                    $_SERVER['HTTP_USER_AGENT'] ?? null
                );
                
                // Validation des modifications
                $this->db->commit();
                
                // Journalisation du succès
                if ($updated) {
                    error_log(sprintf(
                        "Statut de la mission #%d mis à jour de '%s' à '%s' (log #%d)",
                        $missionId,
                        $currentStatus,
                        $newStatus,
                        $logId
                    ));
                }
                
                return [
                    'success' => true,
                    'message' => $updated ? 'Statut mis à jour avec succès' : 'Commentaire ajouté avec succès',
                    'data' => [
                        'mission_id' => (int)$missionId,
                        'previous_status' => $currentStatus,
                        'new_status' => $newStatus,
                        'updated_at' => date('Y-m-d H:i:s'),
                        'log_id' => $logId,
                        'updated' => $updated
                    ]
                ];
                
            } catch (Exception $e) {
                $this->db->rollBack();
                throw $e; // Renvoie l'erreur pour traitement ultérieur
            }
            
        } catch (InvalidArgumentException $e) {
            http_response_code($e->getCode() ?: 400);
            return [
                'success' => false,
                'error' => [
                    'code' => $e->getCode() ?: 400,
                    'message' => $e->getMessage(),
                    'type' => 'validation_error'
                ]
            ];
        } catch (PDOException $e) {
            error_log("Erreur PDO lors de la mise à jour du statut: " . $e->getMessage());
            http_response_code(500);
            return [
                'success' => false,
                'error' => [
                    'code' => 500,
                    'message' => 'Une erreur est survenue lors de la mise à jour du statut',
                    'type' => 'database_error',
                    'details' => (defined('ENVIRONMENT') && ENVIRONMENT === 'development') ? $e->getMessage() : null
                ]
            ];
        } catch (Exception $e) {
            error_log("Erreur inattendue lors de la mise à jour du statut: " . $e->getMessage());
            http_response_code(500);
            return [
                'success' => false,
                'error' => [
                    'code' => 500,
                    'message' => 'Une erreur inattendue est survenue',
                    'type' => 'server_error',
                    'details' => (defined('ENVIRONMENT') && ENVIRONMENT === 'development') ? $e->getMessage() : null
                ]
            ];
        }
    }
    
    // Les méthodes getMission et logStatusChange sont déjà définies plus haut dans la classe
}

// Gestion des requêtes OPTIONS pour CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Traitement de la requête
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Récupération et validation du contenu JSON
        $json = file_get_contents('php://input');
        if (empty($json)) {
            throw new InvalidArgumentException('Aucune donnée fournie', 400);
        }
        
        $data = json_decode($json, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new InvalidArgumentException('Format JSON invalide: ' . json_last_error_msg(), 400);
        }
        
        // Vérification des champs obligatoires
        if (empty($data['mission_id']) || empty($data['new_status'])) {
            throw new InvalidArgumentException('Les champs mission_id et new_status sont obligatoires', 400);
        }
        
        // Nettoyage des entrées
        $missionId = (int)$data['mission_id'];
        $newStatus = trim($data['new_status']);
        $comment = isset($data['comment']) ? trim($data['comment']) : null;
        
        // Traitement de la requête
        $controller = new MissionStatusController($db);
        $response = $controller->updateStatus($missionId, $newStatus, $comment);
        
        // Définition du code HTTP approprié
        http_response_code(isset($response['error']) ? $response['error']['code'] : 200);
        
    } catch (InvalidArgumentException $e) {
        http_response_code($e->getCode() ?: 400);
        $response = [
            'success' => false,
            'error' => [
                'code' => $e->getCode() ?: 400,
                'message' => $e->getMessage(),
                'type' => 'invalid_request'
            ]
        ];
    } catch (Exception $e) {
        error_log("Erreur lors du traitement de la requête: " . $e->getMessage());
        http_response_code(500);
        $response = [
            'success' => false,
            'error' => [
                'code' => 500,
                'message' => 'Une erreur est survenue lors du traitement de la requête',
                'type' => 'server_error',
                'details' => (defined('ENVIRONMENT') && ENVIRONMENT === 'development') ? $e->getMessage() : null
            ]
        ];
    }
    
    // Envoi de la réponse JSON
    echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    
} else {
    // Méthode non autorisée
    http_response_code(405);
    header('Allow: POST, OPTIONS');
    echo json_encode([
        'success' => false,
        'error' => [
            'code' => 405,
            'message' => 'Méthode non autorisée. Utilisez POST',
            'type' => 'method_not_allowed',
            'allowed_methods' => ['POST', 'OPTIONS']
        ]
    ], JSON_UNESCAPED_UNICODE);
}

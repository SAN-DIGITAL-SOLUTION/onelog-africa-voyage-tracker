<?php
/**
 * Gestion de la création des missions
 * 
 * @version 2.0.0
 * @api
 */

// En-têtes HTTP
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Chargement des dépendances
// require_once __DIR__ . '/../config/database.php'; // (Supprimé pour l'isolation des tests unitaires)


class MissionController {
    private $db;
    private $validStatuses = ['planifiee', 'en_cours', 'terminee', 'annulee', 'en_incident'];
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    /**
     * Valide les données de la mission
     * 
     * @param array $data Données à valider
     * @throws InvalidArgumentException Si la validation échoue
     */
    private function validateMissionData(array $data): void {
        // Champs requis
        $required = [
            'transporteur_id' => 'ID du transporteur',
            'departure' => 'Lieu de départ',
            'arrival' => 'Lieu d\'arrivée',
            'expected_start' => 'Date de début prévue',
            'expected_end' => 'Date de fin prévue'
        ];
        
        foreach ($required as $field => $label) {
            if (!isset($data[$field]) || $data[$field] === '') {
                if ($field === 'transporteur_id') {
                    throw new InvalidArgumentException("Le champ transporteur_id est requis", 422);
                }
                throw new InvalidArgumentException("Le champ $label est requis", 400);
            }
        }
        
        // Validation du format des dates
        $dateFields = [
            'expected_start' => $data['expected_start'],
            'expected_end' => $data['expected_end']
        ];
        
        foreach ($dateFields as $field => $date) {
            if (!strtotime($date)) {
                throw new InvalidArgumentException("Le format de date pour $field est invalide. Utilisez le format YYYY-MM-DD HH:MM:SS", 400);
            }
        }
        
        // Vérification que la date de fin est postérieure à la date de début
        if (strtotime($data['expected_end']) <= strtotime($data['expected_start'])) {
            throw new InvalidArgumentException("La date de fin doit être postérieure à la date de début", 400);
        }
        
        // Validation de l'ID du transporteur
        if (!is_numeric($data['transporteur_id']) || $data['transporteur_id'] <= 0) {
            throw new InvalidArgumentException("L'ID du transporteur est invalide", 400);
        }
        
        // Vérification de l'existence du transporteur
        $stmt = $this->db->prepare("SELECT id FROM transporteurs WHERE id = ?");
        $stmt->execute([$data['transporteur_id']]);
        if ($stmt->rowCount() === 0) {
            throw new InvalidArgumentException("Le transporteur spécifié n'existe pas", 404);
        }
    }
    
    /**
     * Crée une nouvelle mission
     * 
     * @param array $data Données de la mission
     * @return array Réponse JSON
     */
    public function createMission(array $data): array {
        try {
            // Validation des données
            $this->validateMissionData($data);
            
            // Nettoyage des entrées
            $transporteurId = (int)$data['transporteur_id'];
            $depart = htmlspecialchars(strip_tags($data['departure']));
            $arrival = htmlspecialchars(strip_tags($data['arrival']));
            $expectedStart = date('Y-m-d H:i:s', strtotime($data['expected_start']));
            $expectedEnd = date('Y-m-d H:i:s', strtotime($data['expected_end']));
            
            // Préparation de la requête avec des paramètres nommés pour plus de clarté
            $query = "INSERT INTO missions 
                     (transporteur_id, depart, arrivee, date_debut_prevue, date_fin_prevue, statut, created_at, updated_at) 
                     VALUES (:transporteur_id, :depart, :arrivee, :date_debut_prevue, :date_fin_prevue, 'planifiee', NOW(), NOW())";
            
            $stmt = $this->db->prepare($query);
            
            // Exécution avec des paramètres nommés
            $success = $stmt->execute([
                ':transporteur_id' => $transporteurId,
                ':depart' => $depart,
                ':arrivee' => $arrival,
                ':date_debut_prevue' => $expectedStart,
                ':date_fin_prevue' => $expectedEnd
            ]);
            
            if ($success) {
                $missionId = $this->db->lastInsertId();
                
                // Journalisation de la création
                error_log("Mission créée avec succès - ID: $missionId");
                
                return [
                    'success' => true,
                    'message' => 'Mission créée avec succès',
                    'data' => [
                        'mission_id' => (int)$missionId,
                        'reference' => 'MIS-' . date('Y') . '-' . str_pad($missionId, 5, '0', STR_PAD_LEFT),
                        'status' => 'planifiee',
                        'created_at' => date('Y-m-d H:i:s')
                    ]
                ];
            } else {
                throw new RuntimeException("Échec de la création de la mission en base de données", 500);
            }
            
        } catch (InvalidArgumentException $e) {
            $code = $e->getCode();
            if (!$code || $code < 100 || $code > 599) {
                $code = 400;
            }
            http_response_code($code);
            return [
                'success' => false,
                'error' => [
                    'code' => $code,
                    'message' => $e->getMessage(),
                    'type' => 'validation_error'
                ]
            ];
        } catch (PDOException $e) {
            error_log("Erreur PDO lors de la création de la mission: " . $e->getMessage());
            http_response_code(500);
            return [
                'success' => false,
                'error' => [
                    'code' => 500,
                    'message' => 'Une erreur est survenue lors de la création de la mission',
                    'type' => 'database_error',
                    'details' => (ENVIRONMENT === 'development') ? $e->getMessage() : null
                ]
            ];
        } catch (Exception $e) {
            error_log("Erreur inattendue: " . $e->getMessage());
            http_response_code(500);
            return [
                'success' => false,
                'error' => [
                    'code' => 500,
                    'message' => 'Une erreur inattendue est survenue',
                    'type' => 'server_error',
                    'details' => (ENVIRONMENT === 'development') ? $e->getMessage() : null
                ]
            ];
        }
    }
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
        
        // Validation stricte des champs
        $required = ['transporteur_id', 'departure', 'arrival', 'expected_start', 'expected_end'];
        $validated = [];

        foreach ($required as $field) {
            if (!isset($data[$field])) {
                http_response_code(400);
                echo json_encode(['error' => "Champ manquant: $field"]);
                exit;
            }
            
            // Sanitization
            $validated[$field] = htmlspecialchars(strip_tags(trim($data[$field])), ENT_QUOTES, 'UTF-8');
        }

        $controller = new MissionController($db);
        $response = $controller->createMission($validated);
        
        // Définition du code HTTP approprié en fonction de la réponse
        http_response_code(isset($response['error']) ? $response['error']['code'] : 201);
        
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
                'message' => 'Erreur lors du traitement de la requête',
                'type' => 'server_error'
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

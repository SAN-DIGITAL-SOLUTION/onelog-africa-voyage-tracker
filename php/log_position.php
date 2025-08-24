<?php
/**
 * Enregistrement des positions GPS des missions
 * 
 * @version 1.0.0
 * @api
 */

header('Content-Type: application/json');
require_once __DIR__ . '/../config/database.php';

class PositionLogger {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    /**
     * Enregistre une nouvelle position GPS
     * 
     * @param int $missionId
     * @param float $latitude
     * @param float $longitude
     * @param float|null $altitude
     * @param float|null $speed
     * @param string|null $deviceId
     * @return array
     */
    public function logPosition($missionId, $latitude, $longitude, $altitude = null, $speed = null, $deviceId = null) {
        try {
            // Validation des coordonnées
            if (!is_numeric($latitude) || !is_numeric($longitude)) {
                throw new Exception("Coordonnées GPS invalides");
            }
            
            // Vérification que la mission existe et est active
            $mission = $this->getMission($missionId);
            if (!$mission) {
                throw new Exception("Mission non trouvée");
            }
            
            if (!in_array($mission['statut'], ['en_cours', 'en_retard', 'en_incident'])) {
                throw new Exception("La mission n'est pas en cours");
            }
            
            // Insertion de la position
            $query = "INSERT INTO position_logs 
                     (mission_id, latitude, longitude, altitude, speed, device_id, created_at) 
                     VALUES (?, ?, ?, ?, ?, ?, NOW())";
            
            $stmt = $this->db->prepare($query);
            $success = $stmt->execute([
                $missionId,
                $latitude,
                $longitude,
                $altitude,
                $speed,
                $deviceId
            ]);
            
            if ($success) {
                // Mise à jour de la position actuelle de la mission
                $this->updateMissionPosition($missionId, $latitude, $longitude);
                
                return [
                    'success' => true,
                    'message' => 'Position enregistrée avec succès',
                    'mission_id' => $missionId,
                    'position_id' => $this->db->lastInsertId()
                ];
            } else {
                throw new Exception("Erreur lors de l'enregistrement de la position");
            }
            
        } catch (Exception $e) {
            http_response_code(400);
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }
    
    private function getMission($missionId) {
        $stmt = $this->db->prepare("SELECT * FROM missions WHERE id = ?");
        $stmt->execute([$missionId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    private function updateMissionPosition($missionId, $latitude, $longitude) {
        $query = "UPDATE missions SET 
                 last_latitude = ?, 
                 last_longitude = ?, 
                 last_position_update = NOW() 
                 WHERE id = ?";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$latitude, $longitude, $missionId]);
    }
}

// Traitement de la requête
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (empty($data['mission_id']) || !isset($data['latitude']) || !isset($data['longitude'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'mission_id, latitude et longitude sont requis'
        ]);
        exit;
    }
    
    $controller = new PositionLogger($db);
    $response = $controller->logPosition(
        $data['mission_id'],
        $data['latitude'],
        $data['longitude'],
        $data['altitude'] ?? null,
        $data['speed'] ?? null,
        $data['device_id'] ?? null
    );
    
    echo json_encode($response);
} else {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Méthode non autorisée'
    ]);
}

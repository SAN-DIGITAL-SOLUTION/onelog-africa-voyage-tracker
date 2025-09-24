<?php
/**
 * Enregistrement sécurisé des positions GPS des missions
 * @version 1.1.0
 */

header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');

require_once __DIR__ . '/../config/database.php';

// Rate limiting
session_start();
if (empty($_SESSION['requests'])) {
    $_SESSION['requests'] = 0;
    $_SESSION['first_request'] = time();
}
$_SESSION['requests']++;
if ($_SESSION['requests'] > 100 && (time() - $_SESSION['first_request']) < 60) { // 100 req/min
    http_response_code(429);
    echo json_encode(['error' => 'Trop de requêtes']);
    exit;
}

class PositionLogger {
    private $db;
    private $user_org_id;

    public function __construct($db, $user_org_id) {
        $this->db = $db;
        $this->user_org_id = $user_org_id;
    }

    public function logPosition($missionId, $latitude, $longitude, $altitude, $speed, $deviceId) {
        try {
            // Validation et sanitization
            $missionId = filter_var($missionId, FILTER_VALIDATE_INT);
            $latitude = filter_var($latitude, FILTER_VALIDATE_FLOAT);
            $longitude = filter_var($longitude, FILTER_VALIDATE_FLOAT);
            $altitude = filter_var($altitude, FILTER_VALIDATE_FLOAT, FILTER_NULL_ON_FAILURE);
            $speed = filter_var($speed, FILTER_VALIDATE_FLOAT, FILTER_NULL_ON_FAILURE);
            $deviceId = $deviceId ? htmlspecialchars(strip_tags(trim($deviceId)), ENT_QUOTES, 'UTF-8') : null;

            if ($missionId === false || $latitude === false || $longitude === false) {
                throw new Exception("Données de position invalides");
            }

            $mission = $this->getMission($missionId);
            if (!$mission) {
                throw new Exception("Mission non trouvée ou non autorisée");
            }

            if (!in_array($mission['statut'], ['en_cours', 'en_retard', 'en_incident'])) {
                throw new Exception("La mission n'est pas en cours");
            }

            $this->db->beginTransaction();

            $stmt = $this->db->prepare("INSERT INTO position_logs (mission_id, latitude, longitude, altitude, speed, device_id) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([$missionId, $latitude, $longitude, $altitude, $speed, $deviceId]);
            $positionId = $this->db->lastInsertId();

            $this->updateMissionPosition($missionId, $latitude, $longitude);

            $this->db->commit();

            return ['success' => true, 'message' => 'Position enregistrée', 'position_id' => $positionId];

        } catch (Exception $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            http_response_code(400);
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    private function getMission($missionId) {
        $stmt = $this->db->prepare("SELECT * FROM missions WHERE id = ? AND organization_id = ?");
        $stmt->execute([$missionId, $this->user_org_id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    private function updateMissionPosition($missionId, $latitude, $longitude) {
        $stmt = $this->db->prepare("UPDATE missions SET last_latitude = ?, last_longitude = ?, last_position_update = NOW() WHERE id = ?");
        $stmt->execute([$latitude, $longitude, $missionId]);
    }
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Méthode non autorisée']);
    exit;
}

// Authentification (exemple basique, à remplacer par votre système JWT/OAuth)
$headers = getallheaders();
$authToken = $headers['Authorization'] ?? '';
if (empty($authToken)) { // TODO: Remplacer par une vraie validation de token
    http_response_code(401);
    echo json_encode(['error' => 'Authentification requise']);
    exit;
}
// TODO: Décoder le token pour récupérer le user_id et l'org_id
$user_org_id = 'a1b2c3d4-e5f6-7890-1234-567890abcdef'; // ID d'organisation MOCK

$data = json_decode(file_get_contents('php://input'), true);
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(['error' => 'JSON invalide']);
    exit;
}

if (empty($data['mission_id']) || !isset($data['latitude']) || !isset($data['longitude'])) {
    http_response_code(400);
    echo json_encode(['error' => 'mission_id, latitude et longitude sont requis']);
    exit;
}

$logger = new PositionLogger($db, $user_org_id);
$response = $logger->logPosition(
    $data['mission_id'],
    $data['latitude'],
    $data['longitude'],
    $data['altitude'] ?? null,
    $data['speed'] ?? null,
    $data['device_id'] ?? null
);

echo json_encode($response);

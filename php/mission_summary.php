<?php
/**
 * Récupération sécurisée du résumé des missions pour le Control Room
 * @version 1.1.0
 */

header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');

require_once __DIR__ . '/../config/database.php';

class MissionSummary {
    private $db;
    private $user_org_id;

    public function __construct($db, $user_org_id) {
        $this->db = $db;
        $this->user_org_id = $user_org_id;
    }

    public function getSummary($filters) {
        try {
            $baseWhere = 'm.organization_id = ?';
            $params = [$this->user_org_id];
            $where = [$baseWhere];

            // Filtres sécurisés
            if (!empty($filters['statut'])) {
                $where[] = 'm.statut = ?';
                $params[] = $filters['statut'];
            }
            // ... autres filtres ...

            $whereClause = 'WHERE ' . implode(' AND ', $where);

            // Requêtes préparées
            $stats = $this->getStats($whereClause, $params);
            $positions = $this->getRecentPositions($baseWhere, [$this->user_org_id]);
            $updates = $this->getStatusUpdates($baseWhere, [$this->user_org_id]);

            return ['success' => true, 'stats' => $stats, 'recent_positions' => $positions, 'status_updates' => $updates];

        } catch (Exception $e) {
            http_response_code(500);
            return ['success' => false, 'message' => 'Erreur serveur.'];
        }
    }

    private function getStats($whereClause, $params) {
        $query = "SELECT COUNT(*) as total, SUM(CASE WHEN m.statut = 'terminee' THEN 1 ELSE 0 END) as terminees FROM missions m $whereClause";
        $stmt = $this->db->prepare($query);
        $stmt->execute($params);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    private function getRecentPositions($whereClause, $params) {
        $query = "SELECT m.id, m.reference, m.last_latitude, m.last_longitude, m.statut FROM missions m WHERE $whereClause AND m.statut IN ('en_cours', 'en_retard') ORDER BY m.last_position_update DESC LIMIT 10";
        $stmt = $this->db->prepare($query);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    private function getStatusUpdates($whereClause, $params) {
        $query = "SELECT m.reference, h.new_status, h.created_at FROM mission_status_history h JOIN missions m ON h.mission_id = m.id WHERE $whereClause ORDER BY h.created_at DESC LIMIT 5";
        $stmt = $this->db->prepare($query);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    exit;
}

// Auth & Org ID
$user_org_id = 'a1b2c3d4-e5f6-7890-1234-567890abcdef'; // MOCK - à remplacer par la validation du token

$filters = [];
if (!empty($_GET['statut'])) {
    $filters['statut'] = htmlspecialchars(strip_tags($_GET['statut']));
}

$summary = new MissionSummary($db, $user_org_id);
$response = $summary->getSummary($filters);

echo json_encode($response);

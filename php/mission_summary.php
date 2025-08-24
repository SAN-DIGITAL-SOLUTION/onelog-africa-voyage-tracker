<?php
/**
 * Récupération du résumé des missions
 * 
 * @version 1.0.0
 * @api
 */

header('Content-Type: application/json');
require_once __DIR__ . '/../config/database.php';

class MissionSummary {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    /**
     * Récupère le résumé des missions
     * 
     * @param array $filters Filtres optionnels
     * @return array
     */
    public function getSummary($filters = []) {
        try {
            $params = [];
            $where = [];
            
            // Construction des conditions de filtrage
            if (!empty($filters['transporteur_id'])) {
                $where[] = "m.transporteur_id = ?";
                $params[] = $filters['transporteur_id'];
            }
            
            if (!empty($filters['date_debut'])) {
                $where[] = "m.date_debut_prevue >= ?";
                $params[] = $filters['date_debut'];
            }
            
            if (!empty($filters['date_fin'])) {
                $where[] = "m.date_fin_prevue <= ?";
                $params[] = $filters['date_fin'];
            }
            
            if (!empty($filters['statut'])) {
                $where[] = "m.statut = ?";
                $params[] = $filters['statut'];
            }
            
            $whereClause = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';
            
            // Requête pour les statistiques globales
            $query = "
                SELECT 
                    COUNT(*) as total_missions,
                    SUM(CASE WHEN m.statut = 'terminee' THEN 1 ELSE 0 END) as missions_terminees,
                    SUM(CASE WHEN m.statut = 'en_cours' OR m.statut = 'en_retard' THEN 1 ELSE 0 END) as missions_en_cours,
                    SUM(CASE WHEN m.statut = 'en_retard' THEN 1 ELSE 0 END) as missions_en_retard,
                    AVG(TIMESTAMPDIFF(MINUTE, m.date_debut_prevue, m.date_fin_reelle)) as duree_moyenne_min
                FROM missions m
                $whereClause
            ";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute($params);
            $stats = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Dernières positions des missions en cours
            $queryPositions = "
                SELECT 
                    m.id as mission_id,
                    m.reference,
                    t.nom as transporteur,
                    m.last_latitude,
                    m.last_longitude,
                    m.last_position_update,
                    m.statut
                FROM missions m
                JOIN transporteurs t ON m.transporteur_id = t.id
                WHERE m.statut IN ('en_cours', 'en_retard', 'en_incident')
                ORDER BY m.last_position_update DESC
                LIMIT 20
            ";
            
            $stmt = $this->db->prepare($queryPositions);
            $stmt->execute();
            $positions = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Dernières mises à jour de statut
            $queryUpdates = "
                SELECT 
                    m.id as mission_id,
                    m.reference,
                    msh.old_status,
                    msh.new_status,
                    msh.comment,
                    msh.created_at as update_time
                FROM mission_status_history msh
                JOIN missions m ON msh.mission_id = m.id
                ORDER BY msh.created_at DESC
                LIMIT 10
            ";
            
            $stmt = $this->db->prepare($queryUpdates);
            $stmt->execute();
            $updates = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            return [
                'success' => true,
                'stats' => $stats,
                'recent_positions' => $positions,
                'status_updates' => $updates,
                'timestamp' => date('c')
            ];
            
        } catch (Exception $e) {
            http_response_code(500);
            return [
                'success' => false,
                'message' => 'Erreur lors de la récupération du résumé: ' . $e->getMessage()
            ];
        }
    }
}

// Traitement de la requête
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $filters = [
        'transporteur_id' => $_GET['transporteur_id'] ?? null,
        'date_debut' => $_GET['date_debut'] ?? null,
        'date_fin' => $_GET['date_fin'] ?? null,
        'statut' => $_GET['statut'] ?? null
    ];
    
    $controller = new MissionSummary($db);
    $response = $controller->getSummary(array_filter($filters));
    
    echo json_encode($response, JSON_PRETTY_PRINT);
} else {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Méthode non autorisée'
    ]);
}

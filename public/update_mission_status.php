<?php
/**
 * Point d'entrée API pour la mise à jour du statut d'une mission
 * 
 * @version 2.0.0
 * @api
 */

// En-têtes HTTP
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Chargement de l'autoloader Composer
require_once __DIR__ . '/../vendor/autoload.php';

// Chargement de la configuration de la base de données
require_once __DIR__ . '/../config/database.php';

use OneLogAfrica\VoyageTracker\Controller\MissionStatusController;

// Gestion des requêtes OPTIONS pour CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Vérification de la méthode HTTP
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Méthode non autorisée. Utilisez POST.'
    ]);
    exit();
}

// Récupération des données de la requête
$input = json_decode(file_get_contents('php://input'), true);

// Validation des données d'entrée
if (empty($input['mission_id']) || empty($input['new_status'])) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Données manquantes. Les champs mission_id et new_status sont obligatoires.'
    ]);
    exit();
}

// Récupération des paramètres
$missionId = (int)$input['mission_id'];
$newStatus = $input['new_status'];
$comment = $input['comment'] ?? null;

try {
    // Initialisation du contrôleur
    $controller = new MissionStatusController($db);
    
    // Mise à jour du statut
    $result = $controller->updateStatus($missionId, $newStatus, $comment);
    
    // Envoi de la réponse
    if ($result['success']) {
        http_response_code(200);
    } else {
        http_response_code($result['code'] ?? 500);
    }
    
    echo json_encode($result);
    
} catch (Exception $e) {
    // Gestion des erreurs inattendues
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Une erreur inattendue est survenue',
        'error' => $e->getMessage(),
        'code' => 500
    ]);
}

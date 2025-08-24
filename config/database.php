<?php
/**
 * Configuration de la base de données
 * 
 * @version 1.0.0
 */

// Configuration de la connexion à la base de données
$dbConfig = [
    'host' => getenv('DB_HOST') ?: 'localhost',
    'dbname' => getenv('DB_NAME') ?: 'onelog_voyage_tracker',
    'username' => getenv('DB_USER') ?: 'root',
    'password' => getenv('DB_PASS') ?: '',
    'charset' => 'utf8mb4',
    'options' => [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ],
];

// Création de la connexion PDO
try {
    $dsn = "mysql:host={$dbConfig['host']};dbname={$dbConfig['dbname']};charset={$dbConfig['charset']}";
    $db = new PDO($dsn, $dbConfig['username'], $dbConfig['password'], $dbConfig['options']);
} catch (PDOException $e) {
    // En cas d'erreur de connexion
    error_log("Erreur de connexion à la base de données: " . $e->getMessage());
    
    // Réponse d'erreur au format JSON
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erreur de connexion à la base de données',
        'error' => (ENVIRONMENT === 'development') ? $e->getMessage() : null
    ]);
    exit;
}

// Fonction utilitaire pour valider les données d'entrée
function cleanInput($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

// Définition de l'environnement (développement, staging, production)
define('ENVIRONMENT', getenv('APP_ENV') ?: 'development');

// Configuration du fuseau horaire
date_default_timezone_set('Africa/Abidjan');

// Gestion des erreurs en fonction de l'environnement
if (ENVIRONMENT === 'development') {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}

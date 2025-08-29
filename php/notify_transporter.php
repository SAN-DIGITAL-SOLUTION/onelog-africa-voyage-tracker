<?php
/**
 * Gestion sécurisée des notifications aux transporteurs
 * @version 1.1.0
 */

header('Content-Type: application/json');
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../services/NotificationService.php'; // Service externe

class NotifyTransporter {
    private $db;
    private $notificationService;
    private $user_org_id;

    public function __construct($db, $user_org_id) {
        $this->db = $db;
        $this->user_org_id = $user_org_id;
        $this->notificationService = new NotificationService(getenv('MAILERSEND_API_KEY'), getenv('TWILIO_SID'), getenv('TWILIO_TOKEN'));
    }

    public function sendNotification($transporteurId, $type, $data) {
        try {
            $transporteurId = filter_var($transporteurId, FILTER_VALIDATE_INT);
            $type = htmlspecialchars(strip_tags(trim($type)));

            if (!$transporteurId || empty($type)) {
                throw new Exception("Données invalides");
            }

            $transporteur = $this->getTransporteur($transporteurId);
            if (!$transporteur) {
                throw new Exception("Transporteur non trouvé ou non autorisé");
            }

            $message = $this->prepareMessage($type, $data, $transporteur);
            $results = $this->notificationService->send($transporteur, $message);
            $this->logNotification($transporteurId, $type, $message, $results);

            return ['success' => true, 'message' => 'Notification traitée', 'results' => $results];

        } catch (Exception $e) {
            http_response_code(400);
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    private function getTransporteur($transporteurId) {
        $stmt = $this->db->prepare("SELECT * FROM transporteurs WHERE id = ? AND organization_id = ?");
        $stmt->execute([$transporteurId, $this->user_org_id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    private function prepareMessage($type, $data, $transporteur) { /* ... (logique inchangée) ... */ return []; }
    private function logNotification($transporteurId, $type, $message, $results) { /* ... */ }
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit;
}

// Auth & Org ID
$user_org_id = 'a1b2c3d4-e5f6-7890-1234-567890abcdef'; // MOCK

$data = json_decode(file_get_contents('php://input'), true);
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    exit;
}

$notifier = new NotifyTransporter($db, $user_org_id);
$response = $notifier->sendNotification(
    $data['transporteur_id'] ?? null,
    $data['type'] ?? null,
    $data['data'] ?? []
);

echo json_encode($response);

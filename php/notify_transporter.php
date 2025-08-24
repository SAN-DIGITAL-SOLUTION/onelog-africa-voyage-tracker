<?php
/**
 * Gestion des notifications aux transporteurs
 * 
 * @version 1.0.0
 * @api
 */

header('Content-Type: application/json');
require_once __DIR__ . '/../config/database.php';

class NotifyTransporter {
    private $db;
    private $smsEnabled = true; // À configurer selon l'environnement
    private $emailEnabled = true; // À configurer selon l'environnement
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    /**
     * Envoie une notification au transporteur
     * 
     * @param int $transporteurId
     * @param string $type Type de notification (nouvelle_mission, mise_a_jour, annulation, etc.)
     * @param array $data Données supplémentaires
     * @return array
     */
    public function sendNotification($transporteurId, $type, $data = []) {
        try {
            // Récupération des informations du transporteur
            $transporteur = $this->getTransporteur($transporteurId);
            if (!$transporteur) {
                throw new Exception("Transporteur non trouvé");
            }
            
            // Préparation du message en fonction du type
            $message = $this->prepareMessage($type, $data, $transporteur);
            
            // Envoi des notifications
            $results = [
                'sms_sent' => false,
                'email_sent' => false,
                'notification_logged' => false
            ];
            
            // Envoi par SMS si activé et numéro disponible
            if ($this->smsEnabled && !empty($transporteur['telephone'])) {
                $results['sms_sent'] = $this->sendSms($transporteur['telephone'], $message['sms']);
            }
            
            // Envoi par email si activé et email disponible
            if ($this->emailEnabled && !empty($transporteur['email'])) {
                $results['email_sent'] = $this->sendEmail(
                    $transporteur['email'],
                    $message['email_subject'],
                    $message['email_body']
                );
            }
            
            // Journalisation de la notification
            $results['notification_logged'] = $this->logNotification(
                $transporteurId,
                $type,
                $message,
                $results
            );
            
            return [
                'success' => true,
                'message' => 'Notification envoyée avec succès',
                'results' => $results
            ];
            
        } catch (Exception $e) {
            error_log("Erreur d'envoi de notification: " . $e->getMessage());
            
            return [
                'success' => false,
                'message' => $e->getMessage(),
                'error' => ENVIRONMENT === 'development' ? $e->getTraceAsString() : null
            ];
        }
    }
    
    private function getTransporteur($transporteurId) {
        $stmt = $this->db->prepare("SELECT * FROM transporteurs WHERE id = ?");
        $stmt->execute([$transporteurId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    private function prepareMessage($type, $data, $transporteur) {
        $messages = [
            'nouvelle_mission' => [
                'sms' => "Nouvelle mission #{$data['mission_id']} - Départ: {$data['depart']} - Arrivée: {$data['arrivee']}",
                'email_subject' => "Nouvelle mission #{$data['mission_id']} - OneLog Africa",
                'email_body' => "Bonjour {$transporteur['prenom']},<br><br>"
                    . "Une nouvelle mission vous a été attribuée :<br><br>"
                    . "<strong>Référence :</strong> #{$data['mission_id']}<br>"
                    . "<strong>Départ :</strong> {$data['depart']}<br>"
                    . "<strong>Arrivée :</strong> {$data['arrivee']}<br>"
                    . "<strong>Date prévue :</strong> " . date('d/m/Y H:i', strtotime($data['date_debut'])) . "<br><br>"
                    . "Connectez-vous à votre espace pour plus de détails.<br><br>"
                    . "Cordialement,<br>L'équipe OneLog Africa"
            ],
            'mise_a_jour_mission' => [
                'sms' => "Mise à jour mission #{$data['mission_id']} - Statut: {$data['nouveau_statut']}",
                'email_subject' => "Mise à jour mission #{$data['mission_id']} - OneLog Africa",
                'email_body' => "Bonjour {$transporteur['prenom']},<br><br>"
                    . "La mission #{$data['mission_id']} a été mise à jour :<br><br>"
                    . "<strong>Nouveau statut :</strong> {$this->formatStatut($data['nouveau_statuf'])}<br>"
                    . (!empty($data['commentaire']) ? "<strong>Commentaire :</strong> {$data['commentaire']}<br>" : "")
                    . "<br>Connectez-vous à votre espace pour plus de détails.<br><br>"
                    . "Cordialement,<br>L'équipe OneLog Africa"
            ],
            'annulation_mission' => [
                'sms' => "Annulation mission #{$data['mission_id']} - {$data['raison']}",
                'email_subject' => "Annulation mission #{$data['mission_id']} - OneLog Africa",
                'email_body' => "Bonjour {$transporteur['prenom']},<br><br>"
                    . "Nous vous informons que la mission #{$data['mission_id']} a été annulée.<br><br>"
                    . "<strong>Raison :</strong> {$data['raison']}<br>"
                    . (!empty($data['commentaire']) ? "<strong>Détails :</strong> {$data['commentaire']}<br>" : "")
                    . "<br>N'hésitez pas à nous contacter pour plus d'informations.<br><br>"
                    . "Cordialement,<br>L'équipe OneLog Africa"
            ]
        ];
        
        if (!isset($messages[$type])) {
            throw new Exception("Type de notification non pris en charge");
        }
        
        return $messages[$type];
    }
    
    private function formatStatut($statut) {
        $statuts = [
            'planifiee' => 'Planifiée',
            'en_cours' => 'En cours',
            'en_retard' => 'En retard',
            'terminee' => 'Terminée',
            'annulee' => 'Annulée',
            'en_incident' => 'En incident'
        ];
        
        return $statuts[$statut] ?? $statut;
    }
    
    private function sendSms($phoneNumber, $message) {
        // Implémentation de l'envoi de SMS
        // À remplacer par l'API SMS de votre choix (ex: Twilio, Orange SMS API, etc.)
        
        // Exemple avec une API fictive
        $apiKey = getenv('SMS_API_KEY');
        $sender = 'OneLog';
        
        try {
            // Code d'envoi SMS à implémenter
            // $client = new SmsClient($apiKey);
            // $result = $client->send($sender, $phoneNumber, $message);
            // return $result->isSuccess();
            
            // Simulation d'envoi réussi
            error_log("SMS envoyé à $phoneNumber: $message");
            return true;
            
        } catch (Exception $e) {
            error_log("Erreur d'envoi SMS: " . $e->getMessage());
            return false;
        }
    }
    
    private function sendEmail($to, $subject, $body) {
        // Configuration des en-têtes
        $headers = [
            'MIME-Version: 1.0',
            'Content-type: text/html; charset=utf-8',
            'From: notifications@onelog-africa.com',
            'Reply-To: contact@onelog-africa.com'
        ];
        
        try {
            // Envoi de l'email
            $result = mail($to, $subject, $body, implode("\r\n", $headers));
            
            if (!$result) {
                $error = error_get_last();
                throw new Exception($error['message'] ?? 'Erreur inconnue lors de l\'envoi de l\'email');
            }
            
            return true;
            
        } catch (Exception $e) {
            error_log("Erreur d'envoi d'email: " . $e->getMessage());
            return false;
        }
    }
    
    private function logNotification($transporteurId, $type, $message, $results) {
        $query = "INSERT INTO notifications 
                 (transporteur_id, type, contenu, sms_envoye, email_envoye, created_at) 
                 VALUES (?, ?, ?, ?, ?, NOW())";
        
        $stmt = $this->db->prepare($query);
        return $stmt->execute([
            $transporteurId,
            $type,
            json_encode($message),
            (int)$results['sms_sent'],
            (int)$results['email_sent']
        ]);
    }
}

// Traitement de la requête
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (empty($data['transporteur_id']) || empty($data['type'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'transporteur_id et type sont requis'
        ]);
        exit;
    }
    
    $controller = new NotifyTransporter($db);
    $response = $controller->sendNotification(
        $data['transporteur_id'],
        $data['type'],
        $data['data'] ?? []
    );
    
    echo json_encode($response, JSON_PRETTY_PRINT);
} else {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Méthode non autorisée'
    ]);
}

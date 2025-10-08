<?php
/**
 * Tests unitaires pour la mise à jour du statut d'une mission
 */

declare(strict_types=1);

use PHPUnit\Framework\TestCase;
use PHPUnit\Framework\MockObject\MockObject;

// Inclure l'autoloader de Composer
require_once __DIR__ . '/../../vendor/autoload.php';

/**
 * Classe de test pour la mise à jour du statut d'une mission
 */
class UpdateMissionStatusTest extends TestCase
{
    /** @var PDO|MockObject */
    private $dbMock;
    
    /** @var PDOStatement|MockObject */
    private $stmtMock;
    
    /** @var PDOStatement|MockObject */
    private $checkStmtMock;
    
    protected function setUp(): void
    {
        parent::setUp();
        
        // Créer un mock PDO
        $this->dbMock = $this->createMock(PDO::class);
        
        // Créer des mocks PDOStatement
        $this->stmtMock = $this->createMock(PDOStatement::class);
        $this->checkStmtMock = $this->createMock(PDOStatement::class);
        
        // Configuration par défaut pour les tests
        $this->dbMock->method('beginTransaction')->willReturn(true);
        $this->dbMock->method('commit')->willReturn(true);
        $this->dbMock->method('rollBack')->willReturn(true);
    }
    
    /**
     * Configure le mock pour la vérification d'une mission
     * 
     * @param int $missionId
     * @param string $status
     * @param bool $withLock Si vrai, verrouille l'enregistrement pour mise à jour
     */
    private function configureMissionCheck(int $missionId, string $status, bool $withLock = true): void
    {
        $missionData = [
            'id' => $missionId,
            'statut' => $status,
            'reference' => 'MIS-' . str_pad($missionId, 6, '0', STR_PAD_LEFT),
            // Autres champs de la mission...
        ];
        
        $query = "SELECT * FROM missions WHERE id = ?";
        if ($withLock) {
            $query .= " FOR UPDATE";
        }
        
        $this->dbMock->expects($this->once())
            ->method('prepare')
            ->with($this->equalTo($query))
            ->willReturn($this->checkStmtMock);
            
        $this->checkStmtMock->expects($this->once())
            ->method('execute')
            ->with([$missionId])
            ->willReturn(true);
            
        $this->checkStmtMock->expects($this->once())
            ->method('fetch')
            ->with(PDO::FETCH_ASSOC)
            ->willReturn($missionData);
    }
    
    /**
     * Configure le mock pour la mise à jour du statut d'une mission
     * 
     * @param int $missionId
     * @param string $newStatus
     * @param bool $success
     */
    private function configureUpdateStatus(int $missionId, string $newStatus, bool $success = true): void
    {
        $query = "UPDATE missions 
                 SET statut = :status, 
                     updated_at = NOW() 
                 WHERE id = :id";
                 
        $this->dbMock->expects($this->once())
            ->method('prepare')
            ->with($this->equalTo($query))
            ->willReturn($this->stmtMock);
            
        $this->stmtMock->expects($this->once())
            ->method('execute')
            ->with([
                ':status' => $newStatus,
                ':id' => $missionId
            ])
            ->willReturn($success);
            
        if ($success) {
            $this->stmtMock->expects($this->once())
                ->method('rowCount')
                ->willReturn(1);
        }
    }
    
    /**
     * Configure le mock pour la journalisation d'un changement de statut
     * 
     * @param int $missionId
     * @param string $oldStatus
     * @param string $newStatus
     * @param string|null $comment
     * @param int $logId
     */
    private function configureLogStatusChange(
        int $missionId, 
        string $oldStatus, 
        string $newStatus, 
        ?string $comment, 
        int $logId
    ): void {
        $query = "INSERT INTO mission_status_history 
                 (mission_id, old_status, new_status, comment, ip_address, user_agent, created_at) 
                 VALUES (:mission_id, :old_status, :new_status, :comment, :ip_address, :user_agent, NOW())";
                 
        $this->dbMock->expects($this->once())
            ->method('prepare')
            ->with($this->equalTo($query))
            ->willReturn($this->stmtMock);
            
        $this->stmtMock->expects($this->once())
            ->method('execute')
            ->with($this->callback(function($params) use ($missionId, $oldStatus, $newStatus, $comment) {
                return $params[':mission_id'] === $missionId
                    && $params[':old_status'] === $oldStatus
                    && $params[':new_status'] === $newStatus
                    && $params[':comment'] === $comment
                    && is_string($params[':ip_address'])
                    && is_string($params[':user_agent']);
            }))
            ->willReturn(true);
            
        $this->dbMock->expects($this->once())
            ->method('lastInsertId')
            ->willReturn((string)$logId);
    }
    
    /**
     * Test la mise à jour réussie du statut d'une mission
     */
    public function testUpdateStatusSuccess(): void
    {
        // Données de test
        $missionId = 123;
        $newStatus = 'en_cours';
        $comment = 'Démarrage de la mission';
        
        // Configuration du mock pour la vérification de la mission
        $this->configureMissionCheck($missionId, 'planifiee');
        
        // Configuration du mock pour la mise à jour
        $this->configureUpdateStatus($missionId, $newStatus, true);
        
        // Configuration du mock pour la journalisation
        $this->configureLogStatusChange($missionId, 'planifiee', $newStatus, $comment, 456);
        
        // Exécution
        $controller = new MissionStatusController($this->dbMock);
        $result = $controller->updateStatus($missionId, $newStatus, $comment);
        
        // Vérifications
        $this->assertTrue($result['success']);
        $this->assertEquals('Statut mis à jour avec succès', $result['message']);
        $this->assertEquals($missionId, $result['data']['mission_id']);
        $this->assertEquals('planifiee', $result['data']['previous_status']);
        $this->assertEquals($newStatus, $result['data']['new_status']);
        $this->assertEquals(456, $result['data']['log_id']);
        $this->assertTrue($result['data']['updated']);
    }
    
    /**
     * Test la mise à jour avec un commentaire uniquement (même statut)
     */
    public function testUpdateStatusCommentOnly(): void
    {
        // Données de test
        $missionId = 123;
        $status = 'en_cours';
        $comment = 'Mise à jour des informations';
        
        // Configuration du mock pour la vérification de la mission
        $this->configureMissionCheck($missionId, $status);
        
        // Configuration du mock pour la journalisation
        $this->configureLogStatusChange($missionId, $status, $status, $comment, 457);
        
        // Exécution
        $controller = new MissionStatusController($this->dbMock);
        $result = $controller->updateStatus($missionId, $status, $comment);
        
        // Vérifications
        $this->assertTrue($result['success']);
        $this->assertEquals('Commentaire ajouté avec succès', $result['message']);
        $this->assertEquals($missionId, $result['data']['mission_id']);
        $this->assertEquals($status, $result['data']['previous_status']);
        $this->assertEquals($status, $result['data']['new_status']);
        $this->assertFalse($result['data']['updated']);
    }
    
    /**
     * Test la transition non autorisée de statut
     */
    public function testUpdateStatusInvalidTransition(): void
    {
        // Données de test
        $missionId = 123;
        $currentStatus = 'terminee';
        $newStatus = 'en_cours';
        
        // Configuration du mock pour la vérification de la mission
        $this->configureMissionCheck($missionId, $currentStatus);
        
        // Exécution
        $controller = new MissionStatusController($this->dbMock);
        $result = $controller->updateStatus($missionId, $newStatus);
        
        // Vérifications
        $this->assertFalse($result['success']);
        $this->assertEquals(400, $result['error']['code']);
        $this->assertStringContainsString('Transition non autorisée', $result['error']['message']);
        $this->assertEquals('validation_error', $result['error']['type']);
    }
    
    /**
     * Test la validation d'un ID de mission invalide
     */
    public function testUpdateStatusInvalidMissionId(): void
    {
        // Données de test
        $missionId = 0; // ID invalide
        $newStatus = 'en_cours';
        
        // Exécution
        $controller = new MissionStatusController($this->dbMock);
        $result = $controller->updateStatus($missionId, $newStatus);
        
        // Vérifications
        $this->assertFalse($result['success']);
        $this->assertEquals(400, $result['error']['code']);
        $this->assertStringContainsString("L'ID de mission est invalide", $result['error']['message']);
        $this->assertEquals('validation_error', $result['error']['type']);
    }
    
    /**
     * Test la validation d'un statut invalide
     */
    public function testUpdateStatusInvalidStatus(): void
    {
        // Données de test
        $missionId = 123;
        $invalidStatus = 'statut_inexistant';
        
        // Configuration du mock pour la vérification de la mission
        $this->configureMissionCheck($missionId, 'planifiee');
        
        // Exécution
        $controller = new MissionStatusController($this->dbMock);
        $result = $controller->updateStatus($missionId, $invalidStatus);
        
        // Vérifications
        $this->assertFalse($result['success']);
        $this->assertEquals(400, $result['error']['code']);
        $this->assertStringContainsString("Le statut fourni n'est pas valide", $result['error']['message']);
        $this->assertEquals('validation_error', $result['error']['type']);
    }
    
    /**
     * Test la gestion d'une erreur de base de données lors de la mise à jour
     */
    public function testUpdateStatusDatabaseError(): void
    {
        // Données de test
        $missionId = 123;
        $newStatus = 'en_cours';
        
        // Configuration du mock pour la vérification de la mission
        $this->configureMissionCheck($missionId, 'planifiee');
        
        // Configuration du mock pour simuler une erreur PDO
        $this->dbMock->method('prepare')
            ->will($this->throwException(new PDOException("Erreur de base de données")));
        
        // Exécution
        $controller = new MissionStatusController($this->dbMock);
        $result = $controller->updateStatus($missionId, $newStatus);
        
        // Vérifications
        $this->assertFalse($result['success']);
        $this->assertEquals(500, $result['error']['code']);
        $this->assertEquals('database_error', $result['error']['type']);
        $this->assertStringContainsString('Une erreur est survenue lors de la mise à jour du statut', $result['error']['message']);
    }
}

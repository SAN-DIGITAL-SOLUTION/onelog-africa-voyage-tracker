<?php
/**
 * Tests unitaires pour le contrôleur MissionStatusController
 */

declare(strict_types=1);

namespace Tests\Unit\Controller;

use OneLogAfrica\VoyageTracker\Controller\MissionStatusController;
use PDO;
use PDOStatement;
use PHPUnit\Framework\TestCase;
use PHPUnit\Framework\MockObject\MockObject;

/**
 * Classe de test pour MissionStatusController
 */
class MissionStatusControllerTest extends TestCase
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
            'reference' => 'MIS-' . str_pad((string)$missionId, 6, '0', STR_PAD_LEFT),
        ];
        
        $query = "SELECT id, statut, reference FROM missions WHERE id = ?";
        if ($withLock) {
            $query .= " FOR UPDATE";
        }
        
        $this->dbMock->expects($this->once())
            ->method('prepare')
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
                 SET statut = ?, 
                     updated_at = NOW() 
                 WHERE id = ?";
                 
        $this->dbMock->expects($this->once())
            ->method('prepare')
            ->with($this->equalTo($query))
            ->willReturn($this->stmtMock);
            
        $this->stmtMock->expects($this->once())
            ->method('execute')
            ->with([$newStatus, $missionId])
            ->willReturn($success);
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
        $query = "INSERT INTO mission_status_logs 
                 (mission_id, ancien_statut, nouveau_statut, commentaire, created_at) 
                 VALUES (?, ?, ?, ?, NOW())";
                 
        $this->dbMock->expects($this->once())
            ->method('prepare')
            ->with($this->equalTo($query))
            ->willReturn($this->stmtMock);
            
        $this->stmtMock->expects($this->once())
            ->method('execute')
            ->with($this->callback(function($params) use ($missionId, $oldStatus, $newStatus, $comment) {
                return $params[0] === $missionId 
                    && $params[1] === $oldStatus 
                    && $params[2] === $newStatus 
                    && $params[3] === $comment;
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

        // Préparation des mocks pour chaque requête SQL
        $selectStmt = $this->createMock(PDOStatement::class);
        $selectStmt->expects($this->once())
            ->method('execute')
            ->with([$missionId])
            ->willReturn(true);
        $selectStmt->expects($this->once())
            ->method('fetch')
            ->with(PDO::FETCH_ASSOC)
            ->willReturn([
                'id' => $missionId,
                'statut' => 'planifiee',
                'reference' => 'MIS-000123',
            ]);

        $updateStmt = $this->createMock(PDOStatement::class);
        $updateStmt->expects($this->once())
            ->method('execute')
            ->with([$newStatus, $missionId])
            ->willReturn(true);

        $insertStmt = $this->createMock(PDOStatement::class);
        $insertStmt->expects($this->once())
            ->method('execute')
            ->with([$missionId, 'planifiee', $newStatus, $comment])
            ->willReturn(true);

        // Configuration du mock PDO pour router chaque requête SQL (callback)
        $this->dbMock->expects($this->exactly(3))
            ->method('prepare')
            ->with($this->anything())
            ->willReturnCallback(function($query) use ($selectStmt, $updateStmt, $insertStmt) {
                if (strpos($query, 'SELECT id, statut, reference FROM missions WHERE id = ? FOR UPDATE') === 0) {
                    return $selectStmt;
                }
                if (strpos($query, 'UPDATE missions') === 0) {
                    return $updateStmt;
                }
                if (strpos($query, 'INSERT INTO mission_status_logs') === 0) {
                    return $insertStmt;
                }
                throw new \RuntimeException('Requête SQL inattendue dans le mock prepare: '.$query);
            });

        // Transactions
        $this->dbMock->expects($this->once())
            ->method('beginTransaction');
        $this->dbMock->expects($this->once())
            ->method('commit');
        $this->dbMock->expects($this->never())
            ->method('rollBack');

        // lastInsertId pour la journalisation
        $this->dbMock->expects($this->once())
            ->method('lastInsertId')
            ->willReturn('456');

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

        // Préparation des mocks pour chaque requête SQL
        $selectStmt = $this->createMock(PDOStatement::class);
        $selectStmt->expects($this->once())
            ->method('execute')
            ->with([$missionId])
            ->willReturn(true);
        $selectStmt->expects($this->once())
            ->method('fetch')
            ->with(PDO::FETCH_ASSOC)
            ->willReturn([
                'id' => $missionId,
                'statut' => $status,
                'reference' => 'MIS-000123',
            ]);

        $insertStmt = $this->createMock(PDOStatement::class);
        $insertStmt->expects($this->once())
            ->method('execute')
            ->with([$missionId, $status, $status, $comment])
            ->willReturn(true);

        // Configuration du mock PDO pour router chaque requête SQL (callback)
        $this->dbMock->expects($this->exactly(2))
            ->method('prepare')
            ->with($this->anything())
            ->willReturnCallback(function($query) use ($selectStmt, $insertStmt) {
                if (strpos($query, 'SELECT id, statut, reference FROM missions WHERE id = ? FOR UPDATE') === 0) {
                    return $selectStmt;
                }
                if (strpos($query, 'INSERT INTO mission_status_logs') === 0) {
                    return $insertStmt;
                }
                throw new \RuntimeException('Requête SQL inattendue dans le mock prepare: '.$query);
            });

        // Transactions
        $this->dbMock->expects($this->once())
            ->method('beginTransaction');
        $this->dbMock->expects($this->once())
            ->method('commit');
        $this->dbMock->expects($this->never())
            ->method('rollBack');

        // lastInsertId pour la journalisation
        $this->dbMock->expects($this->once())
            ->method('lastInsertId')
            ->willReturn('457');

        // Exécution
        $controller = new MissionStatusController($this->dbMock);
        $result = $controller->updateStatus($missionId, $status, $comment);

        // Vérifications
        $this->assertTrue($result['success']);
        $this->assertEquals('Statut mis à jour avec succès', $result['message']);
        $this->assertEquals($missionId, $result['data']['mission_id']);
        $this->assertEquals($status, $result['data']['previous_status']);
        $this->assertEquals($status, $result['data']['new_status']);
        $this->assertEquals(457, $result['data']['log_id']);
        $this->assertFalse($result['data']['updated']);
    }
    
    /**
     * Test la transition non autorisée de statut
     */
    public function testUpdateStatusInvalidTransition(): void
    {
        // Données de test avec une transition non autorisée
        $missionId = 123;
        $newStatus = 'terminee'; // Transition directe de planifiée à terminée non autorisée
        $comment = 'Test transition non autorisée';
        
        // Configuration du mock pour la vérification de la mission
        $missionData = [
            'id' => $missionId,
            'statut' => 'planifiee',
            'reference' => 'MIS-' . str_pad((string)$missionId, 6, '0', STR_PAD_LEFT),
        ];
        $query = "SELECT id, statut, reference FROM missions WHERE id = ? FOR UPDATE";
        $this->dbMock->expects($this->once())
            ->method('prepare')
            ->willReturn($this->checkStmtMock);
        $this->checkStmtMock->expects($this->once())
            ->method('execute')
            ->with([$missionId])
            ->willReturn(true);
        $this->checkStmtMock->expects($this->once())
            ->method('fetch')
            ->with(PDO::FETCH_ASSOC)
            ->willReturn($missionData);
        
        // Simuler transaction ouverte 
        $this->dbMock->method('inTransaction')->willReturn(true);
            
        // Exécution
        $controller = new MissionStatusController($this->dbMock);
        $result = $controller->updateStatus($missionId, $newStatus, $comment);
    
        // Vérifications
        $this->assertFalse($result['success']);
        $this->assertStringContainsString('non autorisée', $result['message']);
        $this->assertEquals(400, $result['code']);
    }

    /**
     * Test la gestion d'une erreur de base de données lors de la mise à jour
     */
    public function testUpdateStatusDatabaseError(): void
    {
        // Données de test
        $missionId = 123;
        $newStatus = 'en_cours';
        
        // Configuration du mock pour la transaction
        $this->dbMock->expects($this->once())
            ->method('beginTransaction');
        
        // Configuration du mock pour la vérification de la mission
        $selectStmt = $this->createMock(PDOStatement::class);
        $selectStmt->method('execute')
            ->with([$missionId])
            ->willReturn(true);
        $selectStmt->method('fetch')
            ->willReturn([
                'id' => $missionId,
                'statut' => 'planifiee',
                'reference' => 'MIS-000123'
            ]);
        
        // Configuration du mock pour la mise à jour qui échouera
        $updateStmt = $this->createMock(PDOStatement::class);
        $updateStmt->method('execute')
            ->will($this->throwException(new \RuntimeException('Erreur de base de données lors de la mise à jour')));
        
        // Configuration du mock pour les appels à prepare()
        $this->dbMock->expects($this->exactly(2))
            ->method('prepare')
            ->willReturnCallback(function($query) use ($selectStmt, $updateStmt) {
                if (str_contains($query, 'SELECT')) {
                    return $selectStmt;
                }
                return $updateStmt;
            });
        
        // Simuler transaction ouverte et rollback attendu
        $this->dbMock->method('inTransaction')->willReturn(true);
        $this->dbMock->expects($this->once())
            ->method('rollBack');
        
        // Ne pas s'attendre à un commit
        $this->dbMock->expects($this->never())
            ->method('commit');
        
        // Ne pas s'attendre à lastInsertId car on n'atteindra jamais cette partie du code
        $this->dbMock->expects($this->never())
            ->method('lastInsertId');
        
        // Exécution
        $controller = new MissionStatusController($this->dbMock);
        $result = $controller->updateStatus($missionId, $newStatus);
        
        // Vérifications
        $this->assertFalse($result['success']);
        $this->assertStringContainsString('Erreur lors de la mise à jour', $result['message']);
        $this->assertEquals(500, $result['code']);
    }
}

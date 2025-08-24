<?php
/**
 * Tests unitaires pour la création de mission
 */

declare(strict_types=1);

use PHPUnit\Framework\TestCase;
use PHPUnit\Framework\MockObject\MockObject;

// Inclure l'autoloader de Composer
require_once __DIR__ . '/../../vendor/autoload.php';

/**
 * Classe de test pour la création de mission
 */
class CreateMissionTest extends TestCase
{
    /** @var PDO|MockObject */
    private $dbMock;
    
    /** @var PDOStatement|MockObject */
    private $stmtMock;
    
    protected function setUp(): void
    {
        parent::setUp();
        
        // Créer un mock PDO
        $this->dbMock = $this->createMock(PDO::class);
        
        // Créer un mock PDOStatement
        $this->stmtMock = $this->createMock(PDOStatement::class);
    }
    
    /**
     * Test la création réussie d'une mission
     */
    public function testCreateMissionSuccess(): void
    {
        // Données de test valides
        $missionData = [
            'transporteur_id' => 123,
            'departure' => 'Abidjan, Côte d\'Ivoire',
            'arrival' => 'Bouaké, Côte d\'Ivoire',
            'expected_start' => '2025-08-01 08:00:00',
            'expected_end' => '2025-08-01 14:00:00'
        ];
        
        // Configuration du mock pour la vérification du transporteur
        $checkStmt = $this->createMock(PDOStatement::class);
        $checkStmt->expects($this->once())
                 ->method('execute')
                 ->with([123])
                 ->willReturn(true);
        $checkStmt->expects($this->once())
                 ->method('rowCount')
                 ->willReturn(1);
        
        // Configuration du mock pour l'insertion
        $this->dbMock->expects($this->exactly(2))
                    ->method('prepare')
                    ->willReturnOnConsecutiveCalls(
                        $checkStmt,
                        $this->stmtMock
                    );
        
        $this->stmtMock->expects($this->once())
                      ->method('execute')
                      ->with([
                          ':transporteur_id' => 123,
                          ':depart' => 'Abidjan, Côte d\'Ivoire',
                          ':arrivee' => 'Bouaké, Côte d\'Ivoire',
                          ':date_debut_prevue' => '2025-08-01 08:00:00',
                          ':date_fin_prevue' => '2025-08-01 14:00:00'
                      ])
                      ->willReturn(true);
        
        $this->dbMock->method('lastInsertId')
                    ->willReturn('456');
        
        // Exécution
        $controller = new MissionController($this->dbMock);
        $result = $controller->createMission($missionData);
        
        // Vérifications
        $this->assertTrue($result['success']);
        $this->assertEquals('Mission créée avec succès', $result['message']);
        $this->assertEquals(456, $result['data']['mission_id']);
        $this->assertStringStartsWith('MIS-2025-', $result['data']['reference']);
        $this->assertEquals('planifiee', $result['data']['status']);
    }
    
    /**
     * Test la validation des données manquantes
     */
    public function testCreateMissionMissingFields(): void
    {
        // Données de test avec champs manquants
        $missionData = [
            'transporteur_id' => 123,
            // 'departure' manquant
            'arrival' => 'Bouaké, Côte d\'Ivoire',
            'expected_start' => '2025-08-01 08:00:00',
            'expected_end' => '2025-08-01 14:00:00'
        ];
        
        $controller = new MissionController($this->dbMock);
        $result = $controller->createMission($missionData);
        
        $this->assertFalse($result['success']);
        $this->assertEquals(400, $result['error']['code']);
        $this->assertStringContainsString('Le champ Lieu de départ est requis', $result['error']['message']);
        $this->assertEquals('validation_error', $result['error']['type']);
    }
    
    /**
     * Test la validation des dates invalides
     */
    public function testCreateMissionInvalidDates(): void
    {
        // Données de test avec date de fin antérieure à la date de début
        $missionData = [
            'transporteur_id' => 123,
            'departure' => 'Abidjan',
            'arrival' => 'Bouaké',
            'expected_start' => '2025-08-01 14:00:00', // Date de début après la fin
            'expected_end' => '2025-08-01 08:00:00'   // Date de fin avant le début
        ];
        
        // Configuration du mock pour la vérification du transporteur
        $checkStmt = $this->createMock(PDOStatement::class);
        $checkStmt->method('execute')
                 ->willReturn(true);
        $checkStmt->method('rowCount')
                 ->willReturn(1);
        
        $this->dbMock->method('prepare')
                    ->willReturn($checkStmt);
        
        $controller = new MissionController($this->dbMock);
        $result = $controller->createMission($missionData);
        
        $this->assertFalse($result['success']);
        $this->assertEquals(400, $result['error']['code']);
        $this->assertStringContainsString('La date de fin doit être postérieure à la date de début', $result['error']['message']);
        $this->assertEquals('validation_error', $result['error']['type']);
    }
    
    /**
     * Test l'échec de l'insertion en base de données
     */
    public function testCreateMissionDatabaseFailure(): void
    {
        // Données de test valides
        $missionData = [
            'transporteur_id' => 123,
            'departure' => 'Abidjan',
            'arrival' => 'Bouaké',
            'expected_start' => '2025-08-01 08:00:00',
            'expected_end' => '2025-08-01 14:00:00'
        ];
        
        // Configuration du mock pour la vérification du transporteur
        $checkStmt = $this->createMock(PDOStatement::class);
        $checkStmt->method('execute')
                 ->willReturn(true);
        $checkStmt->method('rowCount')
                 ->willReturn(1);
        
        // Configuration pour simuler une erreur d'insertion
        $this->dbMock->method('prepare')
                    ->willReturnOnConsecutiveCalls(
                        $checkStmt,
                        $this->stmtMock
                    );
        
        $this->stmtMock->method('execute')
                      ->willReturn(false);
        
        $controller = new MissionController($this->dbMock);
        $result = $controller->createMission($missionData);
        
        $this->assertFalse($result['success']);
        $this->assertEquals(500, $result['error']['code']);
        $this->assertEquals('Une erreur est survenue lors de la création de la mission', $result['error']['message']);
        $this->assertEquals('database_error', $result['error']['type']);
    }
    
    /**
     * Test la validation d'un transporteur inexistant
     */
    public function testCreateMissionNonExistentTransporter(): void
    {
        // Données de test avec un transporteur inexistant
        $missionData = [
            'transporteur_id' => 999, // ID inexistant
            'departure' => 'Abidjan',
            'arrival' => 'Bouaké',
            'expected_start' => '2025-08-01 08:00:00',
            'expected_end' => '2025-08-01 14:00:00'
        ];
        
        // Configuration du mock pour simuler un transporteur non trouvé
        $checkStmt = $this->createMock(PDOStatement::class);
        $checkStmt->method('execute')
                 ->with([999])
                 ->willReturn(true);
        $checkStmt->method('rowCount')
                 ->willReturn(0);
        
        $this->dbMock->method('prepare')
                    ->willReturn($checkStmt);
        
        $controller = new MissionController($this->dbMock);
        $result = $controller->createMission($missionData);
        
        $this->assertFalse($result['success']);
        $this->assertEquals(404, $result['error']['code']);
        $this->assertEquals('Le transporteur spécifié n\'existe pas', $result['error']['message']);
        $this->assertEquals('validation_error', $result['error']['type']);
    }
}


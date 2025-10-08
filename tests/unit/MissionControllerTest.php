<?php
declare(strict_types=1);
/**
 * Tests unitaires pour MissionController
 */
if (!defined('ENVIRONMENT')) {
    define('ENVIRONMENT', 'development');
}

use PHPUnit\Framework\TestCase;

// Inclure l'autoloader de Composer
require_once __DIR__ . '/../../vendor/autoload.php';

// Classe de test pour MissionController
class MissionControllerTest extends TestCase
{
    private $dbMock;
    private $controller;
    
    protected function setUp(): void
    {
        // Créer un mock PDO et PDOStatement
        $this->dbMock = $this->createMock(PDO::class);
        $this->controller = new MissionController($this->dbMock);
    }
    
    public function testCreateMissionWithValidData()
    {
        // Données de test
        $missionData = [
            'transporteur_id' => 123,
            'departure' => 'Abidjan',
            'arrival' => 'Bouaké',
            'expected_start' => '2025-08-01 08:00:00',
            'expected_end' => '2025-08-01 14:00:00'
        ];
        
        // Mock pour validation transporteur
        $stmtTransporteur = $this->createMock(PDOStatement::class);
        $stmtTransporteur->expects($this->once())
            ->method('execute')
            ->with([123])
            ->willReturn(true);
        $stmtTransporteur->method('rowCount')->willReturn(1);
        // Mock pour insertion mission
        $stmtInsert = $this->createMock(PDOStatement::class);
        $stmtInsert->expects($this->once())
            ->method('execute')
            ->with([
                ':transporteur_id' => 123,
                ':depart' => 'Abidjan',
                ':arrivee' => 'Bouaké',
                ':date_debut_prevue' => '2025-08-01 08:00:00',
                ':date_fin_prevue' => '2025-08-01 14:00:00'
            ])
            ->willReturn(true);
        // Configurer prepare pour retourner successivement les deux mocks
        $this->dbMock->expects($this->exactly(2))
            ->method('prepare')
            ->willReturnOnConsecutiveCalls($stmtTransporteur, $stmtInsert);
        // Configurer lastInsertId
        $this->dbMock->method('lastInsertId')->willReturn('456');
        
        // Exécuter la méthode à tester
        $result = $this->controller->createMission($missionData);
        
        // Vérifier le résultat
        $this->assertTrue($result['success']);
        $this->assertEquals('Mission créée avec succès', $result['message']);
        $this->assertEquals('456', $result['data']['mission_id']);
    }
    
    public function testCreateMissionWithMissingRequiredFields()
    {
        // Données de test avec des champs manquants
        $missionData = [
            'transporteur_id' => 123,
            // 'departure' manquant
            'arrival' => 'Bouaké',
            'expected_start' => '2025-08-01 08:00:00',
            'expected_end' => '2025-08-01 14:00:00'
        ];
        // Aucun mock PDO nécessaire ici
        $result = $this->controller->createMission($missionData);
        $this->assertFalse($result['success']);
        $this->assertArrayHasKey('error', $result);
        $this->assertStringContainsString('Lieu de départ', $result['error']['message']);
    }

    public function testCreateMissionWithEmptyTransporteurId()
    {
        // Données de test avec transporteur_id vide
        $missionData = [
            'transporteur_id' => '',
            'departure' => 'Abidjan',
            'arrival' => 'Bouaké',
            'expected_start' => '2025-08-01 08:00:00',
            'expected_end' => '2025-08-01 14:00:00'
        ];
        // Aucun mock PDO nécessaire ici
        $result = $this->controller->createMission($missionData);
        $this->assertFalse($result['success']);
        $this->assertArrayHasKey('error', $result);
        $this->assertEquals(422, $result['error']['code']);
        $this->assertStringContainsString('transporteur_id est requis', $result['error']['message']);
    }

    public function testCreateMissionWithMissingTransporteurId()
    {
        // Données de test sans transporteur_id
        $missionData = [
            'departure' => 'Abidjan',
            'arrival' => 'Bouaké',
            'expected_start' => '2025-08-01 08:00:00',
            'expected_end' => '2025-08-01 14:00:00'
        ];
        // Aucun mock PDO nécessaire ici
        $result = $this->controller->createMission($missionData);
        $this->assertFalse($result['success']);
        $this->assertArrayHasKey('error', $result);
        $this->assertEquals(422, $result['error']['code']);
        $this->assertStringContainsString('transporteur_id est requis', $result['error']['message']);
    }
    
    public function testCreateMissionWithDatabaseError()
    {
        // Données de test
        $missionData = [
            'transporteur_id' => 123,
            'departure' => 'Abidjan',
            'arrival' => 'Bouaké',
            'expected_start' => '2025-08-01 08:00:00',
            'expected_end' => '2025-08-01 14:00:00'
        ];
        
        // Mock pour validation transporteur
        $stmtTransporteur = $this->createMock(PDOStatement::class);
        $stmtTransporteur->expects($this->once())
            ->method('execute')
            ->with([123])
            ->willReturn(true);
        $stmtTransporteur->method('rowCount')->willReturn(1);
        // Mock pour insertion mission (échec)
        $stmtInsert = $this->createMock(PDOStatement::class);
        $stmtInsert->expects($this->once())
            ->method('execute')
            ->with([
                ':transporteur_id' => 123,
                ':depart' => 'Abidjan',
                ':arrivee' => 'Bouaké',
                ':date_debut_prevue' => '2025-08-01 08:00:00',
                ':date_fin_prevue' => '2025-08-01 14:00:00'
            ])
            ->willReturn(false);
        // Configurer prepare pour retourner successivement les deux mocks
        $this->dbMock->expects($this->exactly(2))
            ->method('prepare')
            ->willReturnOnConsecutiveCalls($stmtTransporteur, $stmtInsert);
        // Exécuter la méthode à tester
        $result = $this->controller->createMission($missionData);
        // Vérifier le résultat
        $this->assertFalse($result['success']);
        $this->assertEquals('Une erreur inattendue est survenue', $result['error']['message']);
    }
}

// Classe de contrôleur de mission pour les tests
require_once __DIR__ . '/../../php/create_mission.php';

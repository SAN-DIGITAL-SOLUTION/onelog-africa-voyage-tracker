#!/usr/bin/env node
/**
 * Script d'automatisation pour la mise à jour de la documentation OneLog Africa
 * Analyse le code source et met à jour automatiquement README.md et project-status.json
 * 
 * Usage: node scripts/update-documentation.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DocumentationUpdater {
    constructor() {
        this.rootPath = path.join(__dirname, '..');
        this.stats = {
            totalFiles: 0,
            reactComponents: 0,
            pages: 0,
            services: 0,
            hooks: 0,
            tests: 0,
            migrations: 0
        };
    }

    /**
     * Analyse récursivement les fichiers du projet
     */
    analyzeProject() {
        console.log('🔍 Analyse du projet en cours...');
        
        // Analyser src/
        this.analyzeDirectory(path.join(this.rootPath, 'src'));
        
        // Analyser supabase/migrations/
        this.analyzeMigrations();
        
        // Analyser tests/
        this.analyzeTests();
        
        console.log('📊 Statistiques du projet:', this.stats);
        return this.stats;
    }

    analyzeDirectory(dirPath) {
        if (!fs.existsSync(dirPath)) return;
        
        const items = fs.readdirSync(dirPath);
        
        items.forEach(item => {
            const fullPath = path.join(dirPath, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                this.analyzeDirectory(fullPath);
            } else if (stat.isFile()) {
                this.analyzeFile(fullPath);
            }
        });
    }

    analyzeFile(filePath) {
        const ext = path.extname(filePath);
        const fileName = path.basename(filePath);
        const relativePath = path.relative(this.rootPath, filePath);
        
        this.stats.totalFiles++;
        
        // Compter les composants React
        if ((ext === '.tsx' || ext === '.jsx') && !fileName.includes('.test.')) {
            this.stats.reactComponents++;
            
            // Compter les pages (normaliser les séparateurs de chemin)
            const normalizedPath = relativePath.replace(/\\/g, '/');
            if (normalizedPath.includes('src/pages/')) {
                this.stats.pages++;
            }
        }
        
        // Compter les services
        if (relativePath.replace(/\\/g, '/').includes('src/services/') && (ext === '.ts' || ext === '.js') && !fileName.includes('.test.')) {
            this.stats.services++;
        }
        
        // Compter les hooks
        if (relativePath.replace(/\\/g, '/').includes('src/hooks/') && (ext === '.ts' || ext === '.tsx') && !fileName.includes('.test.')) {
            this.stats.hooks++;
        }
    }

    analyzeMigrations() {
        const migrationsPath = path.join(this.rootPath, 'supabase', 'migrations');
        if (fs.existsSync(migrationsPath)) {
            const migrations = fs.readdirSync(migrationsPath).filter(f => f.endsWith('.sql'));
            this.stats.migrations = migrations.length;
        }
    }

    analyzeTests() {
        const testsPath = path.join(this.rootPath, '__tests__');
        if (fs.existsSync(testsPath)) {
            this.analyzeDirectory(testsPath);
        }
        
        // Compter aussi les tests dans src/
        const srcTests = this.countFilesRecursive(path.join(this.rootPath, 'src'), '.test.');
        this.stats.tests = srcTests;
    }

    countFilesRecursive(dirPath, pattern) {
        if (!fs.existsSync(dirPath)) return 0;
        
        let count = 0;
        const items = fs.readdirSync(dirPath);
        
        items.forEach(item => {
            const fullPath = path.join(dirPath, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                count += this.countFilesRecursive(fullPath, pattern);
            } else if (stat.isFile() && item.includes(pattern)) {
                count++;
            }
        });
        
        return count;
    }

    /**
     * Calcule le pourcentage d'avancement basé sur l'analyse
     */
    calculateProgress() {
        let progress = 0;
        
        // Critères d'évaluation basés sur l'état réel du projet OneLog Africa
        if (this.stats.pages >= 15) progress += 25; // Pages principales (25 pages détectées)
        else if (this.stats.pages >= 10) progress += 20;
        else if (this.stats.pages >= 5) progress += 15;
        
        if (this.stats.reactComponents >= 150) progress += 20; // Composants UI (193 détectés)
        else if (this.stats.reactComponents >= 100) progress += 15;
        else if (this.stats.reactComponents >= 50) progress += 10;
        
        if (this.stats.services >= 10) progress += 15; // Services métier
        else if (this.stats.services >= 5) progress += 10;
        
        if (this.stats.hooks >= 10) progress += 10; // Hooks personnalisés
        else if (this.stats.hooks >= 5) progress += 7;
        
        if (this.stats.migrations >= 15) progress += 20; // Base de données (19 migrations)
        else if (this.stats.migrations >= 10) progress += 15;
        
        if (this.stats.tests >= 20) progress += 10; // Tests (27 détectés)
        else if (this.stats.tests >= 10) progress += 7;
        else if (this.stats.tests >= 5) progress += 5;
        
        // Vérifications supplémentaires pour OneLog Africa
        if (fs.existsSync(path.join(this.rootPath, 'src', 'App.tsx'))) progress += 5;
        if (fs.existsSync(path.join(this.rootPath, 'package.json'))) progress += 2;
        if (fs.existsSync(path.join(this.rootPath, 'supabase', 'config.toml'))) progress += 3;
        
        // Bonus pour les fonctionnalités spécifiques OneLog
        if (fs.existsSync(path.join(this.rootPath, 'src', 'components', 'timeline'))) progress += 5;
        if (fs.existsSync(path.join(this.rootPath, 'php'))) progress += 5;
        
        return Math.min(progress, 100);
    }

    /**
     * Met à jour project-status.json
     */
    updateProjectStatus() {
        const statusPath = path.join(this.rootPath, 'project-status.json');
        let status = {};
        
        if (fs.existsSync(statusPath)) {
            status = JSON.parse(fs.readFileSync(statusPath, 'utf8'));
        }
        
        const progress = this.calculateProgress();
        
        // Mise à jour des données
        status.last_update = new Date().toISOString();
        status.progression = progress;
        status.status = progress >= 90 ? 'pre-production' : progress >= 70 ? 'beta' : 'alpha';
        
        // Mise à jour des statistiques
        status.statistics = {
            total_files: this.stats.totalFiles,
            react_components: this.stats.reactComponents,
            pages: this.stats.pages,
            services: this.stats.services,
            hooks: this.stats.hooks,
            tests: this.stats.tests,
            migrations: this.stats.migrations
        };
        
        fs.writeFileSync(statusPath, JSON.stringify(status, null, 2));
        console.log('✅ project-status.json mis à jour');
    }

    /**
     * Met à jour le badge d'avancement dans README.md
     */
    updateReadmeBadge() {
        const readmePath = path.join(this.rootPath, 'README.md');
        if (!fs.existsSync(readmePath)) return;
        
        let content = fs.readFileSync(readmePath, 'utf8');
        const progress = this.calculateProgress();
        
        // Mise à jour du badge d'avancement
        const badgeRegex = /!\[Avancement\]\(https:\/\/img\.shields\.io\/static\/v1\?label=Avancement&message=\d+%25&color=\w+&style=flat-square\)/;
        const color = progress >= 90 ? 'brightgreen' : progress >= 70 ? 'green' : progress >= 50 ? 'yellow' : 'red';
        const newBadge = `![Avancement](https://img.shields.io/static/v1?label=Avancement&message=${progress}%25&color=${color}&style=flat-square)`;
        
        content = content.replace(badgeRegex, newBadge);
        
        // Mise à jour de la section avancement
        const advancementRegex = /## ✅ Avancement Global : \*\*\d+ %\*\*.*/;
        const statusText = progress >= 90 ? 'Prêt pour Pré-Production' : progress >= 70 ? 'Bêta Avancée' : 'En Développement';
        const newAdvancement = `## ✅ Avancement Global : **${progress} %** - ${statusText}`;
        
        content = content.replace(advancementRegex, newAdvancement);
        
        // Mise à jour de la date
        const dateRegex = /\*Dernière mise à jour : .*/;
        const newDate = `*Dernière mise à jour : ${new Date().toISOString().split('T')[0]} - Documentation synchronisée automatiquement*`;
        content = content.replace(dateRegex, newDate);
        
        fs.writeFileSync(readmePath, content);
        console.log('✅ README.md mis à jour');
    }

    /**
     * Génère un rapport de mise à jour
     */
    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            progress: this.calculateProgress(),
            statistics: this.stats,
            recommendations: []
        };
        
        // Recommandations basées sur l'analyse
        if (this.stats.tests < 10) {
            report.recommendations.push('Augmenter la couverture de tests unitaires');
        }
        
        if (this.stats.services < 10) {
            report.recommendations.push('Développer plus de services métier');
        }
        
        const reportPath = path.join(this.rootPath, 'docs', 'auto-update-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log('📋 Rapport généré:', reportPath);
        
        return report;
    }

    /**
     * Exécute la mise à jour complète
     */
    run() {
        console.log('🚀 Démarrage de la mise à jour automatique de la documentation...');
        
        try {
            this.analyzeProject();
            this.updateProjectStatus();
            this.updateReadmeBadge();
            const report = this.generateReport();
            
            console.log('✅ Mise à jour terminée avec succès!');
            console.log(`📊 Avancement calculé: ${report.progress}%`);
            console.log(`📁 Fichiers analysés: ${this.stats.totalFiles}`);
            console.log(`⚛️ Composants React: ${this.stats.reactComponents}`);
            console.log(`📄 Pages: ${this.stats.pages}`);
            console.log(`🔧 Services: ${this.stats.services}`);
            console.log(`🪝 Hooks: ${this.stats.hooks}`);
            console.log(`🗄️ Migrations: ${this.stats.migrations}`);
            
            if (report.recommendations.length > 0) {
                console.log('💡 Recommandations:');
                report.recommendations.forEach(rec => console.log(`  - ${rec}`));
            }
            
        } catch (error) {
            console.error('❌ Erreur lors de la mise à jour:', error.message);
            console.error(error.stack);
            process.exit(1);
        }
    }
}

// Exécution si appelé directement
const currentFile = fileURLToPath(import.meta.url);
if (process.argv[1] === currentFile) {
    const updater = new DocumentationUpdater();
    updater.run();
}

export default DocumentationUpdater;

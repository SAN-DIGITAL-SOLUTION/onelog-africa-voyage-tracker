/**
 * Script pour exécuter les tests de performance Lighthouse
 * sur la page Timeline Optimisée
 * 
 * Prérequis :
 * 1. Avoir Node.js installé
 * 2. Installer Lighthouse globalement : npm install -g lighthouse
 * 3. Démarrer l'application en mode développement : npm run dev
 * 
 * Utilisation :
 * node scripts/run-lighthouse-tests.js
 */

const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

// Configuration
const config = {
  url: 'http://localhost:5173/timeline-optimized',
  outputDir: './lighthouse-reports',
  runs: 3,
  throttling: {
    // Simulation de connexion Fast 3G
    rttMs: 150,
    throughputKbps: 1.6 * 1024,
    cpuSlowdownMultiplier: 4,
    requestLatencyMs: 150 * 3.75,
    downloadThroughputKbps: 1.6 * 1024 * 0.9,
    uploadThroughputKbps: 750 * 0.9,
  },
  chromeFlags: ['--headless', '--disable-gpu', '--no-sandbox'],
};

// Créer le répertoire de sortie s'il n'existe pas
if (!fs.existsSync(config.outputDir)) {
  fs.mkdirSync(config.outputDir, { recursive: true });
}

// Fonction pour formater la date
function formatDate(date = new Date()) {
  return date.toISOString()
    .replace(/[:.]/g, '-')
    .replace('T', '_')
    .slice(0, -5);
}

// Fonction pour exécuter un test Lighthouse
async function runLighthouse(url, options = {}) {
  console.log(`Démarrage du test Lighthouse pour ${url}`);
  
  // Lancer Chrome
  const chrome = await chromeLauncher.launch({
    chromeFlags: config.chromeFlags
  });
  
  // Configuration de Lighthouse
  const lighthouseOptions = {
    port: chrome.port,
    output: 'json', // ou 'html' pour un rapport visuel
    logLevel: 'info',
    throttling: config.throttling,
    ...options
  };
  
  // Exécuter Lighthouse
  const runnerResult = await lighthouse(url, lighthouseOptions);
  
  // Fermer Chrome
  await chrome.kill();
  
  return runnerResult;
}

// Fonction pour sauvegarder les résultats
function saveResults(results, runNumber) {
  const timestamp = formatDate();
  const hostname = new URL(config.url).hostname;
  const prefix = `lighthouse-${hostname}-${timestamp}-run${runNumber}`;
  
  // Sauvegarder le rapport JSON
  const jsonPath = path.join(config.outputDir, `${prefix}.report.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(results.lhr, null, 2));
  console.log(`Rapport JSON sauvegardé : ${jsonPath}`);
  
  // Générer un rapport HTML si nécessaire
  if (results.report) {
    const htmlPath = path.join(config.outputDir, `${prefix}.report.html`);
    fs.writeFileSync(htmlPath, results.report);
    console.log(`Rapport HTML sauvegardé : ${htmlPath}`);
  }
  
  return {
    json: jsonPath,
    html: results.report ? path.join(config.outputDir, `${prefix}.report.html`) : null,
    metrics: {
      performance: results.lhr.categories.performance.score * 100,
      accessibility: results.lhr.categories.accessibility.score * 100,
      bestPractices: results.lhr.categories['best-practices'].score * 100,
      seo: results.lhr.categories.seo.score * 100,
      pwa: results.lhr.categories.pwa ? results.lhr.categories.pwa.score * 100 : 0,
      firstContentfulPaint: results.lhr.audits['first-contentful-paint'].numericValue,
      speedIndex: results.lhr.audits['speed-index'].numericValue,
      largestContentfulPaint: results.lhr.audits['largest-contentful-paint'].numericValue,
      timeToInteractive: results.lhr.audits['interactive'].numericValue,
      totalBlockingTime: results.lhr.audits['total-blocking-time'].numericValue,
      cumulativeLayoutShift: results.lhr.audits['cumulative-layout-shift'].numericValue,
    }
  };
}

// Fonction pour générer un résumé des résultats
function generateSummary(results) {
  const summary = {
    runs: results.length,
    average: {
      performance: 0,
      accessibility: 0,
      bestPractices: 0,
      seo: 0,
      pwa: 0,
      firstContentfulPaint: 0,
      speedIndex: 0,
      largestContentfulPaint: 0,
      timeToInteractive: 0,
      totalBlockingTime: 0,
      cumulativeLayoutShift: 0,
    },
    runs: results.map(run => ({
      performance: run.metrics.performance,
      accessibility: run.metrics.accessibility,
      bestPractices: run.metrics.bestPractices,
      seo: run.metrics.seo,
      pwa: run.metrics.pwa,
      firstContentfulPaint: run.metrics.firstContentfulPaint,
      speedIndex: run.metrics.speedIndex,
      largestContentfulPaint: run.metrics.largestContentfulPaint,
      timeToInteractive: run.metrics.timeToInteractive,
      totalBlockingTime: run.metrics.totalBlockingTime,
      cumulativeLayoutShift: run.metrics.cumulativeLayoutShift,
      report: run.html
    }))
  };
  
  // Calculer les moyennes
  const metrics = Object.keys(summary.average);
  metrics.forEach(metric => {
    const values = results.map(run => run.metrics[metric]);
    summary.average[metric] = values.reduce((a, b) => a + b, 0) / values.length;
  });
  
  return summary;
}

// Fonction principale
async function main() {
  const results = [];
  
  try {
    console.log(`Démarrage de ${config.runs} tests Lighthouse...`);
    
    // Exécuter plusieurs fois pour avoir une moyenne
    for (let i = 0; i < config.runs; i++) {
      console.log(`\n--- Exécution ${i + 1}/${config.runs} ---`);
      
      // Exécuter le test
      const { lhr, report } = await runLighthouse(config.url);
      
      // Sauvegarder les résultats
      const saved = saveResults({ lhr, report }, i + 1);
      results.push(saved);
      
      // Afficher un résumé
      console.log(`\nRésumé de l'exécution ${i + 1}:`);
      console.log(`- Performance: ${saved.metrics.performance.toFixed(0)}/100`);
      console.log(`- Accessibilité: ${saved.metrics.accessibility.toFixed(0)}/100`);
      console.log(`- Bonnes pratiques: ${saved.metrics.bestPractices.toFixed(0)}/100`);
      console.log(`- SEO: ${saved.metrics.seo.toFixed(0)}/100`);
      console.log(`- Premier affichage: ${(saved.metrics.firstContentfulPaint / 1000).toFixed(2)}s`);
      console.log(`- Indice de vitesse: ${(saved.metrics.speedIndex / 1000).toFixed(2)}s`);
      console.log(`- Temps d'interactivité: ${(saved.metrics.timeToInteractive / 1000).toFixed(2)}s`);
      
      // Attendre un peu entre les tests
      if (i < config.runs - 1) {
        console.log('\nAttente avant le prochain test...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
    
    // Générer un résumé global
    const summary = generateSummary(results);
    const summaryPath = path.join(config.outputDir, `summary-${formatDate()}.json`);
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    
    console.log('\n=== RÉSULTATS FINAUX ===');
    console.log(`Moyenne sur ${summary.runs} exécutions :`);
    console.log(`- Performance: ${summary.average.performance.toFixed(0)}/100`);
    console.log(`- Accessibilité: ${summary.average.accessibility.toFixed(0)}/100`);
    console.log(`- Bonnes pratiques: ${summary.average.bestPractices.toFixed(0)}/100`);
    console.log(`- SEO: ${summary.average.seo.toFixed(0)}/100`);
    console.log(`- Premier affichage: ${(summary.average.firstContentfulPaint / 1000).toFixed(2)}s`);
    console.log(`- Indice de vitesse: ${(summary.average.speedIndex / 1000).toFixed(2)}s`);
    console.log(`- Temps d'interactivité: ${(summary.average.timeToInteractive / 1000).toFixed(2)}s`);
    console.log(`- Temps de blocage total: ${summary.average.totalBlockingTime.toFixed(0)}ms`);
    console.log(`\nRapports détaillés disponibles dans : ${path.resolve(config.outputDir)}`);
    
  } catch (error) {
    console.error('Erreur lors de l\'exécution des tests Lighthouse:', error);
    process.exit(1);
  }
}

// Démarrer le script
main();

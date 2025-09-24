#!/usr/bin/env node
/**
 * Script de synchronisation de la roadmap avec les issues GitHub
 * 
 * Fonctionnalités :
 * - Lit le fichier ROADMAP_SUIVI_AUTO.md
 * - Récupère les issues GitHub du projet
 * - Met à jour les statuts et commentaires
 * - Met à jour le badge de progression
 * - Commit et push les changements
 */

const fs = require('fs').promises;
const path = require('path');
const { Octokit } = require('@octokit/rest');
const config = require('../config');
require('dotenv').config();

// Vérification des variables d'environnement
if (!process.env.GITHUB_TOKEN) {
  console.error('❌ Erreur: GITHUB_TOKEN non défini dans .env');
  process.exit(1);
}

// Initialisation du client GitHub
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
  userAgent: 'OneLog-Africa-Roadmap-Updater',
  timeZone: 'Europe/Paris',
});

/**
 * Lit le contenu du fichier de roadmap
 */
async function readRoadmapFile() {
  try {
    const filePath = path.join(process.cwd(), config.paths.roadmap);
    return await fs.readFile(filePath, 'utf-8');
  } catch (error) {
    console.error('❌ Erreur lors de la lecture du fichier de roadmap:', error);
    process.exit(1);
  }
}

/**
 * Écrit le contenu mis à jour dans le fichier de roadmap
 */
async function writeRoadmapFile(content) {
  try {
    const filePath = path.join(process.cwd(), config.paths.roadmap);
    await fs.writeFile(filePath, content, 'utf-8');
    console.log('✅ Roadmap mise à jour avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de l\'écriture du fichier de roadmap:', error);
    process.exit(1);
  }
}

/**
 * Récupère les issues GitHub avec les labels correspondants
 */
async function fetchGitHubIssues() {
  try {
    console.log('🔄 Récupération des issues GitHub...');
    
    const { data: issues } = await octokit.issues.listForRepo({
      owner: config.github.owner,
      repo: config.github.repo,
      state: 'all',
      per_page: 100,
      sort: 'updated',
      direction: 'desc',
    });

    console.log(`✅ ${issues.length} issues récupérées`);
    return issues;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des issues:', error);
    process.exit(1);
  }
}

/**
 * Met à jour le contenu de la roadmap avec les données des issues
 */
function updateRoadmapContent(roadmapContent, issues) {
  console.log('🔄 Mise à jour du contenu de la roadmap...');
  
  // Créer un index des issues par titre pour une recherche plus rapide
  const issuesByTitle = {};
  issues.forEach(issue => {
    if (issue.title) {
      issuesByTitle[issue.title.trim()] = issue;
    }
  });

  // Mettre à jour les lignes de la roadmap
  const lines = roadmapContent.split('\n');
  const updatedLines = lines.map(line => {
    // Recherche des lignes contenant des tâches
    const taskMatch = line.match(/^- \[([ x])\] (.+?)(?:\s*\(#(\d+)\))?$/);
    
    if (taskMatch) {
      const [_, status, title, issueNumber] = taskMatch;
      const issue = issuesByTitle[title] || (issueNumber && issues.find(i => i.number === parseInt(issueNumber)));
      
      if (issue) {
        const newStatus = issue.state === 'closed' ? 'x' : ' ';
        const newLine = `- [${newStatus}] ${title} (#${issue.number})`;
        
        // Ajouter des commentaires si l'issue a des étiquettes
        const labels = issue.labels.map(l => l.name).join(', ');
        const comments = [];
        
        if (labels) comments.push(`Labels: ${labels}`);
        if (issue.assignee) comments.push(`Assigné à: @${issue.assignee.login}`);
        if (issue.closed_at) comments.push(`Fermé le: ${new Date(issue.closed_at).toLocaleDateString()}`);
        
        return comments.length > 0 
          ? `${newLine}  \n  > ${comments.join(' | ')}` 
          : newLine;
      }
    }
    
    return line;
  });

  return updatedLines.join('\n');
}

/**
 * Met à jour le badge de progression dans le README
 */
async function updateProgressBadge(progress) {
  try {
    const readmePath = path.join(process.cwd(), config.paths.readme);
    let readmeContent = await fs.readFile(readmePath, 'utf-8');
    
    const badgeUrl = `${config.badge.baseUrl}?label=${encodeURIComponent(config.badge.label)}&message=${progress}%25&color=${config.badge.color}`;
    const badgeMarkdown = `![${config.badge.label}](${badgeUrl})`;
    
    // Mettre à jour ou ajouter le badge
    const badgeRegex = /!\[.*?\]\(.*?\)/;
    if (badgeRegex.test(readmeContent)) {
      readmeContent = readmeContent.replace(badgeRegex, badgeMarkdown);
    } else {
      // Ajouter le badge en haut du README
      readmeContent = `${badgeMarkdown}\n\n${readmeContent}`;
    }
    
    await fs.writeFile(readmePath, readmeContent, 'utf-8');
    console.log(`✅ Badge de progression mis à jour: ${progress}%`);
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour du badge:', error);
    return false;
  }
}

/**
 * Calcule la progression globale à partir de la roadmap
 */
function calculateProgress(roadmapContent) {
  const lines = roadmapContent.split('\n');
  let totalTasks = 0;
  let completedTasks = 0;

  lines.forEach(line => {
    const taskMatch = line.match(/^- \[([ x])\](.+)/);
    if (taskMatch) {
      totalTasks++;
      if (taskMatch[1].trim() === 'x') {
        completedTasks++;
      }
    }
  });

  return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
}

/**
 * Commit et push les changements
 */
async function commitAndPushChanges() {
  try {
    const { execSync } = require('child_process');
    
    // Vérifier s'il y a des changements
    const status = execSync('git status --porcelain').toString().trim();
    
    if (!status) {
      console.log('ℹ️ Aucun changement à committer');
      return;
    }
    
    // Configurer git si nécessaire
    if (!process.env.GIT_AUTHOR_NAME || !process.env.GIT_AUTHOR_EMAIL) {
      execSync('git config --global user.name "OneLog Africa Bot"');
      execSync('git config --global user.email "bot@onelog-africa.com"');
    }
    
    // Ajouter, committer et pousser les changements
    execSync('git add .');
    execSync('git commit -m "🔧 Mise à jour automatique de la roadmap et du badge de progression"');
    execSync(`git push origin ${config.github.defaultBranch}`);
    
    console.log('✅ Changements commités et poussés avec succès');
  } catch (error) {
    console.error('❌ Erreur lors du commit des changements:', error.message);
    process.exit(1);
  }
}

/**
 * Point d'entrée principal
 */
async function main() {
  console.log('🚀 Démarrage de la mise à jour de la roadmap...');
  
  try {
    // 1. Lire la roadmap actuelle
    const roadmapContent = await readRoadmapFile();
    
    // 2. Récupérer les issues GitHub
    const issues = await fetchGitHubIssues();
    
    // 3. Mettre à jour le contenu de la roadmap
    const updatedContent = updateRoadmapContent(roadmapContent, issues);
    
    // 4. Calculer et mettre à jour la progression
    const progress = calculateProgress(updatedContent);
    await updateProgressBadge(progress);
    
    // 5. Écrire les modifications
    await writeRoadmapFile(updatedContent);
    
    // 6. Commit et push les changements
    await commitAndPushChanges();
    
    console.log('✨ Mise à jour terminée avec succès !');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur critique:', error);
    process.exit(1);
  }
}

// Démarrer le script
main();

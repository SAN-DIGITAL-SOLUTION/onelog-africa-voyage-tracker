#!/usr/bin/env node
/**
 * Script d'export de la roadmap vers Notion
 * 
 * Fonctionnalités :
 * - Lit le fichier ROADMAP_SUIVI_AUTO.md
 * - Parse le contenu en une structure de données
 * - Synchronise avec une base de données Notion
 * - Crée/met à jour les pages Notion en conséquence
 */

const { Client } = require('@notionhq/client');
const fs = require('fs').promises;
const path = require('path');
const config = require('../config');
require('dotenv').config();

// Vérification des variables d'environnement
if (!process.env.NOTION_API_KEY) {
  console.error('❌ Erreur: NOTION_API_KEY non défini dans .env');
  process.exit(1);
}

if (!process.env.NOTION_DATABASE_ID) {
  console.error('❌ Erreur: NOTION_DATABASE_ID non défini dans .env');
  process.exit(1);
}

// Initialisation du client Notion
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

/**
 * Parse le contenu du fichier de roadmap en une structure de données
 */
async function parseRoadmapContent() {
  try {
    const filePath = path.join(process.cwd(), config.paths.roadmap);
    const content = await fs.readFile(filePath, 'utf-8');
    
    const lines = content.split('\n');
    const sections = [];
    let currentSection = null;
    
    for (const line of lines) {
      // Détection des sections (##)
      const sectionMatch = line.match(/^##\s+(.+)/);
      if (sectionMatch) {
        if (currentSection) sections.push({ ...currentSection });
        currentSection = {
          title: sectionMatch[1].trim(),
          tasks: []
        };
        continue;
      }
      
      // Détection des tâches (- [ ] ou - [x])
      const taskMatch = line.match(/^- \[([ x])\](.+?)(?:\(#(\d+)\))?/);
      if (taskMatch && currentSection) {
        const [_, status, title, issueNumber] = taskMatch;
        currentSection.tasks.push({
          title: title.trim(),
          completed: status === 'x',
          issueNumber: issueNumber ? parseInt(issueNumber) : null
        });
      }
    }
    
    // Ajouter la dernière section si elle existe
    if (currentSection) {
      sections.push(currentSection);
    }
    
    return sections;
  } catch (error) {
    console.error('❌ Erreur lors du parsing de la roadmap:', error);
    process.exit(1);
  }
}

/**
 * Récupère les pages existantes dans la base de données Notion
 */
async function getExistingPages() {
  try {
    console.log('🔄 Récupération des pages existantes dans Notion...');
    
    const response = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID,
    });
    
    const pages = {};
    response.results.forEach(page => {
      const title = page.properties?.Name?.title?.[0]?.plain_text;
      if (title) {
        pages[title] = page.id;
      }
    });
    
    console.log(`✅ ${Object.keys(pages).length} pages trouvées`);
    return pages;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des pages Notion:', error);
    process.exit(1);
  }
}

/**
 * Crée ou met à jour une page dans Notion
 */
async function createOrUpdatePage(section, existingPages) {
  try {
    const { title, tasks } = section;
    const pageId = existingPages[title];
    
    const properties = {
      Name: {
        title: [
          {
            text: {
              content: title,
            },
          },
        ],
      },
      'Tâches complétées': {
        number: tasks.filter(t => t.completed).length,
      },
      'Total des tâches': {
        number: tasks.length,
      },
      'Pourcentage': {
        number: tasks.length > 0 
          ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) 
          : 0,
      },
    };
    
    const children = [
      {
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: 'Tâches',
              },
            },
          ],
        },
      },
      {
        object: 'block',
        type: 'to_do',
        to_do: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: ' ', // Contenu vide pour les cases à cocher
              },
            },
          ],
          children: tasks.map(task => ({
            object: 'block',
            type: 'to_do',
            to_do: {
              rich_text: [
                {
                  type: 'text',
                  text: {
                    content: task.title,
                    link: task.issueNumber 
                      ? { url: `https://github.com/${config.github.owner}/${config.github.repo}/issues/${task.issueNumber}` }
                      : null,
                  },
                },
              ],
              checked: task.completed,
            },
          })),
        },
      },
    ];
    
    if (pageId) {
      // Mise à jour de la page existante
      await notion.pages.update({
        page_id: pageId,
        properties,
      });
      
      // Suppression du contenu existant
      const blocks = await notion.blocks.children.list({
        block_id: pageId,
        page_size: 100,
      });
      
      for (const block of blocks.results) {
        await notion.blocks.delete({
          block_id: block.id,
        });
      }
      
      // Ajout du nouveau contenu
      for (const block of children) {
        await notion.blocks.children.append({
          block_id: pageId,
          children: [block],
        });
      }
      
      console.log(`🔄 Page mise à jour: ${title}`);
      return { id: pageId, created: false };
    } else {
      // Création d'une nouvelle page
      const parent = process.env.NOTION_PARENT_PAGE_ID
        ? { page_id: process.env.NOTION_PARENT_PAGE_ID }
        : { database_id: process.env.NOTION_DATABASE_ID };
      
      const newPage = await notion.pages.create({
        parent,
        properties,
        children,
      });
      
      console.log(`✅ Nouvelle page créée: ${title}`);
      return { id: newPage.id, created: true };
    }
  } catch (error) {
    console.error(`❌ Erreur lors de la création/mise à jour de la page ${section.title}:`, error);
    return { id: null, created: false, error };
  }
}

/**
 * Point d'entrée principal
 */
async function main() {
  console.log('🚀 Démarrage de l\'export vers Notion...');
  
  try {
    // 1. Parser le contenu de la roadmap
    const sections = await parseRoadmapContent();
    console.log(`📋 ${sections.length} sections trouvées dans la roadmap`);
    
    // 2. Récupérer les pages existantes dans Notion
    const existingPages = await getExistingPages();
    
    // 3. Créer ou mettre à jour chaque section dans Notion
    let created = 0;
    let updated = 0;
    let errors = 0;
    
    for (const section of sections) {
      const result = await createOrUpdatePage(section, existingPages);
      if (result.error) {
        errors++;
      } else if (result.created) {
        created++;
      } else {
        updated++;
      }
    }
    
    // 4. Afficher un résumé
    console.log('\n✨ Export terminé avec succès !');
    console.log(`✅ ${created} nouvelles pages créées`);
    console.log(`🔄 ${updated} pages mises à jour`);
    if (errors > 0) {
      console.error(`❌ ${errors} erreurs rencontrées`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur critique lors de l\'export vers Notion:', error);
    process.exit(1);
  }
}

// Démarrer le script
main();

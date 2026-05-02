#!/usr/bin/env node

/**
 * Fix Project Visibility Issue
 * 
 * Updates all 5 strategic projects to have site_id: 3 (Denick site)
 * This fixes the filtering issue where projects weren't showing in the UI
 */

const API_BASE = process.env.API_BASE || 'http://localhost:3001'
const API_TOKEN = process.env.API_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwibmFtZSI6Ik1DUCIsImlhdCI6MTc3NzI0ODM1OCwiZXhwIjoxODA4Nzg0MzU4fQ.Wmym8ZoxeqD0B8o6xHGKNr2X6vvAGwSQVIEDpvHTaJY'

async function api(path, options = {}) {
  const res = await fetch(`${API_BASE}/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_TOKEN}`,
      ...(options.headers || {}),
    },
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(`API Error: ${data.error || res.statusText}`)
  }
  return data
}

async function main() {
  console.log('🔧 Fixing Project Visibility Issue...\n')
  console.log('📋 Projects to update: 26, 27, 28, 29, 30')
  console.log('🎯 Setting site_id to: 3 (Denick)\n')

  const projectIds = [26, 27, 28, 29, 30]
  const siteId = 3

  // First, get all projects to find the ones we need to update
  const allProjects = await api(`/pt/projects`)
  const projectMap = {}
  allProjects.forEach(p => {
    projectMap[p.id] = p
  })

  for (const projectId of projectIds) {
    try {
      console.log(`⏳ Updating Project #${projectId}...`)
      
      const project = projectMap[projectId]
      if (!project) {
        console.error(`❌ Project #${projectId} not found`)
        continue
      }
      
      // Update with site_id - include all required fields
      const result = await api(`/pt/projects/${projectId}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: project.name,
          description: project.description,
          status: project.status,
          shirt_size: project.shirt_size,
          site_id: siteId,
        }),
      })
      
      console.log(`✅ Project #${projectId} updated successfully`)
      console.log(`   Name: ${project.name}`)
      console.log(`   Site ID: ${siteId}\n`)
    } catch (error) {
      console.error(`❌ Error updating Project #${projectId}:`, error.message)
    }
  }

  console.log('🎉 All projects updated!')
  console.log('\n📱 Next steps:')
  console.log('1. Open Denick: http://localhost:5174')
  console.log('2. Navigate to Project Tracker')
  console.log('3. You should now see all 5 projects\n')
}

main().catch(console.error)

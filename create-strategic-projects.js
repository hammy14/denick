#!/usr/bin/env node

/**
 * Create Strategic Projects on Denick Project Tracker
 * 
 * This script creates 5 projects based on the strategic documents:
 * 1. Workspace Audit & Strategic Planning
 * 2. Production Deployment & Stabilization
 * 3. Performance Optimization & Enhancement
 * 4. Infrastructure Consolidation & Integration
 * 5. GoDaddy Cloud Migration
 * 
 * Each project includes detailed tasks with estimates and descriptions.
 */

const API_BASE = process.env.API_BASE || 'http://localhost:3001'
const API_TOKEN = process.env.API_TOKEN || ''

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

const projects = [
  {
    name: 'Workspace Audit & Strategic Planning',
    description: 'Comprehensive audit of all 5 workspace projects and creation of strategic roadmap for production deployment and GoDaddy migration',
    status: 'Completed',
    shirt_size: 'L',
    tasks: [
      {
        title: 'Audit All 5 Projects',
        description: 'Review Pitch Passport, CardSparky, Denick, Serial Killers, and Docs projects. Document current state, architecture, and issues.',
        type: 'Enhancement',
        status: 'Done',
        priority: 'Critical',
        shirt_size: 'L',
        est_hours: 8,
        actual_hours: 8,
      },
      {
        title: 'Create QUICK_START_GUIDE.md',
        description: 'Create quick reference guide with project status dashboard, immediate next steps, and strategic roadmap.',
        type: 'Enhancement',
        status: 'Done',
        priority: 'High',
        shirt_size: 'M',
        est_hours: 4,
        actual_hours: 4,
      },
      {
        title: 'Create STRATEGIC_MASTER_PLAN.md',
        description: 'Create comprehensive strategic roadmap including current state analysis, phased approach, GoDaddy migration strategy, and risk assessment.',
        type: 'Enhancement',
        status: 'Done',
        priority: 'High',
        shirt_size: 'L',
        est_hours: 6,
        actual_hours: 6,
      },
      {
        title: 'Create AUDIT_SUMMARY.md',
        description: 'Create detailed audit findings with project inventory, architecture overview, issues status, and recommendations.',
        type: 'Enhancement',
        status: 'Done',
        priority: 'High',
        shirt_size: 'M',
        est_hours: 5,
        actual_hours: 5,
      },
      {
        title: 'Create INDEX_STRATEGIC_DOCUMENTS.md',
        description: 'Create navigation guide for all strategic documents with reading paths for different audiences.',
        type: 'Enhancement',
        status: 'Done',
        priority: 'Medium',
        shirt_size: 'S',
        est_hours: 3,
        actual_hours: 3,
      },
      {
        title: 'Create COMPLETION_REPORT.md',
        description: 'Create audit completion summary with all deliverables, findings, and next steps.',
        type: 'Enhancement',
        status: 'Done',
        priority: 'Medium',
        shirt_size: 'S',
        est_hours: 2,
        actual_hours: 2,
      },
    ],
  },
  {
    name: 'Production Deployment & Stabilization',
    description: 'Phase 1: Get all projects to production-ready state. Launch Pitch Passport, harden CardSparky, complete Serial Killers Phase 6, and finish Denick documentation.',
    status: 'Active',
    shirt_size: 'L',
    tasks: [
      {
        title: 'Launch Pitch Passport',
        description: 'Deploy Pitch Passport frontend to Vercel and backend to DigitalOcean/AWS. Configure DNS, SSL, and monitoring.',
        type: 'Enhancement',
        status: 'Backlog',
        priority: 'Critical',
        shirt_size: 'L',
        est_hours: 8,
        plan: 'Deploy frontend to Vercel, backend to DigitalOcean/AWS, configure DNS and SSL, set up monitoring (Sentry, GA4)',
      },
      {
        title: 'Harden CardSparky',
        description: 'Complete DB password rotation, run security audit, verify all 40+ endpoints, load test API, set up rate limiting.',
        type: 'Enhancement',
        status: 'Backlog',
        priority: 'Critical',
        shirt_size: 'M',
        est_hours: 6,
        plan: 'Complete DB password rotation, run full security audit, verify all endpoints, load test, set up rate limiting',
      },
      {
        title: 'Complete Serial Killers Phase 6',
        description: 'Complete documentation tasks, deploy to production, set up monitoring, create deployment runbook.',
        type: 'Enhancement',
        status: 'Backlog',
        priority: 'High',
        shirt_size: 'L',
        est_hours: 10,
        plan: 'Complete Phase 6 documentation tasks, deploy to production, set up monitoring, create runbook',
      },
      {
        title: 'Finish Denick Documentation',
        description: 'Complete documentation UI components (Tasks 3.2-3.8), integrate into admin portal, test end-to-end, deploy.',
        type: 'Enhancement',
        status: 'Backlog',
        priority: 'High',
        shirt_size: 'L',
        est_hours: 12,
        plan: 'Complete Tasks 3.2-3.8, integrate components, test documentation linking, deploy to production',
      },
      {
        title: 'Verify All Deployments',
        description: 'Verify all services operational, check performance metrics, monitor error rates, validate SSL certificates.',
        type: 'Enhancement',
        status: 'Backlog',
        priority: 'High',
        shirt_size: 'M',
        est_hours: 4,
        plan: 'Verify all services, check metrics, monitor errors, validate SSL',
      },
    ],
  },
  {
    name: 'Performance Optimization & Enhancement',
    description: 'Phase 2: Optimize performance and add missing features. Performance optimization, SEO enhancement, monitoring setup, and documentation completion.',
    status: 'Backlog',
    shirt_size: 'L',
    tasks: [
      {
        title: 'Performance Optimization',
        description: 'Analyze Lighthouse scores, optimize bundle sizes, implement code splitting, set up CDN caching, optimize database queries.',
        type: 'Enhancement',
        status: 'Backlog',
        priority: 'High',
        shirt_size: 'L',
        est_hours: 12,
        plan: 'Analyze Lighthouse, optimize bundles, implement code splitting, set up CDN, optimize queries',
      },
      {
        title: 'CardSparky SEO Enhancement',
        description: 'Complete 31 SEO tasks in Project Tracker. Implement structured data, create XML sitemaps, set up robots.txt, optimize meta tags.',
        type: 'Enhancement',
        status: 'Backlog',
        priority: 'High',
        shirt_size: 'L',
        est_hours: 20,
        plan: 'Complete 31 SEO tasks: structured data, sitemaps, robots.txt, meta tags optimization',
      },
      {
        title: 'Monitoring & Analytics Setup',
        description: 'Set up comprehensive monitoring (Sentry, DataDog), configure Google Analytics 4, create dashboards, set up alerts.',
        type: 'Enhancement',
        status: 'Backlog',
        priority: 'High',
        shirt_size: 'M',
        est_hours: 8,
        plan: 'Set up Sentry, DataDog, GA4, create dashboards, configure alerts',
      },
      {
        title: 'Documentation Completion',
        description: 'Update all project documentation, create deployment runbooks, document API endpoints, create troubleshooting guides.',
        type: 'Enhancement',
        status: 'Backlog',
        priority: 'Medium',
        shirt_size: 'M',
        est_hours: 10,
        plan: 'Update docs, create runbooks, document APIs, create troubleshooting guides',
      },
      {
        title: 'Performance Testing',
        description: 'Run load tests, stress tests, and performance benchmarks. Identify and fix bottlenecks.',
        type: 'Enhancement',
        status: 'Backlog',
        priority: 'Medium',
        shirt_size: 'M',
        est_hours: 6,
        plan: 'Run load tests, stress tests, benchmarks, identify and fix bottlenecks',
      },
    ],
  },
  {
    name: 'Infrastructure Consolidation & Integration',
    description: 'Phase 3: Consolidate projects and prepare for cloud migration. API consolidation, database consolidation, authentication/authorization, and infrastructure as code.',
    status: 'Backlog',
    shirt_size: 'L',
    tasks: [
      {
        title: 'API Consolidation',
        description: 'Audit all API endpoints, standardize response formats, implement API versioning, create API documentation (OpenAPI/Swagger), set up API gateway.',
        type: 'Enhancement',
        status: 'Backlog',
        priority: 'High',
        shirt_size: 'L',
        est_hours: 16,
        plan: 'Audit endpoints, standardize formats, implement versioning, create OpenAPI docs, set up gateway',
      },
      {
        title: 'Database Consolidation',
        description: 'Audit database schemas, implement backup strategy, set up replication, create migration scripts, document standards.',
        type: 'Enhancement',
        status: 'Backlog',
        priority: 'High',
        shirt_size: 'M',
        est_hours: 12,
        plan: 'Audit schemas, implement backups, set up replication, create migration scripts, document standards',
      },
      {
        title: 'Authentication & Authorization',
        description: 'Audit JWT implementation, implement role-based access control (RBAC), set up OAuth2, create user management interface.',
        type: 'Enhancement',
        status: 'Backlog',
        priority: 'High',
        shirt_size: 'M',
        est_hours: 10,
        plan: 'Audit JWT, implement RBAC, set up OAuth2, create user management',
      },
      {
        title: 'Infrastructure as Code',
        description: 'Create Terraform/CloudFormation templates, document infrastructure setup, create deployment automation, set up CI/CD pipelines.',
        type: 'Enhancement',
        status: 'Backlog',
        priority: 'High',
        shirt_size: 'L',
        est_hours: 14,
        plan: 'Create Terraform templates, document setup, create automation, set up CI/CD',
      },
      {
        title: 'Integration Testing',
        description: 'Run full integration tests across all projects, verify API contracts, test database migrations, validate deployment process.',
        type: 'Enhancement',
        status: 'Backlog',
        priority: 'Medium',
        shirt_size: 'M',
        est_hours: 8,
        plan: 'Run integration tests, verify API contracts, test migrations, validate deployment',
      },
    ],
  },
  {
    name: 'GoDaddy Cloud Migration',
    description: 'Phase 4: Migrate to GoDaddy Cloud Hosting. Preparation, data migration, deployment, and optimization.',
    status: 'Backlog',
    shirt_size: 'L',
    tasks: [
      {
        title: 'GoDaddy Account Setup',
        description: 'Create GoDaddy Cloud Hosting account, purchase domain names, set up DNS records, configure SSL certificates, set up email hosting.',
        type: 'Enhancement',
        status: 'Backlog',
        priority: 'Critical',
        shirt_size: 'M',
        est_hours: 4,
        plan: 'Create account, purchase domains, set up DNS, configure SSL, set up email',
      },
      {
        title: 'Infrastructure Setup',
        description: 'Create Node.js application containers, set up MySQL databases, configure environment variables, set up file storage, configure backups.',
        type: 'Enhancement',
        status: 'Backlog',
        priority: 'Critical',
        shirt_size: 'M',
        est_hours: 6,
        plan: 'Create containers, set up MySQL, configure env vars, set up storage, configure backups',
      },
      {
        title: 'Testing Environment',
        description: 'Deploy staging versions of all apps, test database connectivity, verify API endpoints, test frontend builds, load test infrastructure.',
        type: 'Enhancement',
        status: 'Backlog',
        priority: 'High',
        shirt_size: 'M',
        est_hours: 8,
        plan: 'Deploy staging, test connectivity, verify endpoints, test builds, load test',
      },
      {
        title: 'Database Migration',
        description: 'Export current databases, create backup copies, migrate to GoDaddy MySQL, verify data integrity, set up replication.',
        type: 'Enhancement',
        status: 'Backlog',
        priority: 'Critical',
        shirt_size: 'M',
        est_hours: 6,
        plan: 'Export databases, create backups, migrate to GoDaddy, verify integrity, set up replication',
      },
      {
        title: 'File Migration',
        description: 'Migrate static assets, migrate user uploads, migrate configuration files, verify file permissions.',
        type: 'Enhancement',
        status: 'Backlog',
        priority: 'High',
        shirt_size: 'S',
        est_hours: 4,
        plan: 'Migrate assets, uploads, configs, verify permissions',
      },
      {
        title: 'DNS Cutover',
        description: 'Update DNS records, configure domain routing, set up SSL redirects, verify DNS propagation.',
        type: 'Enhancement',
        status: 'Backlog',
        priority: 'Critical',
        shirt_size: 'S',
        est_hours: 2,
        plan: 'Update DNS, configure routing, set up redirects, verify propagation',
      },
      {
        title: 'Backend Deployment',
        description: 'Deploy Pitch Passport backend, deploy CardSparky backend, deploy Serial Killers backend, verify API endpoints, monitor error logs.',
        type: 'Enhancement',
        status: 'Backlog',
        priority: 'Critical',
        shirt_size: 'M',
        est_hours: 8,
        plan: 'Deploy all backends, verify endpoints, monitor logs',
      },
      {
        title: 'Frontend Deployment',
        description: 'Deploy Pitch Passport frontend, deploy CardSparky frontend, deploy Denick frontend, deploy Serial Killers frontend, verify all pages load.',
        type: 'Enhancement',
        status: 'Backlog',
        priority: 'Critical',
        shirt_size: 'M',
        est_hours: 6,
        plan: 'Deploy all frontends, verify pages load',
      },
      {
        title: 'Verification & Testing',
        description: 'Run full integration tests, test all user workflows, verify performance metrics, check monitoring/alerts, validate SSL certificates.',
        type: 'Enhancement',
        status: 'Backlog',
        priority: 'High',
        shirt_size: 'M',
        est_hours: 8,
        plan: 'Run integration tests, test workflows, verify metrics, check alerts, validate SSL',
      },
      {
        title: 'Performance Tuning',
        description: 'Optimize database queries, configure caching, optimize asset delivery, set up CDN, monitor performance metrics.',
        type: 'Enhancement',
        status: 'Backlog',
        priority: 'Medium',
        shirt_size: 'M',
        est_hours: 8,
        plan: 'Optimize queries, configure caching, optimize assets, set up CDN, monitor metrics',
      },
      {
        title: 'Monitoring & Alerts',
        description: 'Set up error tracking (Sentry), configure performance monitoring, set up uptime monitoring, create alert rules, document runbooks.',
        type: 'Enhancement',
        status: 'Backlog',
        priority: 'High',
        shirt_size: 'M',
        est_hours: 6,
        plan: 'Set up Sentry, performance monitoring, uptime monitoring, alerts, runbooks',
      },
      {
        title: 'Backup & Disaster Recovery',
        description: 'Verify backup strategy, test restore procedures, document recovery steps, set up automated backups.',
        type: 'Enhancement',
        status: 'Backlog',
        priority: 'High',
        shirt_size: 'S',
        est_hours: 4,
        plan: 'Verify backups, test restore, document recovery, set up automation',
      },
    ],
  },
]

async function createProjects() {
  console.log('🚀 Creating Strategic Projects on Denick Project Tracker\n')

  for (const project of projects) {
    try {
      console.log(`📦 Creating project: ${project.name}`)
      const projectData = await api('/pt/projects', {
        method: 'POST',
        body: JSON.stringify({
          name: project.name,
          description: project.description,
          status: project.status,
          shirt_size: project.shirt_size,
        }),
      })

      if (!projectData.ok) {
        console.error(`❌ Failed to create project: ${projectData.error}`)
        continue
      }

      const projectId = projectData.id
      console.log(`✅ Project created with ID #${projectId}\n`)

      // Create tasks for this project
      for (const task of project.tasks) {
        try {
          console.log(`  📝 Creating task: ${task.title}`)
          const taskData = await api('/pt/tasks', {
            method: 'POST',
            body: JSON.stringify({
              project_id: projectId,
              title: task.title,
              description: task.description,
              type: task.type,
              status: task.status,
              priority: task.priority,
              shirt_size: task.shirt_size,
              assignee: 'Eric',
              est_hours: task.est_hours,
              actual_hours: task.actual_hours,
              plan: task.plan,
              model: 'Claude Haiku 4.5',
            }),
          })

          if (!taskData.ok) {
            console.error(`    ❌ Failed to create task: ${taskData.error}`)
          } else {
            console.log(`    ✅ Task #${taskData.id} created`)
          }
        } catch (err) {
          console.error(`    ❌ Error creating task: ${err.message}`)
        }
      }

      console.log(`\n✨ Project "${project.name}" completed with ${project.tasks.length} tasks\n`)
    } catch (err) {
      console.error(`❌ Error creating project: ${err.message}`)
    }
  }

  console.log('🎉 All projects created successfully!')
}

createProjects().catch(console.error)

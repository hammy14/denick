-- Documentation Schema Migration for Denick Project Tracker
-- Adds support for linking and tracking documentation across projects and tasks

-- Add documentation reference fields to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS doc_references JSON DEFAULT NULL COMMENT 'JSON array of linked documentation paths';

-- Add documentation reference fields to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS doc_references JSON DEFAULT NULL COMMENT 'JSON array of linked documentation paths';

-- Create documentation_links table for many-to-many relationships
CREATE TABLE IF NOT EXISTS documentation_links (
  id INT AUTO_INCREMENT PRIMARY KEY,
  doc_path VARCHAR(500) NOT NULL,
  project_id INT,
  task_id INT,
  status ENUM('up-to-date', 'needs-review', 'deprecated') DEFAULT 'up-to-date',
  linked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  linked_by VARCHAR(255),
  notes TEXT,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  UNIQUE KEY unique_doc_project (doc_path, project_id),
  UNIQUE KEY unique_doc_task (doc_path, task_id),
  INDEX idx_doc_path (doc_path),
  INDEX idx_project_id (project_id),
  INDEX idx_task_id (task_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create documentation_index table for search optimization
CREATE TABLE IF NOT EXISTS documentation_index (
  id INT AUTO_INCREMENT PRIMARY KEY,
  doc_path VARCHAR(500) NOT NULL UNIQUE,
  doc_name VARCHAR(255),
  project_name VARCHAR(255),
  category VARCHAR(100),
  tags JSON,
  status ENUM('up-to-date', 'needs-review', 'deprecated') DEFAULT 'up-to-date',
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_reviewed TIMESTAMP,
  reviewed_by VARCHAR(255),
  review_notes TEXT,
  INDEX idx_doc_path (doc_path),
  INDEX idx_project_name (project_name),
  INDEX idx_category (category),
  INDEX idx_status (status),
  FULLTEXT INDEX ft_search (doc_name, category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create documentation_review_history table for tracking changes
CREATE TABLE IF NOT EXISTS documentation_review_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  doc_path VARCHAR(500) NOT NULL,
  old_status ENUM('up-to-date', 'needs-review', 'deprecated'),
  new_status ENUM('up-to-date', 'needs-review', 'deprecated') NOT NULL,
  reviewed_by VARCHAR(255),
  reviewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  INDEX idx_doc_path (doc_path),
  INDEX idx_reviewed_at (reviewed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_doc_refs ON projects((CAST(doc_references AS CHAR(500))));
CREATE INDEX IF NOT EXISTS idx_tasks_doc_refs ON tasks((CAST(doc_references AS CHAR(500))));

-- Add documentation status field to projects
ALTER TABLE projects ADD COLUMN IF NOT EXISTS documentation_status ENUM('up-to-date', 'needs-review', 'incomplete') DEFAULT 'incomplete' COMMENT 'Overall documentation status for the project';

-- Add documentation status field to tasks
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS documentation_status ENUM('up-to-date', 'needs-review', 'incomplete') DEFAULT 'incomplete' COMMENT 'Documentation status for the task';

-- Verify tables were created
SELECT 'Documentation schema migration completed successfully' AS status;

import { useState, useEffect } from 'react'
import { adminPermissionsApi } from '../../services/contentManagementApi'

const PERMISSION_GROUPS = {
  'Announcements': [
    { key: 'can_create_announcements', label: 'Create Announcements' },
    { key: 'can_edit_announcements', label: 'Edit Announcements' },
    { key: 'can_delete_announcements', label: 'Delete Announcements' }
  ],
  'Tips': [
    { key: 'can_create_tips', label: 'Create Tips' },
    { key: 'can_edit_tips', label: 'Edit Tips' },
    { key: 'can_delete_tips', label: 'Delete Tips' }
  ],
  'Admin': [
    { key: 'can_view_audit_log', label: 'View Audit Log' },
    { key: 'can_restore_archived', label: 'Restore Archived Items' },
    { key: 'can_manage_permissions', label: 'Manage Permissions' }
  ]
}

export default function AdminPermissions() {
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [editingAdmin, setEditingAdmin] = useState(null)
  const [permissions, setPermissions] = useState({})
  const [showAddForm, setShowAddForm] = useState(false)
  const [newAdmin, setNewAdmin] = useState({ id: '', name: '' })
  const [newAdminPermissions, setNewAdminPermissions] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadAdmins()
  }, [])

  async function loadAdmins() {
    try {
      setLoading(true)
      setError(null)
      // For now, we'll use mock data since the API might not have a getAll endpoint
      // In production, this would fetch from the API
      const mockAdmins = [
        {
          id: 'admin@example.com',
          name: 'Admin User',
          permissions: {
            can_create_announcements: true,
            can_edit_announcements: true,
            can_delete_announcements: true,
            can_create_tips: true,
            can_edit_tips: true,
            can_delete_tips: true,
            can_view_audit_log: true,
            can_restore_archived: true,
            can_manage_permissions: true
          }
        }
      ]
      setAdmins(mockAdmins)
    } catch (err) {
      console.error('Failed to load admins:', err)
      // Set empty array on error
      setAdmins([])
    } finally {
      setLoading(false)
    }
  }

  function handleEdit(admin) {
    setEditingAdmin(admin.id)
    setPermissions({ ...admin.permissions })
  }

  async function handleSave(adminId) {
    try {
      setSaving(true)
      setError(null)
      await adminPermissionsApi.update(adminId, permissions)
      
      // Update local state
      setAdmins(admins.map(a => 
        a.id === adminId ? { ...a, permissions } : a
      ))
      
      setEditingAdmin(null)
      setPermissions({})
    } catch (err) {
      console.error('Failed to save permissions:', err)
      setError(`Failed to save permissions: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    setEditingAdmin(null)
    setPermissions({})
  }

  function handlePermissionChange(key) {
    setPermissions(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  function handleNewAdminPermissionChange(key) {
    setNewAdminPermissions(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  async function handleAddAdmin() {
    if (!newAdmin.id || !newAdmin.name) {
      setError('Please fill in all fields')
      return
    }

    try {
      setSaving(true)
      setError(null)
      
      await adminPermissionsApi.update(newAdmin.id, newAdminPermissions)
      
      // Add to local state
      setAdmins([...admins, {
        id: newAdmin.id,
        name: newAdmin.name,
        permissions: newAdminPermissions
      }])
      
      setShowAddForm(false)
      setNewAdmin({ id: '', name: '' })
      setNewAdminPermissions({})
    } catch (err) {
      console.error('Failed to add admin:', err)
      setError(`Failed to add admin: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="opp-section">
      <div className="opp-header"><h3>👥 Admin Permissions</h3></div>

      {error && <div style={{ padding: '1rem 1.5rem', background: 'rgba(244,67,54,0.1)', color: 'var(--red)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>{error}</span>
        <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
      </div>}

      {loading && <div style={{ padding: '1rem 1.5rem', background: 'rgba(2,113,235,0.1)', color: 'var(--blue)', borderBottom: '1px solid var(--border)' }}>⏳ Loading...</div>}

      {/* Add Admin Button */}
      <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          {admins.length} admin(s)
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            padding: '0.5rem 1rem',
            background: 'var(--brand)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.85rem'
          }}
        >
          {showAddForm ? '✕ Cancel' : '➕ Add Admin'}
        </button>
      </div>

      {/* Add Admin Form */}
      {showAddForm && (
        <div style={{ padding: '1.5rem', background: 'var(--gray-50)', borderBottom: '1px solid var(--border)' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Admin Email/ID</label>
            <input
              type="text"
              value={newAdmin.id}
              onChange={e => setNewAdmin({ ...newAdmin, id: e.target.value })}
              placeholder="admin@example.com"
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '0.9rem', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Admin Name</label>
            <input
              type="text"
              value={newAdmin.name}
              onChange={e => setNewAdmin({ ...newAdmin, name: e.target.value })}
              placeholder="Admin Name"
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '0.9rem', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem' }}>Initial Permissions</label>
            {Object.entries(PERMISSION_GROUPS).map(([group, perms]) => (
              <div key={group} style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{group}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
                  {perms.map(perm => (
                    <label key={perm.key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                      <input
                        type="checkbox"
                        checked={newAdminPermissions[perm.key] || false}
                        onChange={() => handleNewAdminPermissionChange(perm.key)}
                        style={{ cursor: 'pointer' }}
                      />
                      {perm.label}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handleAddAdmin}
              disabled={saving}
              style={{
                padding: '0.5rem 1rem',
                background: 'var(--green)',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem',
                opacity: saving ? 0.6 : 1
              }}
            >
              {saving ? '⏳ Saving...' : '✅ Add Admin'}
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              style={{
                padding: '0.5rem 1rem',
                background: 'var(--gray-200)',
                color: 'var(--text)',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Admins List */}
      <div style={{ padding: '1.25rem 1.5rem' }}>
        {admins.length === 0 ? (
          <div className="opp-empty">No admins found.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {admins.map(admin => (
              <div key={admin.id} className="home-card" style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '1rem' }}>{admin.name}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{admin.id}</div>
                  </div>
                  {editingAdmin !== admin.id && (
                    <button
                      onClick={() => handleEdit(admin)}
                      style={{
                        padding: '0.4rem 0.8rem',
                        background: 'var(--blue)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '0.8rem'
                      }}
                    >
                      ✏️ Edit
                    </button>
                  )}
                </div>

                {editingAdmin === admin.id ? (
                  <div>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem' }}>Permissions</label>
                      {Object.entries(PERMISSION_GROUPS).map(([group, perms]) => (
                        <div key={group} style={{ marginBottom: '1rem' }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{group}</div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
                            {perms.map(perm => (
                              <label key={perm.key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                                <input
                                  type="checkbox"
                                  checked={permissions[perm.key] || false}
                                  onChange={() => handlePermissionChange(perm.key)}
                                  style={{ cursor: 'pointer' }}
                                />
                                {perm.label}
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleSave(admin.id)}
                        disabled={saving}
                        style={{
                          padding: '0.5rem 1rem',
                          background: 'var(--green)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: saving ? 'not-allowed' : 'pointer',
                          fontWeight: 600,
                          fontSize: '0.85rem',
                          opacity: saving ? 0.6 : 1
                        }}
                      >
                        {saving ? '⏳ Saving...' : '✅ Save'}
                      </button>
                      <button
                        onClick={handleCancel}
                        style={{
                          padding: '0.5rem 1rem',
                          background: 'var(--gray-200)',
                          color: 'var(--text)',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontSize: '0.85rem'
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                      {Object.entries(PERMISSION_GROUPS).map(([group, perms]) => (
                        <div key={group}>
                          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{group}</div>
                          {perms.map(perm => (
                            <div key={perm.key} style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                              <span style={{ color: admin.permissions[perm.key] ? 'var(--green)' : 'var(--red)' }}>
                                {admin.permissions[perm.key] ? '✓' : '✕'}
                              </span>
                              <span style={{ color: admin.permissions[perm.key] ? 'var(--text)' : 'var(--text-muted)' }}>
                                {perm.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

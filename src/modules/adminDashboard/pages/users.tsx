import DashboardLayout from '../components/DashboardLayout';
import { useEffect, useState } from 'react';
import { fetchUsers, createUser, updateUser, deleteUser } from '../services/adminService';
import UserModal from '../components/UserModal';
import UserRolesModal from '../components/UserRolesModal';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<any | null>(null);
  const [rolesUserId, setRolesUserId] = useState<string|null>(null);

  const refresh = () => fetchUsers().then(u => { setUsers(u); setLoading(false); });
  useEffect(() => { refresh(); }, []);

  const handleSave = async (user: { email: string; name: string }) => {
    if (editUser) {
      await updateUser(editUser.id, user);
    } else {
      await createUser(user);
    }
    setShowModal(false);
    setEditUser(null);
    refresh();
  };

  return (
    <DashboardLayout>
      <h1>Gestion des utilisateurs</h1>
      <button style={{ margin: '16px 0', background: '#2563eb', color: '#fff', borderRadius: 4, padding: '10px 24px', fontWeight: 600 }} onClick={() => { setShowModal(true); setEditUser(null); }}>Créer un utilisateur</button>
      {loading ? <div>Chargement...</div> : (
        <table style={{ width: '100%', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee' }}>
          <thead>
            <tr><th>ID</th><th>Email</th><th>Nom</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.email}</td>
                <td>{u.name}</td>
                <td>
                  <button onClick={() => { setEditUser(u); setShowModal(true); }}>Éditer</button>{' '}
                  <button onClick={async () => { await deleteUser(u.id); refresh(); }}>Supprimer</button>{' '}
                  <button onClick={() => setRolesUserId(u.id)}>Rôles</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {showModal && <UserModal onSave={handleSave} onClose={() => { setShowModal(false); setEditUser(null); }} initial={editUser} />}
      {rolesUserId && <UserRolesModal userId={rolesUserId} onClose={() => setRolesUserId(null)} onSave={refresh} />}
    </DashboardLayout>
  );
}

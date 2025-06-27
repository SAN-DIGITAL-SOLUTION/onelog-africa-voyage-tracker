import { useState } from 'react';

export default function Login() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      window.location.href = '/templates';
    } else {
      setError('Mot de passe incorrect');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: 'auto', padding: 32 }}>
      <h2>Connexion administrateur</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Mot de passe admin"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ width: '100%', marginBottom: 8 }}
        />
        <button type="submit" style={{ width: '100%' }}>Se connecter</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

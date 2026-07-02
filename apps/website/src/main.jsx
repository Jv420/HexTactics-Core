import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

function projectLabel(type) {
  if (type === 'minecraft') return 'Minecraft';
  if (type === 'fivem') return 'FiveM';
  if (type === 'website') return 'Website';
  return 'Project';
}

async function api(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'API request failed.');
  return data;
}

function AuthBox({ user, onUserChange }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  async function submit(event) {
    event.preventDefault();
    setMessage('Even verwerken...');

    try {
      const data = mode === 'login'
        ? await api('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
        : await api('/api/auth/register', { method: 'POST', body: JSON.stringify({ email, password, displayName }) });
      onUserChange(data.user);
      setMessage(`Welkom ${data.user.displayName}!`);
      setPassword('');
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function logout() {
    try {
      await api('/api/auth/logout', { method: 'POST' });
    } catch {}
    onUserChange(null);
    setMessage('Je bent uitgelogd.');
  }

  if (user) {
    return (
      <section className="section auth-card">
        <p className="eyebrow">HexTactics ID</p>
        <h2>Welkom, {user.displayName}</h2>
        <p>Je bent ingelogd als {user.email}. Rol: {user.role}.</p>
        <button onClick={logout}>Uitloggen</button>
      </section>
    );
  }

  return (
    <section className="section auth-card">
      <p className="eyebrow">HexTactics ID</p>
      <h2>{mode === 'login' ? 'Inloggen' : 'Account maken'}</h2>
      <form onSubmit={submit} className="auth-form">
        {mode === 'register' && (
          <label>
            Weergavenaam
            <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Jouw naam" />
          </label>
        )}
        <label>
          E-mail
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jij@example.com" />
        </label>
        <label>
          Wachtwoord
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimaal 8 tekens" />
        </label>
        <div className="actions">
          <button type="submit" className="button primary">{mode === 'login' ? 'Inloggen' : 'Registreren'}</button>
          <button type="button" className="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
            {mode === 'login' ? 'Nieuw account' : 'Ik heb al een account'}
          </button>
        </div>
      </form>
      {message && <p className="form-message">{message}</p>}
    </section>
  );
}

function App() {
  const [projects, setProjects] = useState([]);
  const [apiStatus, setApiStatus] = useState('laden');
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const healthResponse = await fetch(`${API_BASE_URL}/api/health`);
        const health = await healthResponse.json();
        setApiStatus(health.ok ? 'online' : 'offline');
      } catch {
        setApiStatus('offline');
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/projects`);
        const data = await response.json();
        setProjects(data.projects || []);
      } catch {
        setProjects([]);
      }

      try {
        const me = await api('/api/auth/me');
        setUser(me.user);
      } catch {
        setUser(null);
      }
    }

    loadData();
  }, []);

  return (
    <main>
      <nav className="nav">
        <strong>HexTactics</strong>
        <div>
          <a href="#story">Verhaal</a>
          <a href="#projects">Projecten</a>
          <a href="#identity">Login</a>
          <a href="#support">Support</a>
        </div>
      </nav>

      <section className="hero">
        <p className="eyebrow">Gaming • Development • Infrastructure</p>
        <h1>HexTactics bouwt online communities vanuit passie.</h1>
        <p>
          Wat begon als een Minecraft-server voor de kinderen groeide uit tot een platform voor gamecommunities,
          websites, webshops en tools. Onze servers zijn gratis toegankelijk; vrijwillige aankopen helpen de kosten
          van domeinen, hosting en infrastructuur te dragen.
        </p>
        <div className="actions">
          <a className="button primary" href="#projects">Bekijk projecten</a>
          <a className="button" href="#identity">Maak account</a>
        </div>
      </section>

      <section className="status-card">
        <span className={apiStatus === 'online' ? 'dot online' : 'dot offline'}></span>
        <div>
          <strong>Platformstatus</strong>
          <p>API is {apiStatus}.</p>
        </div>
      </section>

      <section id="story" className="section two-col">
        <div>
          <p className="eyebrow">Ons verhaal</p>
          <h2>Gebouwd voor familie, vrienden en community.</h2>
        </div>
        <p>
          HexTactics is ontstaan uit een simpele vraag: kunnen we een eigen Minecraft-server hebben?
          Daarna kwamen FiveM, websites, webshops en servertools erbij. Het doel blijft hetzelfde:
          een leuke, toegankelijke en veilige plek bouwen waar spelers samen kunnen gamen.
        </p>
      </section>

      <section id="projects" className="section">
        <p className="eyebrow">HexTactics Network</p>
        <h2>Projecten</h2>
        <div className="project-grid">
          {projects.length ? projects.map((project) => (
            <article key={project.slug} className="project-card">
              <span>{projectLabel(project.type)}</span>
              <h3>{project.name}</h3>
              <p>{project.description || 'Een HexTactics project.'}</p>
              <small>{project.domain || 'Domein volgt later'} • {project.status}</small>
            </article>
          )) : (
            <article className="project-card">
              <span>Offline</span>
              <h3>Projecten laden niet</h3>
              <p>Start eerst de HexTactics API op poort 4000.</p>
            </article>
          )}
        </div>
      </section>

      <div id="identity">
        <AuthBox user={user} onUserChange={setUser} />
      </div>

      <section id="support" className="section support">
        <p className="eyebrow">Community first</p>
        <h2>Gratis toegankelijk, eerlijk ondersteund.</h2>
        <p>
          Spelen blijft gratis. De webshop is bedoeld voor vrijwillige aankopen die helpen om domeinen,
          gamehosting, ontwikkeling en infrastructuur te betalen. Eventuele winst wordt gebruikt om HexTactics
          verder te verbeteren.
        </p>
      </section>

      <footer>
        <strong>HexTactics</strong>
        <p>Built by passion. Driven by community.</p>
      </footer>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);

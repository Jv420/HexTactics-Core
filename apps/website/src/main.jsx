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

function App() {
  const [projects, setProjects] = useState([]);
  const [apiStatus, setApiStatus] = useState('laden');

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
          <a className="button" href="#support">Steun het project</a>
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

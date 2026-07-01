# HexTactics API starten met MySQL/MariaDB

Deze handleiding helpt je om de eerste HexTactics API lokaal te starten.

## Wat heb je nodig?

- Node.js LTS
- Git
- MySQL of MariaDB
- PowerShell

## Stap 1 - Repository downloaden

```powershell
cd C:\
mkdir Projects
cd Projects
git clone https://github.com/Jv420/HexTactics-Core.git
cd HexTactics-Core
```

## Stap 2 - MySQL/MariaDB database maken

Open je MySQL/MariaDB beheerprogramma of terminal.

Maak een databasegebruiker:

```sql
CREATE DATABASE IF NOT EXISTS hextactics CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'hextactics_user'@'localhost' IDENTIFIED BY 'KIES_EEN_STERK_WACHTWOORD';
GRANT ALL PRIVILEGES ON hextactics.* TO 'hextactics_user'@'localhost';
FLUSH PRIVILEGES;
```

Bewaar het wachtwoord goed. Zet het niet in GitHub.

## Stap 3 - API installeren

```powershell
cd C:\Projects\HexTactics-Core\apps\api
npm install
copy .env.example .env
notepad .env
```

Vul minimaal in:

```env
NODE_ENV=development
PORT=4000
APP_NAME=HexTactics API
PUBLIC_APP_URL=http://localhost:3000
API_BASE_URL=http://localhost:4000

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=hextactics_user
DB_PASSWORD=JOUW_DATABASE_WACHTWOORD
DB_NAME=hextactics

JWT_SECRET=MAAK_HIER_EEN_LANGE_RANDOM_SECRET_VAN_MINIMAAL_32_TEKENS
JWT_EXPIRES_IN=7d
COOKIE_SECURE=false

ADMIN_EMAIL=jouw@email.nl
ADMIN_PASSWORD=KIES_EEN_STERK_ADMIN_WACHTWOORD
ADMIN_DISPLAY_NAME=HexTactics Admin
```

## Stap 4 - Config controleren

```powershell
npm run check
```

Als je waarschuwingen ziet over `CHANGE_ME`, pas je `.env` aan.

## Stap 5 - Database initialiseren

```powershell
npm run db:init
```

Dit maakt tabellen aan voor:

- users
- projects
- products
- orders
- audit_logs

Ook worden de eerste projecten toegevoegd:

- DynathiSMP
- DelfzijlRP
- DelfzijlCity
- AppingedamSCO

## Stap 6 - API starten

```powershell
npm start
```

Open daarna:

```text
http://localhost:4000/api/health
```

Als alles goed is zie je:

```json
{
  "ok": true,
  "database": "online"
}
```

Bekijk projecten:

```text
http://localhost:4000/api/projects
```

Publieke status:

```text
http://localhost:4000/api/status/public
```

## Problemen oplossen

### Database offline

Controleer:

- draait MySQL/MariaDB?
- klopt DB_USER?
- klopt DB_PASSWORD?
- bestaat database `hextactics`?

### JWT_SECRET fout

Gebruik minimaal 32 tekens en geen `CHANGE_ME`.

### Poort 4000 bezet

Verander in `.env`:

```env
PORT=4001
API_BASE_URL=http://localhost:4001
```

Start opnieuw.

## Veiligheid

Commit nooit:

- `.env`
- wachtwoorden
- database dumps
- API keys
- tokens
- klantgegevens

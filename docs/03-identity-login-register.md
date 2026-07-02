# Stap 3 - HexTactics Identity: registreren en inloggen

Deze stap voegt de eerste accountfunctionaliteit toe.

## Nieuwe API endpoints

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
GET  /api/dashboard
```

## Eerst nodig

Zorg dat de API en website draaien:

```powershell
cd C:\Projects\HexTactics-Core\apps\api
npm start
```

Nieuwe PowerShell:

```powershell
cd C:\Projects\HexTactics-Core\apps\website
npm start
```

Open:

```text
http://localhost:3000
```

## Account maken via website

1. Ga naar `http://localhost:3000`
2. Scroll naar `HexTactics ID`
3. Klik op `Nieuw account`
4. Vul weergavenaam, e-mail en wachtwoord in
5. Klik op `Registreren`

Bij succes zie je een welkomsmelding.

## Inloggen via website

1. Vul e-mail en wachtwoord in
2. Klik `Inloggen`
3. Je ziet je rol en e-mailadres

## Testen met PowerShell/cURL

Registreren:

```powershell
curl -X POST http://localhost:4000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{"email":"test@example.com","password":"testpassword123","displayName":"Test User"}'
```

Inloggen:

```powershell
curl -X POST http://localhost:4000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"test@example.com","password":"testpassword123"}'
```

Je krijgt een JSON-response met een `token`.

Profiel ophalen met token:

```powershell
curl http://localhost:4000/api/auth/me `
  -H "Authorization: Bearer PLAK_HIER_JE_TOKEN"
```

Dashboard ophalen:

```powershell
curl http://localhost:4000/api/dashboard `
  -H "Authorization: Bearer PLAK_HIER_JE_TOKEN"
```

## Rollen

De eerste admin/owner kan via `npm run db:init` worden gemaakt als `ADMIN_PASSWORD` veilig is ingesteld in `apps/api/.env`.

Nieuwe accounts via registratie krijgen standaard rol:

```text
user
```

Mogelijke rollen in de database:

```text
owner
admin
staff
user
```

## Veiligheid

- Wachtwoorden worden gehashed met bcrypt.
- Login gebruikt JWT.
- Token wordt ook als HttpOnly cookie gezet.
- Gebruik in productie een sterke `JWT_SECRET`.
- Gebruik later HTTPS voordat je publiek online gaat.

## Bekende beperkingen

Deze eerste versie heeft nog geen:

- wachtwoord reset
- e-mailverificatie
- dashboardrollen in de UI
- admin gebruikersbeheer
- rate limiting

Die komen later in de volgende sprint.

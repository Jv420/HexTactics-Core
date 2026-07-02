# Stap 4 - Admin & projectbeheer

Deze sprint voegt de eerste adminfuncties toe.

## Nieuwe API endpoints

Alle adminroutes vereisen een ingelogde gebruiker met rol `owner` of `admin`.

```text
GET  /api/admin/summary
GET  /api/admin/users
GET  /api/admin/projects
POST /api/admin/projects
PUT  /api/admin/projects/:slug
```

## Owner account maken

Zet in `apps/api/.env`:

```env
ADMIN_EMAIL=jouw@email.nl
ADMIN_PASSWORD=EEN_STERK_WACHTWOORD
ADMIN_DISPLAY_NAME=HexTactics Admin
```

Draai daarna:

```powershell
cd C:\Projects\HexTactics-Core\apps\api
npm run db:init
```

Als de gebruiker nog niet bestaat, wordt deze aangemaakt als `owner`.

## Admin dashboard openen

1. Start de API
2. Start de website
3. Ga naar `http://localhost:3000`
4. Log in met je owner account
5. Je ziet nu een extra `Admin` link in de navigatie

## Wat toont het dashboard?

- aantal gebruikers
- aantal projecten
- aantal producten
- aantal orders
- lijst met projecten

## Project toevoegen via API

Voorbeeld met token:

```powershell
curl -X POST http://localhost:4000/api/admin/projects `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer PLAK_TOKEN_HIER" `
  -d '{"slug":"testproject","name":"Test Project","type":"other","domain":"test.local","status":"planned","description":"Test via admin API"}'
```

## Project aanpassen via API

```powershell
curl -X PUT http://localhost:4000/api/admin/projects/testproject `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer PLAK_TOKEN_HIER" `
  -d '{"name":"Test Project Updated","type":"other","domain":"test.local","status":"development","description":"Bijgewerkt via admin API"}'
```

## Audit logs

Admin-acties worden vastgelegd in `audit_logs`.

Voorbeelden:

```text
project.created
project.updated
```

## Veiligheid

- Alleen `owner` en `admin` mogen adminroutes gebruiken.
- Nieuwe normale accounts krijgen standaard rol `user`.
- Maak niet iedereen admin.
- Gebruik sterke wachtwoorden.
- Zet later HTTPS aan voordat je publiek gaat.

## Bekende beperkingen

Deze versie heeft nog geen volledige project-editor in de browser. Het dashboard toont projecten, maar toevoegen en aanpassen doe je nu nog via API/cURL. De volledige UI-editor komt in de volgende sprint.

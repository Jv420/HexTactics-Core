# Stap 2 - HexTactics website starten

Deze stap bouwt de eerste HexTactics website. De website haalt projectinformatie op uit de API.

## Eerst nodig

Zorg dat stap 1 werkt:

```text
http://localhost:4000/api/health
http://localhost:4000/api/projects
```

Als de API niet draait, toont de website nog wel, maar projecten kunnen niet laden.

## Website installeren

Open een nieuwe PowerShell:

```powershell
cd C:\Projects\HexTactics-Core\apps\website
npm install
copy .env.example .env
notepad .env
```

Controleer dat dit erin staat:

```env
VITE_API_BASE_URL=http://localhost:4000
```

## Website starten

```powershell
npm start
```

Open daarna:

```text
http://localhost:3000
```

## Wat hoort te werken?

- HexTactics homepage opent
- Platformstatus toont online als de API werkt
- Projecten worden geladen uit MySQL/MariaDB via de API
- DynathiSMP, DelfzijlRP, DelfzijlCity en AppingedamSCO verschijnen als projectkaarten

## Veelvoorkomende fouten

### Projecten laden niet

Controleer of de API draait:

```text
http://localhost:4000/api/projects
```

### API offline op website

Controleer `apps/website/.env`:

```env
VITE_API_BASE_URL=http://localhost:4000
```

Start daarna de website opnieuw.

### Poort 3000 bezet

Start tijdelijk op een andere poort:

```powershell
npx vite --host 0.0.0.0 --port 3001
```

Open dan:

```text
http://localhost:3001
```

## Veiligheid

Zet geen echte secrets in de website. Alles wat met `VITE_` begint kan zichtbaar worden in de browser.

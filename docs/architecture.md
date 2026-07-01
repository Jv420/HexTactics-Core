# Technische architectuur

HexTactics Core gebruikt een monorepo-indeling.

```text
HexTactics-Core/
├── apps/
│   ├── website/
│   ├── admin-panel/
│   └── status-page/
├── services/
│   ├── payments/
│   ├── game-bridge/
│   ├── notifications/
│   └── monitoring/
├── packages/
│   ├── config/
│   ├── database/
│   ├── logger/
│   └── ui/
├── infrastructure/
│   ├── docker/
│   ├── nginx/
│   └── deployment/
├── scripts/
└── docs/
```

## Verantwoordelijkheden

### apps

Programma's die een gebruiker of beheerder rechtstreeks gebruikt.

### services

Achtergrondservices en API's, bijvoorbeeld betalingen, RCON-koppelingen en Discordmeldingen.

### packages

Gedeelde code die door meerdere apps of services wordt gebruikt.

### infrastructure

Deployment- en serverconfiguratie zonder echte secrets.

## Projectscheiding

Gameprojecten houden een eigen configuratie en data-isolatie.

```text
Minecraft-aankoop -> DynathiSMP command queue
DelfzijlRP-aankoop -> DelfzijlRP command queue
DelfzijlCity-aankoop -> DelfzijlCity command queue
```

Een betaling voor het ene project mag nooit automatisch commands uitvoeren op een ander project.

## Security vanaf het begin

- secrets alleen via lokale environment variables
- webhooks altijd verifiëren
- beheerroutes authenticeren
- betalingen idempotent verwerken
- acties loggen zonder gevoelige waarden
- least-privilege accounts gebruiken
- publieke en interne API's scheiden

## Eerste bouwvolgorde

1. Centrale HexTactics website
2. Projectregister en navigatie
3. Gedeelde configuratie en logging
4. Auth voor beheerders
5. Betalingsservice per project
6. Game-bridge per Minecraft/FiveM-server
7. Monitoring en statuspagina

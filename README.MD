# Carcodillo Setup

## Voraussetzungen

Docker installiert und gestartet

## Setup

# Ins Projektverzeichnis wechseln
cd carcodillo

# Container ohne Cache bauen
docker-compose build --no-cache

# Container starten
docker-compose up -d

# Oder direkt starten mit
docker-compose up -d --build

# Prisma-Migration ausführen
docker-compose exec app npx prisma db push

# SQL-Datei in den Postgres-Container kopieren
docker cp setup.sql carcodillo_db:/setup.sql

# SQL-Skript im Container ausführen
docker-compose exec postgres psql -U postgres -d carcodillo -f /setup.sql

# Die Website lässt sich folgend auf dieser URL erreichen: http://localhost:3000

# Accounts, vorangelegt
dom@user.com
password123

fab@admin.com
admin123

yb@employee.com
employee123

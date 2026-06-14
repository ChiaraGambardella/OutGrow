# 1. Usiamo l'immagine ufficiale di Node (versione Alpine, leggera e veloce)
FROM node:20-alpine

# 2. Installiamo nodemon globalmente nel container per lo script di sviluppo
RUN npm install -g nodemon

# 3. Impostiamo la cartella di lavoro dentro il container
WORKDIR /usr/src/app

# 4. Copiamo i file di configurazione dei pacchetti della ROOT e di tutti i pacchetti
# (Questo serve a Docker per ottimizzare la cache delle modifiche)
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
COPY packages/shared/package*.json ./packages/shared/

# 5. Installiamo tutte le dipendenze sfruttando la logica del monorepo
RUN npm install

# 6. Copiamo tutto il resto del codice del progetto nel container
COPY . .

# 7. Ci spostiamo virtualmente nella cartella del backend per l'esecuzione
WORKDIR /usr/src/app/apps/backend

# 8. Esponiamo la porta su cui ascolterà Express (letta poi dal .env)
EXPOSE 3000

# 9. Comando di default per avviare il backend in modalità sviluppo
CMD ["npm", "run", "dev"]
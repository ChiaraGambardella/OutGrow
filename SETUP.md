# 🌱 Outgrow - Guida al Setup del Progetto

Benvenuto nel repository di Outgrow, il social network dedicato alla crescita personale basato sulla gamification. Questa guida ti aiuterà a configurare l'ambiente di sviluppo locale e a far partire l'intera applicazione.

---

## 📋 Prerequisiti

Prima di iniziare, assicurati di avere installato sul tuo computer i seguenti strumenti:

Docker e Docker Compose (Inclusi in Docker Desktop)
Node.js (Versione 20 o superiore consigliata)
npm
Expo Go (App installata sul tuo smartphone iOS/Android per testare il frontend)

---

## 📂 Download degli Asset Multimediali (Google Drive)

L'applicazione gestisce contenuti multimediali (immagini del profilo, badge di gamification, immagini delle sfide e post). Per evitare che l'app mostri errori o schermate vuote, è necessario scaricare i file multimediali pre-configurati.

1. Apri il link di Google Drive presente all'interno del file `README.md` principale del progetto.
2. Entra nella cartella di Outgrow e scarica la cartella denominata "immagini".
3. Posiziona le cartelle all'interno della directory del backend, mappando esattamente la struttura delle cartelle dedicate agli upload.
   
   Sposta i file scaricati in:
   * `apps/backend/src/uploads/badges/`   ➡️ Per le icone dei badge.
   * `apps/backend/src/uploads/sfide/`    ➡️ Per le immagini delle sfide.

⚠️ **Nota Bene:** Assicurati di non modificare i nomi dei file estratti, poiché il database (`init_db/create.sql`) fa già riferimento a quei precisi nomi di file per mostrare i contenuti di test al primo avvio.

---

## 📦 Installazione delle Dipendenze (Consigliato per l'IDE)

Anche se utilizzerai Docker per avviare l'applicazione, è fortemente consigliato installare le dipendenze localmente sulla tua macchina. Questo permetterà a VS Code (o al tuo IDE) di abilitare l'autocompletamento, il tracking dei pacchetti e i controlli di TypeScript sul frontend senza mostrare falsi errori di importazione.
Dalla root del progetto, esegui:
`npm install`

---

## 🛠️ Configurazione Variabili d'Ambiente (.env)

Il progetto richiede la configurazione dei file ambientali sia per il corretto funzionamento dei container/database, sia per permettere al frontend di comunicare con le API.

Entra nella root del progetto, rinomina il file `.env.example` in `.env` e compila le variabili richieste.
Spostati nel frontend, rinomina il file `.env.example` in `.env` e imposta l'URL delle API con l'IPv4 locale del tuo PC.

**⚠️ Note importanti sulla connettività del Frontend (Expo Go)**

Per fare in modo che lo smartphone e il computer si parlino correttamente, tieni a mente queste tre regole d'oro:
1. Stessa Rete Wi-Fi: Il tuo computer (dove gira il backend) e il tuo smartphone (con Expo Go) devono essere categoricamente connessi alla stessa identica rete.
2. L'IP cambia col cambio di rete: L'indirizzo IP locale (es. 192.168.X.X) viene assegnato dal router. Questo significa che ogni volta che cambi rete Wi-Fi (es. passi da casa all'università, o dall'ufficio a casa), l'IP del tuo PC cambierà. Dovrai quindi aggiornare il valore di `EXPO_PUBLIC_API_URL` nel file `apps/frontend/.env` e riavviare il bundler di Expo.
3. Problemi con reti Aziendali/Universitarie (Soluzione Hotspot): Le reti Wi-Fi aziendali, scolastiche o pubbliche spesso attivano l'AP Isolation (Isolamento dei Client), una misura di sicurezza che impedisce ai dispositivi connessi di comunicare tra loro. Se ti trovi in questa situazione, l'app darà costantemente un errore di connessione.
La Soluzione: Attiva l'Hotspot sul tuo cellulare, connetti il computer alla rete generata dallo smartphone e aggiorna l'indirizzo IP nel file `.env` del frontend usando il nuovo IP assegnato dall'hotspot.

---

## 🌐 Mappatura delle Porte

L'applicazione, quando avviata tramite Docker Compose, espone e utilizza le seguenti porte di default:

Nginx (Reverse Proxy): Porta 80 (HTTP) — Centralizza l'accesso all'intero ecosistema.
Backend (Node.js): Porta 3000 (o la porta definita nel tuo `.env`). Se si passa tramite Nginx, le richieste al backend verranno inoltrate automaticamente.
Database (PostgreSQL): Porta 5432. Se hai già un'istanza di PostgreSQL attiva sulla tua macchina locale, assicurati di spegnerla prima di avviare Docker Compose per evitare conflitti sulla porta 5432.
Frontend (Expo Metro Bundler): Porta 8081 (porta standard di Expo per il server di sviluppo).

---

## 🚀 Come Avviare l'Applicazione

L'infrastruttura server viene gestita interamente da Docker, mentre il bundler grafico di Expo viene lanciato in locale per permettere l'accoppiamento con lo smartphone.

1. Avvia i servizi server (Database, API Backend, Nginx)
    A seconda che sia la prima volta che avvii il progetto o un avvio quotidiano, usa il comando corretto:

* Primo Avvio (o dopo modifiche a dipendenze/Dockerfile):

  Dalla root del progetto, esegui il comando per buildare e avviare i container:
  ```bash
  npm run docker:up
  ```
  Il database verrà inizializzato automaticamente eseguendo lo script presente in `init_db/`
  ⚠️ **Nota:** Se ricevi un errore di "container unhealthy", consulta la sezione Troubleshooting in fondo.

* Avvii Successivi (Sviluppo Quotidiano):

  Dalla root del progetto, esegui il comando per avviare i container già buildati:
  ```bash
  docker compose up -d
  ```

2. Avvia l'applicazione mobile (Frontend)
    Mentre i container Docker sono attivi in background, lancia il frontend per generare il QR Code di Expo Go:
    ```bash
    npm run frontend
    ```
    ⚠️ **Nota:** Se ricevi un errore `TypeError: fetch failed`, consulta la sezione Troubleshooting in fondo.

    Inquadra il QR Code con la fotocamera (iOS) o dall'app Expo Go (Android) per testare l'applicazione.

    ⚠️ **Nota:** Se ricevi un errore `ERROR expo-notifications`, consulta la sezione Troubleshooting in fondo.

    ⚠️ **Nota:** Il comando di Expo terrà occupata questa finestra del terminale per mostrarti i log dell'app. Se in qualunque momento avessi bisogno di lanciare altri comandi ti basterà aprire un secondo terminale in parallelo.


3. Spegnimento
    Per spegnere tutti i container Docker e liberare le porte della tua macchina al termine della sessione di sviluppo:
    ```bash
    docker compose down
    ```
---

### 🔍 Risoluzione dei Problemi (Troubleshooting)

### ⚠️ Errore al primo avvio: `dependency failed to start: container outgrow_db is unhealthy`

Al primissimo avvio del progetto con il comando `npm run docker:up`, potresti riscontrare un errore simile al seguente:
> Container outgrow_db Error dependency db failed to start
> dependency failed to start: container outgrow_db is unhealthy

Perché succede?
Questo accade a causa di una temporanea race condition (disallineamento dei tempi di avvio). Durante la primissima build, il container del database (outgrow_db) deve inizializzare da zero il cluster di PostgreSQL ed eseguire gli script presenti in `init_db/`. Questa operazione richiede qualche secondo in più del previsto. Il backend, nel frattempo, tenta di avviarsi e richiede che il database sia già totalmente operativo (healthy). Se il database non risponde in tempo, Docker interrompe il processo di avvio del backend.

**Come risolvere:**
Non preoccuparti, il database ha comunque completato la sua inizializzazione in background. Ti basta resettare lo stato dei container eseguendo in sequenza:
```bash
docker compose up -d
docker compose down
```

### ⚠️ Errore lancio frontend: `TypeError: fetch failed`

All'avvio del frontend con il comando `npm run frontend`, l'interfaccia a riga di comando di Expo potrebbe bloccarsi restituendo l'errore seguente:
> TypeError: fetch failed

Questo errore non è legato a bug strutturali del codice o dell'applicazione, si tratta di un problema di sincronizzazione dell'infrastruttura locale:
1. **Race Condition:** I container Docker (Nginx, API) sono in fase di boot e non sono ancora pronti a rispondere quando Expo tenta la prima connessione.
2. **Rete Node.js:** Node.js a volte fallisce il primo instradamento dei DNS locali (IPv4 vs IPv6).

**Come risolvere:**
Non è necessaria alcuna modifica al codice. È sufficiente lanciare nuovamente il comando di avvio
```bash
npm run frontend.
```

### ⚠️ Errore: `ERROR expo-notifications`

La funzionalità di notifiche push Android fornita da expo-notifications è stata rimossa da Expo Go con il rilascio dell'SDK 53. Puoi tranquillamente ignorare questo errore, tenendo presente che sui dispositivi Android potrai testare solo delle notifiche locali. Questo problema non dovrebbe verificarsi su IOS.
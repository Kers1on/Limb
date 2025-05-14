## 🐳 Server (Matrix Synapse)

```bash
cd ../matrix
mkdir data
```

### Config generation (MacOS)

```bash
docker run -it --rm \
    -e SYNAPSE_SERVER_NAME=localhost \
    -e SYNAPSE_REPORT_STATS=no \
    -v $(pwd)/data:/data \
    matrixdotorg/synapse:latest generate
```

### Config generation (Windows PowerShell)

```bash
docker run -it --rm `
    -e SYNAPSE_SERVER_NAME=localhost `
    -e SYNAPSE_REPORT_STATS=no `
    -v ${PWD}\data:/data `
    matrixdotorg/synapse:latest generate
```

### Create /matrix/.env and put this

```env
SYNAPSE_SERVER_NAME=localhost
SYNAPSE_REPORT_STATS=no
```

### Start

```bash
docker-compose up -d
```

### Stop

```bash
docker-compose down
```

### Checkout

```bash
curl http://localhost:8008/_matrix/client/versions
```

### Open matrix/data/homeserver.yaml and put these

```bash
resources:
      - names: [client, federation, media]
        compress: false
```

after "media_store_path:"

```bash
enable_registration: true
enable_registration_without_verification: true
enable_search: true
max_upload_size: 1073741824
```

## Create root user for creating room for indexation users Matrix (MacOS)

```bash
docker exec -it matrix-synapse register_new_matrix_user \
    -c /data/homeserver.yaml http://localhost:8008
```

## Create root user for creating room for indexation users Matrix (Windows PowerShell)

```bash
docker exec -it matrix-synapse register_new_matrix_user `
    -c /data/homeserver.yaml http://localhost:8008
```

### In matrix/createIndexationRoom.js

```tsx
const accessToken = "example"; // Put here access_token from homeserver.db "access_tokens" table your root user
```

### Create First Public Room for indexation

```bash
node createIndexationRoom.js
```

### After creating room put roomId in client/src/pages/auth/index.tsx in handleRegistration()

```tsx
client.startClient();
client.joinRoom("!qwerty:localhost"); // <-- Put here roomId for indexation
setClient(client);
```

## Client

```bash
cd client
npm install
```

### Create /client/.env and put this

```env
VITE_BASE_URL="http://localhost:8008"
```

### Start Client

```bash
npm run dev
```

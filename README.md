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

### Restart docker after changing homeserver.yaml

```bash
docker-compose restart
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

And register first user.

### In matrix/.env after registration
Put here your access_token from homeserver.db "access_tokens" table
```env
ACCESS_TOKEN = "example"
```

### Create First Public Room for indexation

```bash
node createIndexationRoom.js
```

### After creating room put roomId in client/.env

```env
VITE_PUBLIC_ROOM="!example:domain"
```

Now it's ready to use. Have fun!
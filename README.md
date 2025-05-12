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

```bash
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
```

## Client

```bash
cd client
npm install
```

### Create /client/.env and put this

```bash
VITE_BASE_URL="http://localhost:8008"
```

### Start Client

```bash
npm run dev
```

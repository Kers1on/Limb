## Клієнт

```bash
cd client
npm install
npm run dev
```

## 🐳 Сервер (Matrix Synapse)

```bash
cd ../matrix
mkdir data
```

### Генерація конфігурації (MacOS)

```bash
docker run -it --rm \
    -e SYNAPSE_SERVER_NAME=localhost \
    -e SYNAPSE_REPORT_STATS=no \
    -v $(pwd)/data:/data \
    matrixdotorg/synapse:latest generate
```

### Генерація конфігурації (Windows PowerShell)

```bash
docker run -it --rm `
    -e SYNAPSE_SERVER_NAME=localhost `
    -e SYNAPSE_REPORT_STATS=no `
    -v ${PWD}\data:/data `
    matrixdotorg/synapse:latest generate
```

### Запуск

```bash
docker-compose up -d
```

### Зупинка

```bash
docker-compose down
```

### Перевірка

```bash
curl http://localhost:8008/_matrix/client/versions
```

## Вхід у Matrix (MacOS)

```bash
docker exec -it matrix-synapse register_new_matrix_user \
    -c /data/homeserver.yaml http://localhost:8008
```

## Вхід у Matrix (Windows PowerShell)

```bash
docker exec -it matrix-synapse register_new_matrix_user `
    -c /data/homeserver.yaml http://localhost:8008
```

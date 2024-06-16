# E2EC

Приложение по подготовке аналитической отчетности по настроенным шаблонам

## Развертывание приложения

### Локально

Для этого проделываем следующие шаги:

- забираем код и устанавливаем зависимости

```
git clone https://github.com/AnatoliyAksenov/e2e_catalog.git
cd e2e_catalog

poetry install
```

- Устанавливаем переменные окружения для back-end 

```
export E2EC_DATABASE=e2ec E2EC_DATABASE_USER=e2ec E2EC_DATABASE_PASSWORD=e2ec E2EC_DATABASE_HOST=localhost E2EC_DATABASE_PORT=5432
export E2EC_S3_HOST_PORT='localhost:9000' E2EC_S3_ACCESS_KEY=9JrrlWgZNPslN49P0ylR E2EC_S3_SECRET_KEY=KYXCbEmfZlxp9QJqkWWvxB0ZvwiAd7LoxCxo5w8n E2EC_S3_BUCKET=e2ec
```

- Для работы приложения необходимо запустить back-end от llama.cpp

```
#cpp версия
./llama.cpp/build/bin/server --model openchat-3.6-8b-20240522-IQ4_NL.gguf --n-gpu-layers 33 --port 7117

#python версия
python -m "llama_cpp.server" --model openchat-3.6-8b-20240522-IQ4_NL.gguf --n_gpu_layers -1 --n_ctx 10000 --port 7117
```

в зависимостях `poetry` уже есть `llama-cpp-python[server]`

- Необходимо поднять S3 файловое хранилище (мы использовали MinIO):

```
wget https://dl.min.io/server/minio/release/linux-amd64/minio
chmod +x minio
MINIO_ROOT_USER=admin MINIO_ROOT_PASSWORD=password ./minio server /mnt/data --console-address ":9001"
```

- Необходимо запустить сервер PostgreSQL, создать базу `e2ec`, пользователя `e2ec` с паролем `e2ec` или запустить оффициальный докер контейнер со следующими переменными окружения:

```
POSTGRES_PASSWORD: e2ec
POSTGRES_USER: e2ec
POSTGRES_DB: e2ec
```

- Создаем необходимые объекты в базе данных:

```
python init_db.py
```

- Запускаем back-end `e2e_catalog`

```
poetry run python app.py
```

- Запускаем front-end:

```
npm install
npm run dev
```


### Docker compose

- Запускаем `docker-compose`

```
docker-compose up
```







Docker with GPU
https://linuxconfig.org/setting-up-nvidia-cuda-toolkit-in-a-docker-container-on-debian-ubuntu
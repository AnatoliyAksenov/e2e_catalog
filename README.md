
Run llm api server:

- for llama.cpp
```
./llama.cpp/build/bin/server --model openchat-3.6-8b-20240522-IQ4_NL.gguf --n-gpu-layers 33 --port 7117
```

- for llama-cpp-python
```
python -m "llama_cpp.server" --model openchat-3.6-8b-20240522-IQ4_NL.gguf --n_gpu_layers -1 --n_ctx 10000 --port 7117
```

Run S3-like server (MinIO):
```
wget https://dl.min.io/server/minio/release/linux-amd64/minio
chmod +x minio
MINIO_ROOT_USER=admin MINIO_ROOT_PASSWORD=password ./minio server /mnt/data --console-address ":9001"
```

Run backend:
```
export E2EC_DATABASE=e2ec E2EC_DATABASE_USER=e2ec E2EC_DATABASE_PASSWORD=e2ec E2EC_DATABASE_HOST=localhost E2EC_DATABASE_PORT=5432
export E2EC_S3_HOST_PORT='localhost:9000' E2EC_S3_ACCESS_KEY=9JrrlWgZNPslN49P0ylR E2EC_S3_SECRET_KEY=KYXCbEmfZlxp9QJqkWWvxB0ZvwiAd7LoxCxo5w8n E2EC_S3_BUCKET=e2ec
```

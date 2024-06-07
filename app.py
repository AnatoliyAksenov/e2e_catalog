import random
from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware

from server.api import router as add_api

#set seed
random.seed(17)

app = FastAPI()

origins = [
    "http://localhost:5173",
    "localhost:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get('/ping')
async def get_ping():
    return Response(status_code=200)

app.include_router(add_api)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
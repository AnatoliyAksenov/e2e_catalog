import random
import sys

from time import time
from fastapi import FastAPI, Response
from fastapi.staticfiles import StaticFiles
#from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.cors import CORSMiddleware

from contextlib import asynccontextmanager

from server.api import router as add_api, set_duration

from server.model import model_api
from server.templates import templates

#set seed
random.seed(17)

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Lifespan started")
    model = model_api()
    template = templates.get('speed_test').get('prompt')

    start = time()
    res = model.call(template)
    duration  = time() - start
    print(res)
    print(f"Duration: {duration} seconds")
    set_duration(duration)
    #TODO Add db connection checking
    #TODO Add minio connection checking
    yield
    print("Lifespan finished")
    #todo stop tika server


app = FastAPI(lifespan=lifespan)

origins = [
    "http://localhost:5173",
    "localhost:5173",
    "https://localhost:5173",

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


app.mount("/assets", StaticFiles(directory="dist/assets"), name="static")

app.mount("/", StaticFiles(directory="dist",html = True), name="static-dist")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0",  port=8080, reload=False, workers=4)
from fastapi import APIRouter, Request, UploadFile
from typing import Annotated
from fastapi import Depends

from server.model import model_api
from server.sources import connection
from server.sources import file_storage

import server.processors as processes
router = APIRouter()


@router.get('/api/process_query')
async def process_query(request: Request, model: Annotated[object, Depends(model_api)]):
    question = request.query_params.get('q')
    theme = request.query_params.get('theme')

    print(question, ' ', theme)

    data = await processes.new_query(connection(), model, question, theme)
    return {"answer": data}

@router.get('/api/raw_dashboard_data')
async def new_dashboard(request: Request, model: Annotated[object, Depends(model_api)], connection: Annotated[object, Depends(connection)]):
   idx  = request.query_params.get('query_id')
   res  = await processes.raw_dashboard_data(connection, idx)

   return res


@router.post("/api/uploadfile/")
async def create_upload_file(request: Request, file: UploadFile, connection: Annotated[object, Depends(connection)], file_storage: Annotated[object, Depends(file_storage)]):

    key = await processes.store_file(connection, file_storage, file, file.filename)
    return {"filename": file.filename, "key": key}


@router.post('/api/process_query')
async def query(request: Request, model: Annotated[object, Depends(model_api)], connection: Annotated[object, Depends(connection)], file_storage: Annotated[object, Depends(file_storage)]):
    data = await request.json()

    print(data)

    res = await processes.query(connection, model, file_storage, data)
    return {"answer": res}


@router.get('/api/report_list')
async def report_list(request: Request, model: Annotated[object, Depends(model_api)], connection: Annotated[object, Depends(connection)]):
    date_from = request.query_params.get('date_from', '1970-01-01')
    res  = await processes.report_list(connection, date_from)
    return res


# @router.post('/api/sql_question')
# async def sql_question(request: Request, model: Annotated[object, Depends(model_api)], connection: Annotated[object, Depends(connection)]):
#     params = await request.json()
#     query = params.get('query')
#     template = params.get('template')
#     database = params.get('database')
#     sql = params.get('sql')

#     res = process.main_pipeline(model, connection.get('connection'), query, template, database, sql)
#     print(res)
#     return res



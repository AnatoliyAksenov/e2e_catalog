from fastapi import APIRouter, Request, UploadFile, BackgroundTasks
from fastapi.responses import FileResponse, StreamingResponse, RedirectResponse
from typing import Annotated
from fastapi import Depends
from io import BytesIO

from server.model import model_api
from server.sources import connection
from server.sources import file_storage

import server.processors as processes



router = APIRouter()

_duration = 100

def set_duration(duration):
    global _duration
    _duration  =  duration

@router.get('/api/duration')
async def duration(request: Request):
    return  {"duration": _duration}


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


@router.post('/api/save_template')
async def save_template(request: Request, connection: Annotated[object, Depends(connection)]):
    params = await request.json()

    res = await processes.save_template( connection, params)
    return res


@router.post('/api/save_variables')
async def update_values(request: Request, connection: Annotated[object, Depends(connection)]):
    params = await request.json()

    res = await processes.update_values( connection, params)
    return res


@router.get('/api/questions_config')
async def questions_config(request: Request, connection: Annotated[object, Depends(connection)]):
 
    res  = await processes.questions_config(connection)
    return res


@router.post('/api/company_query')
async def query(request: Request, model: Annotated[object, Depends(model_api)], connection: Annotated[object, Depends(connection)], file_storage: Annotated[object, Depends(file_storage)], background_tasks: BackgroundTasks):
    data = await request.json()

    res = await processes.register_question(connection, data)
    query_id = res
    background_tasks.add_task( processes.company_query,  connection, model, file_storage, query_id, data)

    return {"id": query_id}

@router.get('/api/question_status/{id}')
async def question_status(request: Request, id: int, connection: Annotated[object, Depends(connection)]):
    idx = request.path_params.get('id')
    res  = await processes.question_status(connection, idx)
    return {"status": res}



@router.get('/api/question_report/{id}')
async def question_report(request: Request, id: int, connection: Annotated[object, Depends(connection)]):
    idx = request.path_params.get('id')
    res  = await processes.question_report(connection, idx)
    return res


@router.get('/api/question_pdf_report/{id}')
async def question_report(request: Request, id: int, connection: Annotated[object, Depends(connection)]):
    idx = request.path_params.get('id')
    res  = await processes.question_pdf_report(connection, idx)
    return StreamingResponse(content=BytesIO(res), media_type="application/pdf", headers={'Content-Disposition': 'attachment; filename="report_%s.pdf"'%idx })



@router.get('/api/blacklist')
async def blacklist(request: Request, connection: Annotated[object, Depends(connection)]):
    res  = await processes.get_blacklist(connection)
    return res



@router.get('/api/closed_sources')
async def blacklist(request: Request, connection: Annotated[object, Depends(connection)]):
    res  = await processes.get_closed_sources(connection)
    return res


@router.get('/dashboards')
async def dashboards():
    return RedirectResponse(url='/')


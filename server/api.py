from fastapi import APIRouter, Request
from typing import Annotated
from fastapi import Depends

from server.model import model_api
from server.sources import connection

import server.processors as processes
router = APIRouter()


@router.get('/api/process_query')
async def process_query(request: Request, model: Annotated[object, Depends(model_api)]):
    question = request.query_params.get('q')
    theme = request.query_params.get('theme')

    print(question, ' ', theme)

    data = processes.new_query(connection(), model, question, theme)
    return {"answer": data}

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



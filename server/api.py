from fastapi import APIRouter, Request
from typing import Annotated
from fastapi import Depends

from server.models import model_api
from server.sources import connection

import server.process as process
router = APIRouter()


# @router.get('/api/simple')
# async def simple(request: Request, model: Annotated[object, Depends(model_api)]):
#     question = request.query_params.get('question')
#     data = model.call(question)
#     return {"answer": data}

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


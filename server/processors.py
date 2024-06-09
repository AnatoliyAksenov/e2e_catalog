import json
import time

import asyncio

from json_repair import repair_json

from server.sources import E2ec

from server.templates import templates
from server.utils import process_query

from pandas import json_normalize




async def what_we_do(connection, model, question, theme):
    """
    We are a team of people who are passionate about technology and technology is the future of the world.
    """
    
    prompt = templates.get('what_we_do').get('prompt').format(question=question, theme=theme)
    
    return model.call(prompt)


async def process_question(connection, model, question, idx):
    # retrive urls and extract text 
        urls = await process_query(question)
        
        # check if text answers to the query
        prompt = templates.get('yes_or_no').get('prompt')
        summary_prompt = templates.get('summarization').get('prompt')
        table_prompt  = templates.get('table').get('prompt')
        dates_prompt  = templates.get('dates').get('prompt')

        #print(prompt)

        if prompt:

            # yes or no
            #TODO: add RAG search and User's attached sources
            for url in urls:

                if not url.get('text'):
                    print('Skipped url: {}'.format(url.get('link')))
                    continue

                p = prompt.format(q=question, text=url.get('text'))

                start = time.time()
                try:
                    data = model.call(p)
                    res = data.strip().lower().startswith('yes')
                    #connection.execute("insert into urls(query_id, url, question, content_type, template_key, summary, summary_model, execution_time) values  (?,?,?,?,?,?,?,?)",  (idx,  url.get('link'), question, url.get('type'), 'yes_or_no', data.strip().lower(), model.name, time.time() - start))

                    E2ec.insert_urls(connection, query_id= idx, url=url.get('link'), question=question, content_type=url.get('type'), template_key='yes_or_no', summary=data.strip().lower(), summary_model=model.name, execution_time=time.time()  - start)


                    if res:
                        # summary
                        s = summary_prompt.format(q=question, text=url.get('text'))
                        start = time.time()
                        data = model.call(s)

                        #connection.execute("insert into urls(query_id, url, question, content_type, template_key, summary, summary_model, execution_time) values  (?,?,?,?,?,?,?,?)",  (idx,  url.get('link'), question,  url.get('type'), 'summarization', data.strip().lower(), model.name, time.time() - start))
                        E2ec.insert_urls(connection, query_id= idx, url=url.get('link'), question=question, content_type=url.get('type'), template_key='summarization', summary=data.strip().lower(), summary_model=model.name, execution_time=time.time()  - start)

                        # dates
                        d = dates_prompt.format(text=url.get('text'))
                        start = time.time()
                        data = model.call(d)

                        #connection.execute("insert into urls(query_id, url, question, content_type, template_key, summary, summary_model, execution_time) values  (?,?,?,?,?,?,?,?)",  (idx,  url.get('link'), question,  url.get('type'), 'dates', data.strip().lower(), model.name, time.time() - start))
                        E2ec.insert_urls(connection, query_id= idx, url=url.get('link'), question=question, content_type=url.get('type'), template_key='dates', summary=data.strip().lower(), summary_model=model.name, execution_time=time.time()  - start)

                        # table
                        t = table_prompt.format(text=url.get('text'))
                        start = time.time()
                        data = model.call(t)

                        #connection.execute("insert into urls(query_id, url, question, content_type, template_key, summary, summary_model, execution_time) values  (?,?,?,?,?,?,?,?)",  (idx,  url.get('link'),question,  url.get('type'), 'table', data.strip().lower(), model.name, time.time() - start))
                        E2ec.insert_urls(connection, query_id= idx, url=url.get('link'), question=question, content_type=url.get('type'), template_key='table', summary=data.strip().lower(), summary_model=model.name, execution_time=time.time()  - start)


                except Exception as e:
                    print(e)


async def new_query(connection, model, caption, theme):

    #idx = connection.execute("insert into queries (query, theme) values (?,?) returning id", (caption, theme)).fetchall()[0][0] #🤯

    idx = E2ec.insert_queries(connection, caption=caption, theme=theme)

    status = 500

    
    print(caption)
    try:

        question_prompt = templates.get('google_search_engine').get('prompt').format(q=caption, theme=theme)

        questions = model.call(question_prompt)

        questions = repair_json(questions)

        #connection.execute("update queries set questions = ? where id = ?",  (questions, idx))
        E2ec.update_queries(connection, query_id=idx, questions=questions)

        qobj = json.loads(questions)

        #TODO: Add User's suggested queries 

        for qp in qobj:
            question = None
            if isinstance(qp, str):
                question = qp.strip()
    
            if isinstance(qp, dict):
                question = qp.get('query') or qp.get(list(qp.keys())[0])

            
            print(question)
            await process_question(connection, model, question, idx)

        
        #connection.execute("insert into query_logs(query_id, step, status) values (?,?,?)", (idx, 'process urls', 0))
        E2ec.insert_query_logs(connection, query_id=idx, step='process urls', status=0)
    except Exception as e:
        #connection.execute("insert into query_logs (query_id, step, status, log) values(?,?,?,?)", (idx, 'query url list', 500, str(e)))
        E2ec.insert_query_logs(connection, query_id= idx, step='process urls', status=500, log=str(e))

    return idx


async def raw_dashboard_data(connection, idx):

    data = E2ec.select_raw_urls(connection, query_id=idx)

    res = []

    for d in data:
        prepared = {}
        c = d.get('content')
        if d.get('template_key') in ('table', 'dates'):
            c = repair_json(c)
            c = json.loads(c)

            df = json_normalize(c)
            if len(df) == 1:
                prepared['content'] = df.T.to_json(orient='records', index=False, force_ascii=False)
            else:
                pass
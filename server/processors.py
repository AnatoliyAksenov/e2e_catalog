import json
import time

import asyncio

from json_repair import repair_json

from server.templates import templates
from server.utils import process_query




def what_we_do(connection, model, question, theme):
    """
    We are a team of people who are passionate about technology and technology is the future of the world.
    """
    
    prompt = templates.get('what_we_do').get('prompt').format(question=question, theme=theme)
    
    return model.call(prompt)


def new_query(connection, model, question, theme):

    idx = connection.execute("insert into queries (query, theme) values (?,?) returning id", (question, theme)).fetchall()[0]
    status = 500

    

    try:

        question_prompt = templates.get('google_search_engine').get('prompt').format(q=question, theme=theme)

        questions = model.call(question_prompt)

        questions = repair_json(questions)

        q = json.loads(questions)

        print(q)

        question = q[0]

        urls = process_query(connection, model, question, theme)
        

        prompt = templates.get('yes_or_no').get('prompt')

        
        # yes or no
        for url in urls:
            
            p = prompt.format(q=question, text=url[2])

            start = time.time()
            try:
                summary = model.call(p)
                connection.execute("insert into urls(query_id, url, content_type, template_key, summary, summary_model, execution_time) values  (?,?,?,?)",  (idx,  url[0],  url[1], 'yes_or_no', summary, model.name, time.time() - start))
                
            except Exception as e:
                pass


        # summary


        connection.execute("insert into query_logs(query_id, step, status) values (?,?,?)", (idx, 'process urls', 0))
            

        
    except Exception as e:
        connection.execute("insert into query_log (query_id, stem, status, log) values(?,?,?)", (idx, 'query url list', 500, str(e)))

    return idx


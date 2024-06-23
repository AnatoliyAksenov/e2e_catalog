import re
import json
import time

import asyncio
import pendulum

from json_repair import repair_json

from server.sources import E2ec
from server.sources import FILE_STORAGE_BUCKET

from server.templates import templates
from server.utils import process_query, get_text_by_link, get_links, headers, get_closed_resource_data

from jinja2 import Environment, BaseLoader, Undefined

import pandas as pd

import random
import string
import textdistance

from time import time

from tika import parser

from weasyprint import HTML


#BLACKLIST = ['google.com', 'microsoft.com', ]

class SilentUndefined(Undefined):
    '''
    Dont break pageloads because vars arent there!
    '''
    def _fail_with_undefined_error(self, *args, **kwargs):
        print('JINJA2: something was undefined!')
        return None


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


def parse_date(dd):
    """
    Function that parses a given date string and attempts to convert it to a standard ISO format.
    
    This function uses the pendulum library to parse the date and applies a formatting conversion to match the ISO format. 
    If the parsing fails, the original date string is returned.
    
    Parameters
    ----------
    dd : str
        The date string to be parsed.
    
    Returns
    -------
    str
        The parsed date in ISO format or the original date string if parsing failed.
    """
    try:
        return pendulum.parse(dd).strftime('%Y-%m-%dT%H:%M:%S')
    except:
        pass
    return dd


async def raw_dashboard_data(connection, idx):

    data = E2ec.select_raw_urls(connection, query_id=idx)

    res = []

    for d in data:
        prepared = {}
        
        prepared['type']  = d.get('template_key')
        prepared['question'] = d.get('question')

        c = d.get('content')
        if d.get('template_key') in ('table', 'dates'):
            try:
              c = repair_json(c)
              c = json.loads(c)
            except:
                continue 

            try:
                df = pd.json_normalize(c)
            except:
                pass
                df = pd.DataFrame()

            if len(df) == 1:
                dd = df.T.reset_index().reset_index()
                dd.columns = ['key','parameter', 'value']
                # works well but too overwhelmed
                # if prepared.get('type') == 'dates':
                #     dd.key = dd.key.apply(lambda x: parse_date(x))
                prepared['content'] = dd.to_json(orient='records', index=False, force_ascii=False)
                
                res.append(prepared)
            else:
                # looks not good
                # we not want to get it
                # print(df)
                pass

        else:
            prepared['content']  = d.get('content')
            res.append(prepared)

    return res


async def store_file(connection, file_storage, content, file_name):
    """
    Asynchronous method that stores a file in the designated storage location and creates an entry for it in the database.
    
    This method generates a unique key for the file, uploads the file to the storage bucket, and inserts a record into the database with the file details.
    
    Parameters
    ----------
    connection : Database Connection Object
        An established connection to the database where the file entries will be created.
    file_storage : File Storage Object
        The storage system for uploaded files.
    content : Content Object
        The file content and metadata needed to store the file.
    file_name : str
        The name of the file being stored.
    
    Returns
    -------
    key : str        The generated unique key associated with the stored file.
    """

    # we are using seed and there we have to use new seed to get unique key
    key = "".join(random.Random(time()).choices(string.ascii_letters,k=32))
    file_storage.put_object(FILE_STORAGE_BUCKET, key, content.file, content.size)
    E2ec.insert_file(connection, file_name=file_name, key=key, content_type=content.content_type)
    return key


async def query(connection, model, file_storage, data):

    temperature = data.get('temperature',0.1)
    
    contents = [file_storage.get_object(FILE_STORAGE_BUCKET, x) for x in data.get('files',[])]
    files = [E2ec.select_file(connection, x) for x in data.get('files',[])]

    parsed = [parser.from_buffer(x.data) for x in contents]

    content = "\n".join([x.get('content') for x in parsed if x.get('content')])

    print(len(content))

    #TODO Not finished
    pass


async def validate(model, query, collection):
    """
    Asynchronous method that validates a collection of answers using the provided query.
    
    This method checks the validity of the collection using the provided model and question. 
    It then updates the query status accordingly.
    
    Parameters
    ----------
    model  : Model Object
        The llm model used for generating responses.
    query  : Query Object
        The query object containing the validation question.
    collection  : Collection Object
        The collection object containing the information for validation.
    
    Returns
    -------
    string
    """
    prompt = templates.get('validation').get('prompt')
    temp = templates.get('validation').get('temperature', 0.5)

    coll = [x.get('answer') for x in collection]
    text = str(coll)

    res = model.call(prompt.format(q=query, text=text), temp=temp)
    res  = res.strip()

    i = text.find(res)

    if res in coll:
        index = coll.index(res)
    else:
        # find by levensstain distance 
        min_index  = 0
        min_distance = float('inf')
        for i,x in enumerate(coll):
            dist = textdistance.algorithms.levenshtein(x.lower(), res.lower())
            if dist < min_distance:
                min_distance = dist
                min_index = i

        index = min_index

    return collection[int(index)]


async def company_query(connection, model, file_storage, query_id, data):
    """
    Asynchronous method that queries a company's information using the provided parameters.
    
    This method queries the database for a specific company's information based on the given query ID and data. 
    It then parses the response and updates the query status accordingly.
    
    Parameters
    ----------
    connection : Database Connection Object
        An established connection to the database where the reports are stored.
    model : Model Object
        The neural network model used for generating responses.
    file_storage : File Storage Object
        The storage system for uploaded files.
    query_id : int
        The unique identifier for the query being processed.
    data : dict
        The input data containing the necessary information for processing the.
    
    Returns
    -------
    None
    """

    key = data.get('question_key')

    BLACKLIST = E2ec.get_url_blacklist(connection)

    
    contents = [file_storage.get_object(FILE_STORAGE_BUCKET, x) for x in data.get('files',[])]
    files = [E2ec.select_file(connection, x) for x in data.get('files',[])]

    parsed = [parser.from_buffer(x.data) for x in contents]

    content = "\n".join([x.get('content') for x in parsed if x.get('content')])

    f = data.get('files')
    temperature = data.get('temperature', 0.1)
    use_internet = data.get('use_internet', False)
    use_closed_sources = data.get('use_closed_sources', False)
    additional_questions = data.get('additional_questions', [])
    get_results = data.get('get_results', 3)

    conf = E2ec.get_question_config(connection, question_key=key)
    query = E2ec.get_query(connection, query_id)
    closed_res = None
    variables = {}

    if not use_internet and content:
        # search only in content
        
        # collect answers from attached content
        for q in conf.get('question_values'):
            only_question = q.get('variable')
            question = f" '{only_question}' по компании '{query.get('query')}'"
            key = q.get('key')

            prompt = templates.get('simple_question').get('prompt')
            temp = templates.get('simple_question').get('temperature', 0.5)
            prompt = prompt.format(q=question, text=content)
            

            res = model.call(prompt, temp=temp)
            variables[key] = res

        # validate answers

        E2ec.update_query_params(connection, query_id, params=variables)
        E2ec.update_query_status(connection, query_id, 0)

        return
    

    # get inn
    request_params = {'headers': headers, "timeout": 5}
    inn_query = f" ИНН компании {query.get('query')} "
    links = get_links('ddg', query_params={"q":inn_query}, request_params=request_params)
    links = [x for x in links if x.startswith('http')]
    links = [x for x in links if not any([xx in x for xx in BLACKLIST])]

    question_prompt = templates.get('simple_question').get('prompt')
    temp = templates.get('simple_question').get('temperature',  0.5)

    inn = None
    for link in links:
        text = await get_text_by_link(link, request_params=request_params)
        text =re.sub('\s{2,}', ' ', text)
        inn_prompt = question_prompt.format(text=text, q=inn_query)
        res = model.call(inn_prompt,  temp=temperature)
        res = res.strip()

        if res and re.findall('[0-9]{10}',res):
            findarr = re.findall('[0-9]{10}', res)
            if findarr:
                variables['inn']  = findarr[0]
                inn = findarr[0]
                break
    
    
    # for loop by user defined variables
    for q in conf.get('question_values'):
        only_question = q.get('variable')
        question = f" '{only_question}' компания '{query.get('query')}' ИНН {inn}"
        key = q.get('key')

        links = get_links('ddg', query_params={"q":question}, request_params=request_params)
        links = [x for x in links if x.startswith('http')]
        links = [x for x in links if not any([xx in x for xx in BLACKLIST])]
        links = list(set(links))

        # collect answers from 
        collection  = []
        cnt = 0
        for link in links:
            text = await get_text_by_link(link, request_params=request_params)
            text =re.sub('\s{2,}', ' ', text or '')

            if text:
                qprompt = question_prompt.format(text=text, q=only_question)
                res = model.call(qprompt,  temp=temperature)
                res = res.strip()
                collection.append({'link': link, 'answer': res})
                cnt += 1

                #TODO looging requests and model answers
                if cnt == get_results:
                    break
        else:
            # we have no answers
            variables[key] = {"link": '', "answer": ''}

        res = await validate(model, only_question, collection)
        variables[key] = res
                       
    E2ec.update_query_params(connection, query_id, params=variables)

    
    if use_closed_sources:
        #closed_res = E2ec.get_closed_resources(connection)
        try:
            data = await get_closed_resource_data(request_params=request_params, inn=inn)
            E2ec.update_query_table(connection, query_id, table=data)

        except Exception as e:
            print(e)

    
    E2ec.update_query_status(connection, query_id, 0)


async def report_list(connection, date_from):
    """
    Asynchronous method that queries the database for a list of reports based on the given date from which to start reporting.
    
    Parameters
    ----------
    connection : Database Connection Object
        An established connection to the database where the reports are stored.
    date_from : datetime object or str
        The starting date (inclusive) for the reports to be queried.
        
    Returns
    -------
    data : list
        A list of dictionaries containing the report information queried from the database.
    
    Raises
    ------
    ValueError
        If the provided `date_from` is not in a valid format or cannot be parsed.
    """
    data  = E2ec.select_queries(connection, date_from)

    return data


async def save_template(connection, params):
    question_key = params.get('template_key')
    template = params.get('template')
    data = E2ec.update_template(connection, question_key, template)

    return data


async def update_values(connection, params):
    """This function takes two required arguments: `connection` which is an established database connection, 
       and `params` which contains necessary information to perform the update operation. 
       The function returns the updated data after execution.
    
    :param connection: An established database connection object.
    :param params: A dictionary containing 'question_key' and 'variables' keys with corresponding values needed for the update operation.
    :return: The updated data after executing the update operation.
    """

    question_key  = params.get('question_key')
    variables  = params.get('variables')
    data  = E2ec.update_values(connection, question_key, variables)

    return data


async def questions_config(connection):
    """Async function that retrieves the configurations for all questions.
    
    This function queries the database for the configurations 
    of all available questions and returns a list of dictionaries containing the configurations.

    :param connection: A database connection object used to query the database.
    :return: A list of dictionaries containing the configurations for all questions.
    """

    data = E2ec.get_questions_configs(connection)

    return data


async def question_status(connection, query_id):
    """Async function that retrieves the status of a given question.
    
    This function queries the database for the specified question and returns its status.

    :param connection: A database connection object used to query the database.
    :param query_id: The ID of the question whose status should be retrieved.
    :return: The status of the question as a string.
    """

    data = E2ec.get_query(connection, query_id)

    return data.get('status')


async def question_report(connection, query_id):
    """Async function that generates a report for a given question.
    
    This function retrieves the question details and configuration from the database, 
    renders the template, and returns the rendered report along with the question and config data.

    :param connection: A database connection object used to query the database.
    :param query_id: The ID of the question for which to generate the report.
    :return: A tuple containing the rendered report, question data, and config data.
    """

    data = E2ec.get_query(connection, query_id)

    conf = E2ec.get_question_config(connection, question_key=data.get('theme'))

    rtemplate = Environment(loader=BaseLoader(), undefined=SilentUndefined).from_string(conf.get('template'))
    report = rtemplate.render(**json.loads(data.get('params')))

    return (report, data, conf)


async def question_pdf_report(connection, query_id):
    """Function that generates a PDF report for a given question.
    
    This function retrieves the question details and configuration from the database, renders the template, 
    and creates a PDF file containing the rendered content.

    :param connection: A database connection object used to query the database.
    :param query_id: The ID of the question for which to generate the report.
    :return: A binary file representing the generated PDF report.
    """

    data = E2ec.get_query(connection, query_id)

    conf = E2ec.get_question_config(connection, question_key=data.get('theme'))

    rtemplate = Environment(loader=BaseLoader()).from_string(conf.get('template'))
    data = rtemplate.render(**json.loads(data.get('params')))

    html = f"""<html><head></head><body>
    <pre>{data}</pre>
    </body></html>"""

    file = HTML(string=html).write_pdf()

    return file


async def register_question(connection, params):
    """Async function that registers a new question in the database.
    
    This function takes a set of parameters describing the question and its settings, and inserts them into the database using the provided connection object. 
    The returned data contains the ID of the newly registered question.

    :param connection: A database connection object used to insert the question into the database.
    :param params: A dictionary containing the following keys: 'question_key', 'question', 'theme', 'files', 'temperature', 'use_internet', 'use_closed_resources', and 'additional_questions'.
    :return: A dictionary containing the ID of the newly registered question.
    """
    question_key   = params.get('question_key')
    question  = params.get('question')
    theme  = params.get('theme')

    params = {
       "files": params.get('files', []),
       "temperature": params.get('temperature', 0.1),
       "use_internet": params.get('use_internet', False),
       "use_closed_resources": params.get('use_closed_resources', False),
       "additional_questions": params.get('additional_questions', []),
    }

    data  = E2ec.insert_queries(connection, caption=question, theme=question_key, params=params)
    return data



async def get_blacklist(connection):
    """Async function that retrieves the URL blacklist from the database.
    
    This function queries the database for the URL blacklist using the provided connection object. 
    The returned data is in the form of a list of strings, where each string represents a single blacklisted URL.

    :param connection: A database connection object used to query the database.
    :return: A list of strings containing blacklisted URLs.
    """
    data  = E2ec.get_url_blacklist(connection)

    return data


async def get_closed_sources(connection):
    """Async function that retrieves closed sources from the database.
    
    This function queries the database for a list of closed sources using the provided connection object. 
    The returned data is in the form of a list of dictionaries, where each dictionary represents a single closed source.

    :param connection: A database connection object used to query the database.
    :return: A list of dictionaries containing information about the closed sources.
    """
    data  = E2ec.get_closed_sources(connection)

    return data
import os
import json
import psycopg2
import minio

def update(d, u):
    for k, v in u.items():
        if isinstance(v, dict):
            d[k] = update(d.get(k, {}), v)
        else:
            d[k] = v
    return d

class E2ec:

    @staticmethod
    def insert_urls(conn, /, query_id, url, question, content_type, template_key, summary, summary_model, execution_time):
        """
            Static method that inserts a new URL into the database and returns its ID.
            
            This method accepts a connection object, query ID, URL, question, content type, template key, summary, summary model, and execution time as parameters. It then executes an SQL statement to insert the data into the URLs table and returns the newly assigned ID.
            
            Parameters
            ----------
            conn : Connection Object
                An open database connection.
            query_id : int
                The unique identifier for the query associated with the URL.
            url : str
                The URL to be inserted into the database.
            question : str
                The question related to the URL.
            content_type str
                The content type of the URL.
            template_key : str
                The template key associated with the URL.
            summary : str
                The summary of the URL content.
            summary_model : str
                The model used to generate the summary.
            execution_time : float
                The time taken to execute the query.
            
         Returns
            -------
            int
                The ID of the newly inserted URL.
        """
        with conn.cursor() as cur:

            q = """insert into urls(query_id, url, question, content_type, template_key, summary, summary_model, execution_time) 
                                     values  ( %(query_id)s, %(url)s, %(question)s, %(content_type)s, %(template_key)s, %(summary)s, %(summary_model)s, %(execution_time)s) returning id"""
            p = {"query_id": query_id, 'url': url, 'question': question, 'content_type': content_type, 'template_key': template_key, 'summary': summary, 'summary_model': summary_model, 'execution_time': execution_time}
            cur.execute(q,p)

            res  = cur.fetchone()[0]
            return res


    @staticmethod
    def insert_queries(conn, /, caption, theme, params=None):
        with conn.cursor() as cur:
            q = """insert into queries(query, theme, params) values  ( %(query)s, %(theme)s, %(params)s) returning id"""
            p = {"query": caption, 'theme': theme, 'params': json.dumps(params, ensure_ascii=False, default=str)}
            cur.execute(q,p)
            res = cur.fetchone()[0]

            return res

    @staticmethod
    def update_queries(conn, /, query_id, questions):
        with conn.cursor() as cur:
            q = """update queries set questions = %(questions)s where id = %(query_id)s"""
            p = {"query_id": query_id,  'questions': questions}
            cur.execute(q,p)

            return True
        
    @staticmethod
    def update_query_status(conn, /, query_id, status):
        with conn.cursor() as cur:
            q = """update queries set status = %(status)s where id = %(query_id)s"""
            p = {"query_id": query_id,  'status': status}
            cur.execute(q,p)

            return True
            
    @staticmethod
    def update_query_params(conn, /, query_id, params):
        with conn.cursor() as cur:

            # jsonb_set and jsonb_insert cannot do that correctly
            q = """select  params from queries where id = %(query_id)s"""
            p = {"query_id": query_id}
            cur.execute(q,p)
            res = cur.fetchone()[0]
            resj = json.loads(res)
            resj.update(params)
            q = """update queries set params = %(params)s where id = %(query_id)s"""
            p = {"query_id": query_id,  'params': json.dumps(resj, ensure_ascii=False, default=str)}
            cur.execute(q,p)

            return True
        

    @staticmethod
    def update_query_table(conn, /, query_id, table):
        with conn.cursor() as cur:

            q = """update queries set table_data = %(table)s where id = %(query_id)s"""
            p = {"query_id": query_id,  'table': json.dumps(table, ensure_ascii=False, default=str)}
            cur.execute(q,p)

            return True
        
        
    @staticmethod
    def insert_query_logs(conn, /, query_id, step, status, log=None):
        with conn.cursor() as cur:
            q  = """insert into query_logs(query_id, step, status) values  ( %(query_id)s,  %(step)s,  %(status)s, %(log)s) returning id"""
            p  = {"query_id": query_id,  'step': step,  'status': status, 'log': log}
            cur.execute(q,p)
            res  = cur.fetchone()[0]
            cols = [x.name for x in cur.description]
            return [dict(zip(cols,x)) for x in res]
        
    @staticmethod
    def select_raw_urls(conn,  /, query_id):
        with conn.cursor() as cur:
            q  = """select question
                         , url
                         , template_key 
                         , summary content
                      from urls
                     where template_key != 'yes_or_no'
                       and query_id = %(query_id)s
                     order by ins_date """
            
            p  = {"query_id": query_id}
            cur.execute(q,p)
            res = cur.fetchall()
            cols = [x.name for x in cur.description]
            return [dict(zip(cols,x)) for x in res]

    @staticmethod
    def insert_file(conn, /, key, file_name, content_type):
        with conn.cursor() as cur:
            q  = """insert into files(key, file_name, content_type) values  ( %(key)s,  %(file_name)s, %(content_type)s)"""
            p  = {"key": key,  'file_name': file_name, 'content_type': content_type}
            cur.execute(q,p)
            
            return True

    @staticmethod
    def select_file(conn, /, key):
        with conn.cursor() as cur:
            q   = """select file_name, content_type
                      from files
                     where key  =  %(key)s"""
            p   = {"key": key}
            cur.execute(q,p)
            res  = cur.fetchall()
            cols  = [x.name for x in cur.description]
            return [dict(zip(cols,x)) for x in res]
        
    @staticmethod
    def select_queries(conn, /, date_from='1970-01-01'):
        with conn.cursor() as cur:
            q = """select *
                    from queries
                    where ins_date >= %(date_from)s
                    order by ins_date desc
                """
            p = {"date_from": date_from}
            cur.execute(q,p)
            res  = cur.fetchall()
            cols  = [x.name for x in cur.description]
            return [dict(zip(cols,x)) for x in res]
        

    @staticmethod
    def get_query(conn, /, query_id):
        with conn.cursor() as cur:
            q = """select *
                    from queries
                    where id = %(query_id)s"""
            p = {"query_id": query_id}
            cur.execute(q,p)
            res  = cur.fetchone()
            cols  = [x.name for x in cur.description]
            return dict(zip(cols,res))


    @staticmethod
    def update_template(conn, /, question_key, template):
        with conn.cursor() as cur:
            q = """update questions_config
                    set question_template = %(template)s
                    where question_key = %(question_key)s"""
            p = {"question_key": question_key, "template": template}
            cur.execute(q,p)
            return True
        
    @staticmethod
    def update_values(conn, /, question_key, variables):
        with conn.cursor() as cur:
            q = """update questions_config
                    set question_values = %(variables)s
                    where question_key = %(question_key)s"""
            p = {"question_key": question_key, "variables": json.dumps(variables, ensure_ascii=False, default=str)}
            cur.execute(q,p)
            return True
        
    @staticmethod
    def get_questions_configs(conn):
        with conn.cursor() as cur:
            q = """select id
                        , question_key
                        , label
                        , description     
                        , question_template template
                        , question_values::json question_values
                     from questions_config
                     """

            cur.execute(q)
            res  = cur.fetchall()
            cols  = [x.name for x in cur.description]
            return [dict(zip(cols,x)) for x in res]
        
    @staticmethod
    def get_question_config(conn, /, question_key):
        with conn.cursor() as cur:
            q = """select id
                        , question_key
                        , label
                        , description     
                        , question_template template
                        , question_values::json question_values
                     from questions_config
                    where question_key  =  %(question_key)s
                     """
            p = {"question_key": question_key}
            cur.execute(q, p)
            res  = cur.fetchone()
            cols  = [x.name for x in cur.description]
            return dict(zip(cols,res))
        
    @staticmethod
    def get_url_blacklist(conn):
        with conn.cursor() as cur:
            q = """select url
                        from url_blacklist
                     """
            cur.execute(q)
            res  = cur.fetchall()
            return [x[0] for x in res]

    @staticmethod
    def get_closed_sources(conn):
        with conn.cursor() as cur:
            q = """select * from closed_sources"""
            cur.execute(q)
            res  = cur.fetchall()
            cols  = [x.name for x in cur.description]
            return [dict(zip(cols,x)) for x in res]


config = {k:v for k,v in os.environ.items() if k.startswith('E2EC_')}



_conn2 = psycopg2.connect(database=config.get('DATABASE', 'e2ec'), user=config.get('DATABASE_USER', 'e2ec'), password=config.get('DATABASE_PASSWORD', 'e2ec'), host=config.get('DATABASE_HOST', 'localhost'), port=config.get('DATABASE_PORT', '5432'))
_conn2.set_session(autocommit=True)


_file_storage =  minio.Minio(config.get('S3_HOST_PORT','localhost:9000'), access_key=config.get('S3_ACCESS_KEY','9JrrlWgZNPslN49P0ylR'), secret_key=config.get('S3_SECRET_KEY','KYXCbEmfZlxp9QJqkWWvxB0ZvwiAd7LoxCxo5w8n'), secure=False)

FILE_STORAGE_BUCKET  = config.get('S3_BUCKET',  'e2ec')

def connection():

    return _conn2

def file_storage():
    return _file_storage
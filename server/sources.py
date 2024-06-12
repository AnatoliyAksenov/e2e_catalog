import os
import psycopg2
import minio

class E2ec:

    @staticmethod
    def insert_urls(conn, /, query_id, url, question, content_type, template_key, summary, summary_model, execution_time):
        with conn.cursor() as cur:

            q = """insert into urls(query_id, url, question, content_type, template_key, summary, summary_model, execution_time) 
                                     values  ( %(query_id)s, %(url)s, %(question)s, %(content_type)s, %(template_key)s, %(summary)s, %(summary_model)s, %(execution_time)s) returning id"""
            p = {"query_id": query_id, 'url': url, 'question': question, 'content_type': content_type, 'template_key': template_key, 'summary': summary, 'summary_model': summary_model, 'execution_time': execution_time}
            cur.execute(q,p)

            res  = cur.fetchone()[0]
            return res


    @staticmethod
    def insert_queries(conn, /, caption, theme):
        with conn.cursor() as cur:
            q = """insert into queries(query, theme) values  ( %(query)s, %(theme)s) returning id"""
            p = {"query": caption, 'theme': theme}
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



config = {k:v for k,v in os.environ.items() if k.startswith('E2EC_')}



_conn2 = psycopg2.connect(database=config.get('DATABASE', 'e2ec'), user=config.get('DATABASE_USER', 'e2ec'), password=config.get('DATABASE_PASSWORD', 'e2ec'), host=config.get('DATABASE_HOST', 'localhost'), port=config.get('DATABASE_PORT', '5432'))
_conn2.set_session(autocommit=True)


_file_storage =  minio.Minio(config.get('S3_HOST_PORT','localhost:9000'), access_key=config.get('S3_ACCESS_KEY','9JrrlWgZNPslN49P0ylR'), secret_key=config.get('S3_SECRET_KEY','KYXCbEmfZlxp9QJqkWWvxB0ZvwiAd7LoxCxo5w8n'), secure=False)

FILE_STORAGE_BUCKET  = config.get('S3_BUCKET',  'e2ec')

def connection():

    return _conn2

def file_storage():
    return _file_storage
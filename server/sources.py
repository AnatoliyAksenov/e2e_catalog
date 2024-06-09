import psycopg2

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
            q  = """sselect question
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
            return res




_conn2 = psycopg2.connect(database='e2ec', user='e2ec', password='e2ec', host='localhost', port='5432')
_conn2.set_session(autocommit=True)

def connection():

    return _conn2
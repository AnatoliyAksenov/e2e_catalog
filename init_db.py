import psycopg2

conn_params = {
    "user": 'e2ec',
    "password": 'e2ec',
    "host": 'localhost',
    "port": '5432',
    "database": 'e2ec',
}

_conn = psycopg2.connect(**conn_params)
_conn.set_session( autocommit=True )


with _conn.cursor() as curr:
    curr.execute("""CREATE TABLE public.queries (
                         id SERIAL PRIMARY KEY,
                         query TEXT,
                         theme TEXT,
                         questions TEXT,
                         ins_date TIMESTAMP NOT NULL DEFAULT now(),
                         ins_user TEXT,
                         status INT
                     );
    """)
    
    
    
    curr.execute("""CREATE TABLE public.query_logs (
                         id SERIAL PRIMARY KEY,
                         query_id INT,
                         step TEXT,
                         status INT,
                         log TEXT,
                         ins_date TIMESTAMP NOT NULL DEFAULT now(),
                         inst_user TEXT
                     )""")
    
    
    curr.execute("""create table public.urls(
                         id SERIAL PRIMARY KEY,
                         query_id INT,
                         url TEXT,
                         question TEXT,
                         content_type TEXT,
                         template_key TEXT,
                         summary TEXT,
                         summary_model TEXT,
                         execution_time numeric,
                         ins_date TIMESTAMP NOT NULL DEFAULT now(),
                         ins_user TEXT
                   )               
                   """)
    curr.execute("""create table public.files(key TEXT PRIMARY KEY, filename TEXT)""")
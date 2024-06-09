import duckdb

_conn = duckdb.connect('catalog.db') 

_conn.execute("""CREATE SEQUENCE IF NOT EXISTS seq_queries""")
_conn.execute("""CREATE SEQUENCE IF NOT EXISTS seq_query_logs""")
_conn.execute("""CREATE SEQUENCE IF NOT EXISTS seq_urls""")




_conn.execute("""CREATE TABLE IF NOT EXISTS queries (
                     id INT PRIMARY KEY not null default nextval('seq_queries'),
                     query TEXT,
                     theme TEXT,
                     questions TEXT,
                     ins_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                     ins_user TEXT,
                     status INT
                 );
""")



_conn.execute("""CREATE TABLE IF NOT EXISTS query_logs (
                     id INT PRIMARY KEY not null default nextval('seq_query_logs'),
                     query_id INT,
                     step TEXT,
                     status INT,
                     log TEXT,
                     ins_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                     inst_user TEXT
                 )""")


_conn.execute("""create table if not exists urls(
                     id INT PRIMARY KEY not null default nextval('seq_urls'),
                     query_id INT,
                     url TEXT,
                     question TEXT,
                     content_type TEXT,
                     template_key TEXT,
                     summary TEXT,
                     summary_model TEXT,
                     execution_time double,
                     ins_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                     ins_user TEXT
               )               
               """)

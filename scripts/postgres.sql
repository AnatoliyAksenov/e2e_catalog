CREATE TABLE public.queries (
                         id SERIAL PRIMARY KEY,
                         query TEXT,
                         theme TEXT,
                         questions TEXT,
                         params TEXT,
                         ins_date TIMESTAMP NOT NULL DEFAULT now(),
                         ins_user TEXT,
                         status INT
                     );

    
    
 CREATE TABLE public.query_logs (
                         id SERIAL PRIMARY KEY,
                         query_id INT,
                         step TEXT,
                         status INT,
                         log TEXT,
                         ins_date TIMESTAMP NOT NULL DEFAULT now(),
                         inst_user TEXT
                     );
    
    
create table public.urls(
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
                   );
           
create table public.files(key TEXT PRIMARY KEY, filename TEXT);


select * from public.urls;
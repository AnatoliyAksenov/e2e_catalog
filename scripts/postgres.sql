CREATE TABLE public.queries (
                         id SERIAL PRIMARY KEY,
                         query TEXT,
                         theme TEXT,
                         questions TEXT,
                         params TEXT,
                         ins_date TIMESTAMP NOT NULL DEFAULT now(),
                         ins_user TEXT,
                         status INT,
                         table_data json
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

create table public.questions_config(
    id serial PRIMARY key,
    question_key Text,
    label text,
    description text,
    question_template TEXT,
    question_values TEXT,
    ins_date TIMESTAMP NOT NULL DEFAULT now(),
    ins_user TEXT
);

create table public.url_blacklist(id SERIAL PRIMARY KEY, url TEXT);

create table public.closed_resources(id SERIAL PRIMARY KEY, url TEXT, headers TEXT, credentials TEXT, variable TEXT);

create table public.system_variables(id SERIAL PRIMARY KEY, variable_key TEXT, variable_text TEXT);

insert into public.questions_config (question_key, label, description) values('simple_question', 'Простые запросы', 'Выполняется подбор вопросов и поиск ответов в интернете');
insert into public.questions_config (question_key, label, description) values('additional_companies', 'Запрос по компании', 'Выполняется поиск ответов по компании в выбранных источниках');
insert into public.questions_config (question_key, label, description) values('additional_persons', 'Запрос по персонам', 'Выполняется ппоиск ответов по персоне в выбранных источниках');
insert into public.questions_config (question_key, label, description) values('aaditional_products', 'Запрос по продуктам', 'Выполняется поиск ответов по продукту в выбранных источниках');
insert into public.questions_config (question_key, label, description) values('files_companies', 'Запрос по компаннии 2', 'Выполняется поиск ответов по внутренней базе RAG');


insert into public.url_blacklist(url) values('google.com');
insert into public.url_blacklist(url) values('google.ru');
insert into public.url_blacklist(url) values('yandex.ru');
insert into public.url_blacklist(url) values('microsoft.com');
insert into public.url_blacklist(url) values('microsoft.ru');

insert into public.closed_resources(url, headers, credentials, variable) values('https://companies.rbc.ru/api/web/v1/financial-indicators/?inn=', '{"Authorization": "Bearer..."}', '{"username": "...", "password": "..."}', '{{inn}}');
insert into public.closed_resources(url, headers, credentials, variable) values('https://focus-api.kontur.ru/api3/buh?inn=', '{"Authorization": "Bearer..."}', '{"key": "3208d29d15c507395db770d0e65f3711e40374df"}', '{{inn}}');

insert into public.system_variables(variable_key, variable_text) values('inn', 'ИНН компании');
insert into public.system_variables(variable_key, variable_text) values('name', ' полное наименование компании');


select * from public.urls;
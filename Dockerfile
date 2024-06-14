FROM python:3.10-slim-buster AS base

RUN pip install poetry==1.8.3

COPY . /app

WORKDIR /app

RUN poetry config virtualenvs.create false ; poetry install

CMD ["python", "/app/app.py"]
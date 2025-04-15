FROM python:3.11

WORKDIR /app

COPY pyproject.toml .
COPY poetry.lock .
RUN pip install poetry && poetry config virtualenvs.create false && poetry install --no-root


COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

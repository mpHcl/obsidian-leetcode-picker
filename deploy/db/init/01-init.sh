#!/bin/sh
set -eu

psql -v ON_ERROR_STOP=1 \
  --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
  -v core_pw="$CORE_DB_PASSWORD" -v ml_pw="$ML_DB_PASSWORD" <<'SQL'

CREATE SCHEMA IF NOT EXISTS core;
CREATE SCHEMA IF NOT EXISTS ml;

CREATE ROLE core_app LOGIN PASSWORD :'core_pw';
CREATE ROLE ml_app   LOGIN PASSWORD :'ml_pw';

-- Każda rola widzi i zmienia tylko swój schemat.
GRANT USAGE, CREATE ON SCHEMA core TO core_app;
GRANT USAGE, CREATE ON SCHEMA ml   TO ml_app;
ALTER ROLE core_app SET search_path = core, public;
ALTER ROLE ml_app   SET search_path = ml, public;

REVOKE ALL ON SCHEMA core FROM ml_app;
REVOKE ALL ON SCHEMA ml   FROM core_app;

-- Rozszerzenie pgvector dojdzie razem z embeddingami (zmiana obrazu na pgvector/pgvector).

SQL
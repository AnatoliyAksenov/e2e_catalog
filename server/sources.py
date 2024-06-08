import duckdb

_conn = duckdb.connect('catalog.db', read_only=False)
_conn.install_extension("httpfs")
_conn.install_extension("excel")
_conn.install_extension("fts")
_conn.install_extension('vss')   



def connection():

    return _conn
import time

import mysql.connector
from mysql.connector import pooling

from src.database.config import (
    db_user,
    db_password,
    db_database,
    db_host,
    db_port,
    db_time_zone,
    db_pool_size,
)

_pool_options = {}
if db_time_zone:
    # Keep CURDATE()/NOW() aligned with the clinic's local day.
    _pool_options['init_command'] = f"SET time_zone = '{db_time_zone}'"

connection_pool = pooling.MySQLConnectionPool(
    pool_name="my_pool",
    pool_size=db_pool_size,
    user=db_user,
    password=db_password,
    host=db_host,
    port=int(db_port),
    database=db_database,

    autocommit=True,
    pool_reset_session=False,
    **_pool_options,
)


def get_connection():
    connection = None

    try:
        for attempt in range(10):
            try:
                connection = connection_pool.get_connection()
                break
            except mysql.connector.errors.PoolError:
                if attempt == 9:
                    raise
                time.sleep(0.15 * (attempt + 1))

        yield connection

    finally:
        if connection is not None:
            connection.close()


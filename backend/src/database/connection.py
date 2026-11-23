import mysql.connector
from mysql.connector import pooling

from config import (
    db_user,
    db_password,
    db_database,
    db_host,
    db_port
)

connection_pool = pooling.MySQLConnectionPool(
    pool_name="my_pool",
    pool_size=10,
    user=db_user,
    password=db_password,
    host=db_host,
    port = int(db_port),
    database=db_database,
)


def get_connection():
    connection = None

    try:
        connection = connection_pool.get_connection()
        yield connection

    finally:
        if connection is not None:
            connection.close()


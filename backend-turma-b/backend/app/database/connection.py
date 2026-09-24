import mysql.connector
from mysql.connector import Error

from app.config import settings


def get_connection():
    return mysql.connector.connect(
        host=settings.DB_HOST,
        port=settings.DB_PORT,
        user=settings.DB_USER,
        password=settings.DB_PASSWORD,
        database=settings.DB_NAME,
        autocommit=False,
        charset="utf8mb4",
        use_pure=True,
    )


def execute_query(query: str, params=None, fetch: str = "all"):
    connection = None
    cursor = None
    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)
        cursor.execute(query, params or ())

        if fetch == "one":
            result = cursor.fetchone()
        elif fetch == "all":
            result = cursor.fetchall()
        else:
            result = None

        return result
    except Error as exc:
        if connection is not None:
            connection.rollback()
        raise RuntimeError(f"Erro ao executar consulta no banco: {exc}") from exc
    finally:
        if cursor is not None:
            cursor.close()
        if connection is not None:
            connection.close()


def execute_write(query: str, params=None):
    connection = None
    cursor = None
    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)
        cursor.execute(query, params or ())
        connection.commit()
        return cursor.lastrowid
    except Error as exc:
        if connection is not None:
            connection.rollback()
        raise RuntimeError(f"Erro ao persistir no banco: {exc}") from exc
    finally:
        if cursor is not None:
            cursor.close()
        if connection is not None:
            connection.close()

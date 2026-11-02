import mysql.connector
from mysql.connector import Error

def get_db_connection():
    """ایجاد اتصال ایمن به دیتابیس MySQL در XAMPP"""
    try:
        connection = mysql.connector.connect(
            host="localhost",
            user="root",
            password="",
            database="mentora_db"
        )
        if connection.is_connected():
            return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None

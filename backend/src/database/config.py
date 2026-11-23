from dotenv import load_dotenv
import os

load_dotenv()  # this to load the variables from the .env file

db_host = os.getenv("db_host")
db_user = os.getenv("db_user")
db_password = os.getenv("db_password")
db_database = os.getenv("db_database")
db_port = os.getenv("db_port")

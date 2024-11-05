import pandas as pd
from datetime import datetime
import sqlite3


def export_to_excel():
    conn = sqlite3.connect('work_log.db')
    df = pd.read_sql_query("SELECT * FROM work_log", conn)
    today = datetime.today().strftime('%Y-%m-%d')
    df.to_excel(f'work_log_{today}.xlsx', index=False)
    conn.close()
    return f'work_log_{today}.xlsx'

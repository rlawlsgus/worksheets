import tkinter as tk
from tkinter import messagebox
import sqlite3
import pandas as pd
from datetime import datetime

# 데이터베이스 초기화
conn = sqlite3.connect('work_log.db')
c = conn.cursor()
c.execute('''CREATE TABLE IF NOT EXISTS work_log
             (name TEXT, date TEXT, start_time TEXT, end_time TEXT)''')
c.execute('''CREATE TABLE IF NOT EXISTS users
             (name TEXT)''')
conn.commit()

# 근무 일지 저장 함수


def save_log():
    name = name_var.get()
    start_time = start_time_var.get()
    end_time = end_time_var.get()
    date = date_var.get()

    if name and start_time and end_time and date:
        c.execute("INSERT INTO work_log (name, date, start_time, end_time) VALUES (?, ?, ?, ?)",
                  (name, date, start_time, end_time))
        conn.commit()
        messagebox.showinfo("성공", "근무 일지가 저장되었습니다.")
    else:
        messagebox.showwarning("경고", "모든 필드를 입력해주세요.")

# 사용자 추가 함수


def add_user():
    new_user = new_user_var.get()
    if new_user:
        c.execute("INSERT INTO users (name) VALUES (?)", (new_user,))
        conn.commit()
        user_listbox.insert(tk.END, new_user)
        new_user_var.set("")
    else:
        messagebox.showwarning("경고", "사용자 이름을 입력해주세요.")

# 엑셀로 내보내기 함수


def export_to_excel():
    df = pd.read_sql_query("SELECT * FROM work_log", conn)
    today = datetime.today().strftime('%Y-%m-%d')
    df.to_excel(f'work_log_{today}.xlsx', index=False)
    messagebox.showinfo("성공", "엑셀 파일로 저장되었습니다.")


# Tkinter 윈도우 설정
root = tk.Tk()
root.title("근무 일지 작성기")

# 이름 선택
tk.Label(root, text="이름:").grid(row=0, column=0)
name_var = tk.StringVar()
user_listbox = tk.Listbox(root, listvariable=name_var, height=5)
user_listbox.grid(row=0, column=1)

# 사용자 추가
tk.Label(root, text="새 사용자:").grid(row=1, column=0)
new_user_var = tk.StringVar()
tk.Entry(root, textvariable=new_user_var).grid(row=1, column=1)
tk.Button(root, text="추가", command=add_user).grid(row=1, column=2)

# 날짜 입력
tk.Label(root, text="날짜 (YYYY-MM-DD):").grid(row=2, column=0)
date_var = tk.StringVar()
tk.Entry(root, textvariable=date_var).grid(row=2, column=1)

# 시작 시간 입력
tk.Label(root, text="시작 시간 (HH:MM):").grid(row=3, column=0)
start_time_var = tk.StringVar()
tk.Entry(root, textvariable=start_time_var).grid(row=3, column=1)

# 종료 시간 입력
tk.Label(root, text="종료 시간 (HH:MM):").grid(row=4, column=0)
end_time_var = tk.StringVar()
tk.Entry(root, textvariable=end_time_var).grid(row=4, column=1)

# 저장 버튼
tk.Button(root, text="저장", command=save_log).grid(
    row=5, column=0, columnspan=2)

# 엑셀로 내보내기 버튼
tk.Button(root, text="엑셀로 내보내기", command=export_to_excel).grid(
    row=6, column=0, columnspan=2)

# 기존 사용자 로드
c.execute("SELECT name FROM users")
users = c.fetchall()
for user in users:
    user_listbox.insert(tk.END, user[0])

root.mainloop()

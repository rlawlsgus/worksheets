import tkinter as tk
from tkinter import messagebox, Toplevel
import sqlite3
from datetime import datetime, timedelta
import excel  # excel.py 파일을 import

# 데이터베이스 초기화
conn = sqlite3.connect('work_log.db')
c = conn.cursor()
c.execute('''CREATE TABLE IF NOT EXISTS work_log
             (name TEXT, date TEXT, start_time TEXT, end_time TEXT)''')
c.execute('''CREATE TABLE IF NOT EXISTS users
             (name TEXT)''')
conn.commit()

# 현재 날짜 설정 함수


def get_current_date():
    now = datetime.now()
    if now.hour < 4:
        return (now - timedelta(days=1)).strftime('%Y-%m-%d')
    else:
        return now.strftime('%Y-%m-%d')

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

# 사용자 추가 팝업 창 함수


def open_add_user_popup():
    popup = Toplevel(root)
    popup.title("사용자 추가")

    tk.Label(popup, text="새 사용자 이름:").grid(row=0, column=0)
    new_user_var = tk.StringVar()
    tk.Entry(popup, textvariable=new_user_var).grid(row=0, column=1)

    def add_user():
        new_user = new_user_var.get()
        if new_user:
            c.execute("INSERT INTO users (name) VALUES (?)", (new_user,))
            conn.commit()
            user_listbox.insert(tk.END, new_user)
            popup.destroy()
        else:
            messagebox.showwarning("경고", "사용자 이름을 입력해주세요.")

    tk.Button(popup, text="추가", command=add_user).grid(
        row=1, column=0, columnspan=2)

# 엑셀로 내보내기 함수


def export_to_excel():
    file_path = excel.export_to_excel()
    messagebox.showinfo("성공", f"엑셀 파일로 저장되었습니다: {file_path}")


# Tkinter 윈도우 설정
root = tk.Tk()
root.title("근무 일지 작성기")

# 이름 선택
tk.Label(root, text="이름:").grid(row=0, column=0)
name_var = tk.StringVar()
user_listbox = tk.Listbox(root, listvariable=name_var, height=5)
user_listbox.grid(row=0, column=1)

# 사용자 추가 버튼
tk.Button(root, text="사용자 추가", command=open_add_user_popup).grid(
    row=0, column=2)

# 날짜 자동 설정
date_var = tk.StringVar(value=get_current_date())

# 시간 선택 (30분 단위)


def generate_time_options():
    times = []
    for hour in range(24):
        for minute in (0, 30):
            times.append(f"{hour:02d}:{minute:02d}")
    return times


time_options = generate_time_options()

tk.Label(root, text="시작 시간:").grid(row=1, column=0)
start_time_var = tk.StringVar()
start_time_menu = tk.OptionMenu(root, start_time_var, *time_options)
start_time_menu.grid(row=1, column=1)

tk.Label(root, text="종료 시간:").grid(row=2, column=0)
end_time_var = tk.StringVar()
end_time_menu = tk.OptionMenu(root, end_time_var, *time_options)
end_time_menu.grid(row=2, column=1)

# 저장 버튼
tk.Button(root, text="저장", command=save_log).grid(
    row=3, column=0, columnspan=2)

# 엑셀로 내보내기 버튼
tk.Button(root, text="엑셀로 내보내기", command=export_to_excel).grid(
    row=4, column=0, columnspan=2)

# 기존 사용자 로드
c.execute("SELECT name FROM users")
users = c.fetchall()
for user in users:
    user_listbox.insert(tk.END, user[0])

root.mainloop()

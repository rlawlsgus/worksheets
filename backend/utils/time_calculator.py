# backend/utils/time_calculator.py
from datetime import datetime


def calculate_work_hours(start_time_str, end_time_str):
    start_time = datetime.strptime(start_time_str, '%Y-%m-%d %H:%M')
    end_time = datetime.strptime(end_time_str, '%Y-%m-%d %H:%M')
    return (end_time - start_time).total_seconds() / 3600

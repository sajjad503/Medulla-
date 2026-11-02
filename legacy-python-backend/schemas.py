from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import date, time

class UserCreate(BaseModel):
    workspace_id: int = 1
    role: str           
    full_name: str
    phone_number: str
    password: str
    custom_group: Optional[str] = "عادی"
    grade: Optional[str] = "دوازدهم"
    invite_code: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str

class StudyPlanCreate(BaseModel):
    student_id: int
    start_date: date
    end_date: date
    plan_data: Dict[str, Any]

class DailyReportCreate(BaseModel):
    report_date: date
    total_study_time: float
    total_test_count: int
    report_items: Dict[str, Any]
    student_note: Optional[str] = None

class AdvisorEventCreate(BaseModel):
    student_id: Optional[int] = None
    event_date: date
    event_time: time
    title: str
    event_type: str = "task"

class ReportCardCreate(BaseModel):
    student_id: int
    exam_type: str 
    title: str
    exam_date: date
    total_score: Optional[float] = None
    taraz: Optional[int] = None
    subjects_data: Dict[str, Any]
    file_url: Optional[str] = None

from fastapi import APIRouter, HTTPException, Depends
from database import get_db_connection
from schemas import StudyPlanCreate, AdvisorEventCreate, ReportCardCreate, DailyReportCreate
from security import get_current_user
import json

router = APIRouter(prefix="/records", tags=["Academic & Dashboard"])

@router.get("/my-students")
def get_advisor_students(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "advisor":
        raise HTTPException(status_code=403, detail="فقط مشاوران دسترسی دارند")

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        query = """
            SELECT u.id, u.full_name as name, u.custom_group as customGroup, u.grade, u.taraz,
                   (SELECT COUNT(*) FROM work_reports w WHERE w.student_id = u.id AND w.is_read_by_advisor = FALSE) as unread_count,
                   (SELECT DATEDIFF(CURDATE(), MAX(report_date)) FROM work_reports w WHERE w.student_id = u.id) as lastReportDays
            FROM users u
            WHERE u.role = 'student' AND u.advisor_id = %s
        """
        cursor.execute(query, (current_user["id"],))
        students = cursor.fetchall()
        
        for student in students:
            student['unreadReport'] = student['unread_count'] > 0
            if student['lastReportDays'] is None:
                student['lastReportDays'] = 3 
                
        return students
    finally:
        cursor.close()
        conn.close()

@router.post("/events")
def create_advisor_event(event: AdvisorEventCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "advisor":
        raise HTTPException(status_code=403, detail="عدم دسترسی")

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO advisor_events (advisor_id, student_id, event_date, event_time, title, event_type) VALUES (%s, %s, %s, %s, %s, %s)",
            (current_user["id"], event.student_id, event.event_date, event.event_time, event.title, event.event_type)
        )
        conn.commit()
        return {"message": "رویداد در تقویم ذخیره شد ✅"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@router.post("/save-plan")
def save_study_plan(plan: StudyPlanCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["manager", "advisor"]:
        raise HTTPException(status_code=403, detail="عدم دسترسی")

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        plan_json_str = json.dumps(plan.plan_data, ensure_ascii=False)
        cursor.execute(
            "INSERT INTO study_plans (student_id, advisor_id, start_date, end_date, plan_data) VALUES (%s, %s, %s, %s, %s)",
            (plan.student_id, current_user["id"], plan.start_date, plan.end_date, plan_json_str)
        )
        conn.commit()
        return {"message": "برنامه ذخیره شد ✅"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()
        
@router.post("/save-report-card")
def save_report_card(card: ReportCardCreate, current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        subjects_json = json.dumps(card.subjects_data, ensure_ascii=False)
        cursor.execute(
            "INSERT INTO report_cards (student_id, advisor_id, exam_type, title, exam_date, total_score, taraz, subjects_data, file_url) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)",
            (card.student_id, current_user["id"], card.exam_type, card.title, card.exam_date, card.total_score, card.taraz, subjects_json, card.file_url)
        )
        conn.commit()
        return {"message": "کارنامه با موفقیت ثبت شد ✅"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@router.post("/daily-report")
def submit_daily_report(report: DailyReportCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student":
        raise HTTPException(status_code=403, detail="فقط دانش‌آموزان دسترسی دارند.")

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        report_items_json = json.dumps(report.report_items, ensure_ascii=False)
        cursor.execute(
            """INSERT INTO work_reports 
               (student_id, report_date, total_study_time, total_test_count, report_items, student_note, is_read_by_advisor) 
               VALUES (%s, %s, %s, %s, %s, %s, FALSE)""",
            (current_user["id"], report.report_date, report.total_study_time, 
             report.total_test_count, report_items_json, report.student_note)
        )
        conn.commit()
        return {"message": "گزارش کار شما با موفقیت ثبت شد و برای مشاورتان ارسال گردید ✅"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@router.get("/my-plan")
def get_my_study_plan(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student":
        raise HTTPException(status_code=403, detail="فقط دانش‌آموزان دسترسی دارند.")
        
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT * FROM study_plans WHERE student_id = %s ORDER BY id DESC LIMIT 1",
            (current_user["id"],)
        )
        plan = cursor.fetchone()
        
        if plan and plan.get('plan_data'):
            if isinstance(plan['plan_data'], str):
                plan['plan_data'] = json.loads(plan['plan_data'])
            return plan
        else:
            return {"message": "هنوز برنامه‌ای برای شما ثبت نشده است.", "plan_data": None}
    finally:
        cursor.close()
        conn.close()

@router.get("/my-profile")
def get_student_profile(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student":
        raise HTTPException(status_code=403, detail="فقط دانش‌آموزان دسترسی دارند.")

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT s.full_name as name, s.grade, s.phone_number,
                   a.full_name as advisor_name
            FROM users s
            LEFT JOIN users a ON s.advisor_id = a.id
            WHERE s.id = %s
        """, (current_user["id"],))
        profile = cursor.fetchone()

        cursor.execute("""
            SELECT SUM(total_study_time) as total_time, SUM(total_test_count) as total_tests
            FROM work_reports
            WHERE student_id = %s
        """, (current_user["id"],))
        stats = cursor.fetchone()

        return {
            "profile": profile,
            "stats": {
                "total_time": round(stats["total_time"] or 0, 1),
                "total_tests": int(stats["total_tests"] or 0)
            }
        }
    finally:
        cursor.close()
        conn.close()

@router.get("/student-reports/{student_id}")
def get_single_student_reports(student_id: int, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "advisor":
        raise HTTPException(status_code=403, detail="عدم دسترسی")
        
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("UPDATE work_reports SET is_read_by_advisor = TRUE WHERE student_id = %s", (student_id,))
        conn.commit()
        
        cursor.execute("SELECT * FROM work_reports WHERE student_id = %s ORDER BY report_date DESC LIMIT 10", (student_id,))
        reports = cursor.fetchall()
        
        for r in reports:
            if r['report_date']: r['report_date'] = str(r['report_date'])
            if r['created_at']: r['created_at'] = str(r['created_at'])
            if isinstance(r['report_items'], str):
                r['report_items'] = json.loads(r['report_items'])
                
        return reports
    finally:
        cursor.close()
        conn.close()

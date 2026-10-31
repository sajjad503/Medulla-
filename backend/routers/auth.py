from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm
from database import get_db_connection
from security import hash_password, verify_password, create_access_token, get_current_user
from schemas import UserCreate, Token

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register")
def register_user(user: UserCreate):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id FROM users WHERE phone_number = %s", (user.phone_number,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="این شماره موبایل قبلاً ثبت شده است.")
        
        hashed_pwd = hash_password(user.password)
        advisor_id = None
        custom_group = "ثبت‌نام جدید (در انتظار تایید)" 
        
        if user.invite_code:
            cursor.execute("SELECT id FROM users WHERE invite_code = %s", (user.invite_code,))
            adv = cursor.fetchone()
            if adv:
                advisor_id = adv['id']
                custom_group = "عادی" 

        query = """
            INSERT INTO users (workspace_id, role, full_name, phone_number, password_hash, custom_group, grade, advisor_id)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(query, (user.workspace_id, user.role, user.full_name, user.phone_number, hashed_pwd, custom_group, user.grade, advisor_id))
        conn.commit()
        return {"message": "کاربر با موفقیت ثبت شد!", "user_id": cursor.lastrowid}
    finally:
        cursor.close()
        conn.close()

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM users WHERE phone_number = %s", (form_data.username,))
        user = cursor.fetchone()
        
        if not user or not verify_password(form_data.password, user['password_hash']):
            raise HTTPException(status_code=401, detail="شماره موبایل یا رمز عبور اشتباه است.")
        
        if user['status'] == 'suspended':
            raise HTTPException(status_code=403, detail="اکانت شما تعلیق شده است.")

        if user['role'] == 'student' and user['advisor_id'] is None:
            raise HTTPException(status_code=403, detail="ثبت‌نام شما انجام شده است. لطفاً تا تایید حساب و تخصیص مشاور توسط مدیریت منتظر بمانید.")

        access_token = create_access_token(
            data={"sub": user['phone_number'], "role": user['role'], "id": user['id']}
        )
        return {"access_token": access_token, "token_type": "bearer"}
    finally:
        cursor.close()
        conn.close()

@router.get("/pending-students")
def get_pending_students(current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["founder", "manager"]:
        raise HTTPException(status_code=403, detail="عدم دسترسی")

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        query = """
            SELECT id, full_name as name, phone_number as phone, created_at as date 
            FROM users 
            WHERE role = 'student' AND custom_group = 'ثبت‌نام جدید (در انتظار تایید)'
        """
        cursor.execute(query)
        pending_students = cursor.fetchall()
        for student in pending_students:
            if student['date']:
                student['date'] = student['date'].strftime("%Y-%m-%d %H:%M")
        return pending_students
    finally:
        cursor.close()
        conn.close()

@router.get("/advisors-list")
def get_advisors_list(current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["founder", "manager"]:
        raise HTTPException(status_code=403, detail="عدم دسترسی")

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        query = """
            SELECT id, full_name as name, 
                   (SELECT COUNT(*) FROM users u2 WHERE u2.role = 'student' AND u2.custom_group != 'ثبت‌نام جدید (در انتظار تایید)') as studentCount
            FROM users 
            WHERE role = 'advisor'
        """
        cursor.execute(query)
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

@router.post("/assign-advisor/{student_id}")
def assign_advisor(student_id: int, advisor_id: int, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["founder", "manager"]:
        raise HTTPException(status_code=403, detail="فقط مدیریت دسترسی دارد.")
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            UPDATE users 
            SET custom_group = 'عادی', advisor_id = %s 
            WHERE id = %s AND role = 'student'
        """, (advisor_id, student_id))
        conn.commit()
        return {"message": "دانش‌آموز با موفقیت تایید و به مشاور متصل شد ✅"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@router.delete("/reject-student/{student_id}")
def reject_student(student_id: int, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["founder", "manager"]:
        raise HTTPException(status_code=403, detail="عدم دسترسی")

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM users WHERE id = %s AND role = 'student'", (student_id,))
        conn.commit()
        return {"message": "ثبت‌نام دانش‌آموز رد و اطلاعات حذف شد."}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@router.get("/founder/data")
def get_founder_data(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "founder":
        raise HTTPException(status_code=403, detail="فقط مالک پلتفرم دسترسی دارد.")
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT id, full_name as manager, CONCAT('آکادمی ', full_name) as name, 
                   phone_number as phone, status, 0 as debt,
                   (SELECT COUNT(*) FROM users u2 WHERE u2.role = 'advisor' AND u2.workspace_id = u.workspace_id) as advisorCount,
                   (SELECT COUNT(*) FROM users u3 WHERE u3.role = 'student' AND u3.workspace_id = u.workspace_id) as studentCount
            FROM users u WHERE role = 'manager'
        """)
        institutes = cursor.fetchall()
        
        cursor.execute("""
            SELECT id, full_name as name, phone_number as phone, status, 
                   'پلتفرم منتورا' as institute,
                   (SELECT COUNT(*) FROM users u2 WHERE u2.role = 'student' AND u2.custom_group != 'ثبت‌نام جدید (در انتظار تایید)') as studentCount
            FROM users WHERE role = 'advisor'
        """)
        advisors = cursor.fetchall()
        
        cursor.execute("""
            SELECT id, full_name as name, phone_number as phone, 
                   custom_group as plan, created_at as date 
            FROM users 
            WHERE role = 'student' AND custom_group LIKE '%انتظار%'
        """)
        pending = cursor.fetchall()
        for s in pending:
            if s['date']:
                s['date'] = s['date'].strftime("%Y-%m-%d %H:%M")
                
        return {
            "institutes": institutes,
            "advisors": advisors,
            "pendingStudents": pending
        }
    finally:
        cursor.close()
        conn.close()

@router.post("/founder/toggle-status/{user_id}")
def toggle_user_status(user_id: int, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "founder":
        raise HTTPException(status_code=403, detail="فقط مالک پلتفرم دسترسی دارد.")
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE users SET status = IF(status='active', 'suspended', 'active') WHERE id = %s", (user_id,))
        conn.commit()
        return {"message": "وضعیت اکانت با موفقیت تغییر کرد ✅"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

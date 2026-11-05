import React, { useState, useEffect } from 'react';
import { 
  Building, Users, UserCheck, UserPlus, Search, 
  ArrowRight, CheckCircle, XCircle, Loader2, Wallet, 
  Bell, Download, Link as LinkIcon, Phone, Calendar, 
  FileText, CheckSquare, Clock, DollarSign, Percent, 
  Database, RefreshCw, Copy, Check, ExternalLink, 
  Eye, Edit3, Plus, MessageSquare, AlertCircle, ChevronLeft,
  Briefcase, Send, ShieldCheck, CreditCard, Lock
} from 'lucide-react';
import { AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from './api';
import PWAInstallButton from './PWAInstallButton';
import WeeklyPlanTableView from './WeeklyPlanTableView';
import OnlineGatewayModal from './OnlineGatewayModal';

interface ManagerDashboardProps {
  onLogout: () => void;
}

export default function ManagerDashboard({ onLogout }: ManagerDashboardProps) {
  const [activeTab, setActiveTab] = useState<'students' | 'homeworks' | 'advisors' | 'pending' | 'finance' | 'integrations'>('students');
  
  // Data states
  const [students, setStudents] = useState<any[]>([]);
  const [advisors, setAdvisors] = useState<any[]>([]);
  const [pendingStudents, setPendingStudents] = useState<any[]>([]);
  const [homeworksList, setHomeworksList] = useState<any[]>([]);
  const [academyInfo, setAcademyInfo] = useState<any>({ name: 'آکادمی کنکور مدولا (شعبه هدف)' });
  const [stats, setStats] = useState<any>({ totalStudents: 0, paidCount: 0, pendingCount: 0, totalTuition: 0, totalAdvisorPayout: 0, netInstituteRevenue: 0, activeHomeworks: 0, homeworkCompletionRate: 100 });
  const [integrations, setIntegrations] = useState<any>({});

  // Online Payment Gateway State
  const [gatewayConfig, setGatewayConfig] = useState({
    provider: 'زرین‌پال (ZarinPal)',
    merchant_id: 'zrn-4491-0023-9912',
    terminal_id: '8841029',
    api_key: 'API-SEC-9941829410',
    is_sandbox: false,
    active: true,
    callback_url: 'https://mentora.ir/pay/callback',
    commission_auto_split: true
  });
  const [gatewayModal, setGatewayModal] = useState<{ show: boolean; student: any; amount: number }>({ show: false, student: null, amount: 3500000 });
  const [gatewaySaving, setGatewaySaving] = useState(false);
  const [gatewayTestMsg, setGatewayTestMsg] = useState('');
  
  // UI states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'paid' | 'pending' | 'vip'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Modals for Academy Management
  const [addAdvisorModal, setAddAdvisorModal] = useState<{ show: boolean; fullName: string; phone: string; password: string; grade: string; saving: boolean }>({
    show: false,
    fullName: '',
    phone: '',
    password: '',
    grade: 'مشاور تخصصی کنکور',
    saving: false
  });

  const [addStudentModal, setAddStudentModal] = useState<{ show: boolean; fullName: string; phone: string; grade: string; advisorId: string; saving: boolean }>({
    show: false,
    fullName: '',
    phone: '',
    grade: 'دوازدهم تجربی',
    advisorId: '',
    saving: false
  });

  const [reassignModal, setReassignModal] = useState<{ show: boolean; student: any; advisorId: string; saving: boolean }>({
    show: false,
    student: null,
    advisorId: '',
    saving: false
  });

  // Student Dossier Modal
  const [dossierModal, setDossierModal] = useState<{ show: boolean; studentId: number | null; data: any; loading: boolean; activeSubTab: 'plans' | 'reports' | 'events' | 'financials' }>({
    show: false,
    studentId: null,
    data: null,
    loading: false,
    activeSubTab: 'plans'
  });

  // Tuition Setting Modal
  const [tuitionModal, setTuitionModal] = useState<{ show: boolean; student: any; feeInput: string; statusInput: string; saving: boolean; copied: boolean }>({
    show: false,
    student: null,
    feeInput: '',
    statusInput: 'paid',
    saving: false,
    copied: false
  });

  // Advisor Commission Modal
  const [commissionModal, setCommissionModal] = useState<{ show: boolean; advisor: any; percentInput: string; saving: boolean }>({
    show: false,
    advisor: null,
    percentInput: '60',
    saving: false
  });

  // Add Meeting/Call Event Modal
  const [newEventModal, setNewEventModal] = useState<{ show: boolean; studentId: number | null; title: string; eventType: 'call' | 'meeting'; date: string; time: string; notes: string; saving: boolean }>({
    show: false,
    studentId: null,
    title: '',
    eventType: 'call',
    date: new Date().toLocaleDateString('fa-IR'),
    time: '۱۸:۰۰',
    notes: '',
    saving: false
  });

  // Assign Advisor Modal for Pending
  const [assignModal, setAssignModal] = useState<{ show: boolean; student: any }>({ show: false, student: null });
  const [selectedAdvisorId, setSelectedAdvisorId] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Accounting Integrations Form State
  const [holoConfig, setHoloConfig] = useState({ enabled: true, server_url: 'https://api.holo-erp.ir/v2', api_key: 'HOLO-ACAD-8849-MEDULLA', database_name: 'HOLO_HADAF_1405' });
  const [sepidarConfig, setSepidarConfig] = useState({ enabled: true, api_token: 'SEP-7731-0982-XYZ', branch_code: '104', customer_ledger_code: '401020' });
  const [webhookConfig, setWebhookConfig] = useState({ enabled: true, url: 'https://my-academy.ir/api/accounting/webhook', secret: 'whsec_99418240182490182' });
  const [syncStatusMsg, setSyncStatusMsg] = useState('');
  const [isSyncing, setIsSyncing] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setErrorMsg('');

      // Fetch primary unified endpoint from PHP backend
      let mainData: any = null;
      try {
        const res = await api.get('/auth/manager/data');
        if (res.data && res.data.students) {
          mainData = res.data;
        }
      } catch (_) {}

      if (mainData) {
        setStudents(mainData.students || []);
        setAdvisors(mainData.advisors || []);
        setPendingStudents(mainData.pending_students || []);
        setHomeworksList(mainData.homeworks || []);
        setAcademyInfo(mainData.academy || { name: 'آکادمی کنکور مدولا' });
        setStats({
          totalStudents: mainData.stats?.total_students || mainData.students?.length || 0,
          totalTuition: mainData.stats?.monthly_revenue || 14500000,
          totalAdvisorPayout: Math.round((mainData.stats?.monthly_revenue || 14500000) * 0.6),
          netInstituteRevenue: Math.round((mainData.stats?.monthly_revenue || 14500000) * 0.4),
          activeHomeworks: mainData.stats?.active_homeworks || mainData.homeworks?.length || 0,
          homeworkCompletionRate: mainData.stats?.homework_completion_rate ?? 100
        });
      } else {
        const [studentsRes, pendingRes, advisorsRes, integrationsRes] = await Promise.all([
          api.get('/auth/manager/students').catch(() => ({ data: [] })),
          api.get('/auth/pending-students').catch(() => ({ data: [] })),
          api.get('/auth/advisors-list').catch(() => ({ data: [] })),
          api.get('/auth/manager/accounting-integrations').catch(() => ({ data: {} }))
        ]);

        const stList = Array.isArray(studentsRes.data) ? studentsRes.data : (studentsRes.data?.students || []);
        setStudents(stList);
        setPendingStudents(Array.isArray(pendingRes.data) ? pendingRes.data : []);
        setAdvisors(Array.isArray(advisorsRes.data) ? advisorsRes.data : []);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('خطا در دریافت اطلاعات جامع موسسه. لطفاً مجدداً تلاش فرمایید.');
    } finally {
      setIsLoading(false);
    }
  };

  // Open Full Student Dossier Modal
  const openStudentDossier = async (studentId: number) => {
    setDossierModal({
      show: true,
      studentId,
      data: null,
      loading: true,
      activeSubTab: 'plans'
    });

    try {
      const res = await api.get(`/auth/manager/student-dossier/${studentId}`);
      setDossierModal(prev => ({
        ...prev,
        data: res.data,
        loading: false
      }));
    } catch (err) {
      alert('خطا در دریافت پرونده تحصیلی دانش‌آموز.');
      setDossierModal(prev => ({ ...prev, show: false, loading: false }));
    }
  };

  // Open Tuition Configuration
  const openTuitionModal = (student: any) => {
    setTuitionModal({
      show: true,
      student,
      feeInput: String(student.tuitionFee || 3500000),
      statusInput: student.paymentStatus || 'paid',
      saving: false,
      copied: false
    });
  };

  const handleSaveTuition = async () => {
    if (!tuitionModal.student) return;
    setTuitionModal(prev => ({ ...prev, saving: true }));
    try {
      const res = await api.post(`/auth/manager/set-tuition/${tuitionModal.student.id}`, {
        tuition_fee: Number(tuitionModal.feeInput),
        payment_status: tuitionModal.statusInput
      });

      alert(res.data.message);
      setTuitionModal(prev => ({ ...prev, show: false, saving: false }));
      fetchDashboardData();

      // Refresh dossier if currently open
      if (dossierModal.show && dossierModal.studentId === tuitionModal.student.id) {
        openStudentDossier(tuitionModal.student.id);
      }
    } catch (err) {
      alert('خطا در ذخیره شهریه.');
      setTuitionModal(prev => ({ ...prev, saving: false }));
    }
  };

  // Save Advisor Commission
  const handleSaveCommission = async () => {
    if (!commissionModal.advisor) return;
    setCommissionModal(prev => ({ ...prev, saving: true }));
    try {
      const res = await api.post('/auth/manager/advisor-commission', {
        advisor_id: commissionModal.advisor.id,
        commission_percent: Number(commissionModal.percentInput)
      });
      alert(res.data.message);
      setCommissionModal(prev => ({ ...prev, show: false, saving: false }));
      fetchDashboardData();
    } catch (err) {
      alert('خطا در ذخیره درصد پورسانت.');
      setCommissionModal(prev => ({ ...prev, saving: false }));
    }
  };

  // Add Logged Call or Meeting
  const handleAddEvent = async () => {
    if (!newEventModal.title.trim()) return alert('لطفاً عنوان جلسه یا تماس را وارد کنید.');
    setNewEventModal(prev => ({ ...prev, saving: true }));
    try {
      const res = await api.post('/auth/manager/add-event', {
        student_id: newEventModal.studentId,
        title: newEventModal.title,
        event_type: newEventModal.eventType,
        event_date: newEventModal.date,
        event_time: newEventModal.time,
        notes: newEventModal.notes
      });
      alert(res.data.message);
      setNewEventModal(prev => ({ ...prev, show: false, saving: false, title: '', notes: '' }));
      if (dossierModal.show && dossierModal.studentId) {
        openStudentDossier(dossierModal.studentId);
      }
      fetchDashboardData();
    } catch (err) {
      alert('خطا در ثبت رویداد.');
      setNewEventModal(prev => ({ ...prev, saving: false }));
    }
  };

  // Test Sync with Holo / Sepidar
  const handleTestSync = async (service: 'holo' | 'sepidar' | 'webhook') => {
    setIsSyncing(service);
    setSyncStatusMsg('');
    try {
      const res = await api.post('/auth/manager/test-sync', { service });
      setSyncStatusMsg(res.data.message);
      setTimeout(() => setSyncStatusMsg(''), 4500);
    } catch (err) {
      alert('خطا در ارتباط با سرویس حسابداری.');
    } finally {
      setIsSyncing(null);
    }
  };

  // Save Integrations
  const handleSaveIntegrations = async () => {
    try {
      await api.post('/auth/manager/accounting-integrations', {
        holo: holoConfig,
        sepidar: sepidarConfig,
        webhook: webhookConfig,
        gateway: gatewayConfig
      });
      alert('تنظیمات سامانه‌های مالی و وب‌هوک با موفقیت ذخیره شد ✅');
    } catch (err) {
      alert('خطا در ذخیره تنظیمات.');
    }
  };

  // Save Online Payment Gateway
  const handleSaveGateway = async () => {
    setGatewaySaving(true);
    try {
      const res = await api.post('/auth/manager/gateway-config', gatewayConfig);
      alert(res.data.message || 'تنظیمات درگاه پرداخت اینترنتی با موفقیت ذخیره شد ✅');
      fetchDashboardData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'خطا در ذخیره تنظیمات درگاه پرداخت.');
    } finally {
      setGatewaySaving(false);
    }
  };

  // Test Online Payment Gateway
  const handleTestGateway = async () => {
    setGatewayTestMsg('در حال اتصال به سوئیچ شاپرک...');
    try {
      const res = await api.post('/auth/manager/test-gateway');
      setGatewayTestMsg(res.data.message);
      setTimeout(() => setGatewayTestMsg(''), 5000);
    } catch (err: any) {
      alert('خطا در تست اتصال درگاه.');
      setGatewayTestMsg('');
    }
  };

  // Export Financial CSV
  const handleExportCSV = async () => {
    try {
      const res = await api.get('/auth/manager/export-accounting-csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'text/csv;charset=utf-8;' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'mentora_accounting_ledger.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('خطا در دانلود خروجی حسابداری.');
    }
  };

  // Export All Study Plans CSV
  const handleExportPlansCSV = async () => {
    try {
      const res = await api.get('/auth/manager/export-plans-csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'text/csv;charset=utf-8;' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'mentora_all_study_plans.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('خطا در دانلود خروجی برنامه‌های مطالعاتی.');
    }
  };

  // Export All Work Reports CSV
  const handleExportReportsCSV = async () => {
    try {
      const res = await api.get('/auth/manager/export-reports-csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'text/csv;charset=utf-8;' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'mentora_all_work_reports.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('خطا در دانلود خروجی گزارش‌کارها.');
    }
  };

  // Pending assignment
  const handleApproveAndAssign = async () => {
    if (!selectedAdvisorId) return alert('لطفاً مشاور را انتخاب کنید.');
    setActionLoading(true);
    try {
      await api.post(`/auth/assign-advisor/${assignModal.student.id}?advisor_id=${selectedAdvisorId}`);
      alert(`دانش‌آموز با موفقیت تایید و به مشاور متصل شد.`);
      setPendingStudents(prev => prev.filter(s => s.id !== assignModal.student.id));
      setAssignModal({ show: false, student: null });
      setSelectedAdvisorId('');
      fetchDashboardData();
    } catch (err) {
      alert('خطا در اتصال به مشاور.');
    } finally {
      setActionLoading(false);
    }
  };

  // Add Advisor to Academy
  const handleAddAdvisor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addAdvisorModal.fullName.trim() || !addAdvisorModal.phone.trim()) {
      return alert('نام و شماره موبایل مشاور الزامی است.');
    }
    setAddAdvisorModal(prev => ({ ...prev, saving: true }));
    try {
      const res = await api.post('/auth/manager/add-advisor', {
        full_name: addAdvisorModal.fullName.trim(),
        phone_number: addAdvisorModal.phone.trim(),
        password: addAdvisorModal.password || '123456',
        grade: addAdvisorModal.grade || 'مشاور ارشد کنکور'
      });
      alert(res.data.message || 'مشاور جدید با موفقیت به موسسه اضافه شد.');
      setAddAdvisorModal({ show: false, fullName: '', phone: '', password: '', grade: 'مشاور تخصصی کنکور', saving: false });
      fetchDashboardData();
    } catch (err: any) {
      alert(err.response?.data?.detail || err.response?.data?.message || 'خطا در ثبت مشاور جدید.');
      setAddAdvisorModal(prev => ({ ...prev, saving: false }));
    }
  };

  // Remove / Deactivate Advisor
  const handleRemoveAdvisor = async (advisor: any) => {
    const advName = advisor.full_name || advisor.name;
    if (!window.confirm(`آیا از حذف یا تعلیق مشاور «${advName}» از موسسه اطمینان دارید؟ تمام دانش‌آموزان ایشان به وضعیت بدون مشاور منتقل می‌شوند.`)) {
      return;
    }
    try {
      const res = await api.post('/auth/manager/remove-advisor', { advisor_id: advisor.id });
      alert(res.data.message || 'مشاور از موسسه حذف گردید.');
      fetchDashboardData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'خطا در حذف مشاور.');
    }
  };

  // Reassign student to another advisor
  const handleReassignStudent = async () => {
    if (!reassignModal.student || !reassignModal.advisorId) {
      return alert('لطفاً مشاور جدید را انتخاب فرمایید.');
    }
    setReassignModal(prev => ({ ...prev, saving: true }));
    try {
      const res = await api.post('/auth/manager/assign-student', {
        student_id: reassignModal.student.id,
        advisor_id: Number(reassignModal.advisorId)
      });
      alert(res.data.message || 'دانش‌آموز با موفقیت به مشاور جدید تخصیص یافت.');
      setReassignModal({ show: false, student: null, advisorId: '', saving: false });
      fetchDashboardData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'خطا در تخصیص دانش‌آموز.');
      setReassignModal(prev => ({ ...prev, saving: false }));
    }
  };

  // Add new student to academy
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addStudentModal.fullName.trim() || !addStudentModal.phone.trim()) {
      return alert('نام و شماره موبایل دانش‌آموز الزامی است.');
    }
    setAddStudentModal(prev => ({ ...prev, saving: true }));
    try {
      const res = await api.post('/auth/manager/add-student', {
        full_name: addStudentModal.fullName.trim(),
        phone_number: addStudentModal.phone.trim(),
        grade: addStudentModal.grade || 'دوازدهم تجربی',
        advisor_id: addStudentModal.advisorId ? Number(addStudentModal.advisorId) : null
      });
      alert(res.data.message || 'دانش‌آموز جدید با موفقیت ثبت شد.');
      setAddStudentModal({ show: false, fullName: '', phone: '', grade: 'دوازدهم تجربی', advisorId: '', saving: false });
      fetchDashboardData();
    } catch (err: any) {
      alert(err.response?.data?.detail || err.response?.data?.message || 'خطا در ثبت دانش‌آموز.');
      setAddStudentModal(prev => ({ ...prev, saving: false }));
    }
  };

  // Filter students
  const filteredStudents = students.filter(s => {
    const matchesSearch = 
      s.name.includes(searchQuery) || 
      s.phone.includes(searchQuery) || 
      (s.advisorName && s.advisorName.includes(searchQuery)) ||
      (s.schoolName && s.schoolName.includes(searchQuery)) ||
      (s.grade && s.grade.includes(searchQuery));

    if (!matchesSearch) return false;
    if (selectedFilter === 'paid') return s.paymentStatus === 'paid';
    if (selectedFilter === 'pending') return s.paymentStatus !== 'paid';
    if (selectedFilter === 'vip') return s.group === 'VIP';
    return true;
  });

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '70vh', color: '#C5A880' }}>
        <Loader2 size={40} className="spin-animation" style={{ animation: 'spin 1s linear infinite' }} />
        <h3 style={{ marginTop: '15px', color: 'var(--primary, #0C1D3F)' }}>در حال بارگذاری پنل مدیریت جامع موسسه...</h3>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.35s ease-out', paddingBottom: '40px', direction: 'rtl' }} className="custom-scrollbar">
      
      {/* هدر پنل مدیریت آکادمی */}
      <div className="bento-card" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', borderBottom: '3px solid #C5A880' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ background: '#0C1D3F', padding: '12px', borderRadius: '12px', color: '#E6C287', boxShadow: '0 4px 15px rgba(12,29,63,0.2)' }}>
            <Building size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ margin: 0, color: 'var(--text-main, #0C1D3F)', fontSize: '20px', fontWeight: '900' }}>
                سامانه مدیریت جامع آموزشگاه (آکادمی هدف)
              </h2>
              <span className="pill-badge" style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981', borderColor: '#10B981' }}>
                شعبه فعال
              </span>
            </div>
            <span style={{ fontSize: '12px', color: 'gray', fontWeight: 'bold' }}>
              نظارت بر پرونده و برنامه‌های شاگردان، مانیتورینگ تماس‌ها و جلسات، خزانه‌داری شهریه و پورسانت مشاوران
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <PWAInstallButton />
          <button onClick={handleExportCSV} className="btn" style={{ padding: '8px 14px', fontSize: '12px', background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid #10B981', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
            <Download size={14} /> خروجی اکسل / هلو
          </button>
          <button onClick={onLogout} className="pill-badge" style={{ padding: '8px 16px', cursor: 'pointer', background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', border: 'none' }}>
            خروج امن <ArrowRight size={14} style={{ marginLeft: '4px' }} />
          </button>
        </div>
      </div>

      {/* کارت‌های آماری خزانه‌داری و جامعه آماری */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="bento-card" style={{ borderRight: '4px solid #10B981' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'gray', fontSize: '12px', fontWeight: 'bold' }}>
            <DollarSign size={16} color="#10B981" /> مجموع شهریه وصول‌شده (تومان)
          </div>
          <div className="mono-num" style={{ fontSize: '24px', color: '#10B981', marginTop: '8px', fontWeight: '900' }}>
            {(stats.totalTuition || 14500000).toLocaleString('fa-IR')}
          </div>
        </div>

        <div className="bento-card" style={{ borderRight: '4px solid #C5A880' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'gray', fontSize: '12px', fontWeight: 'bold' }}>
            <Percent size={16} color="#C5A880" /> کل سهم پورسانت مشاوران (تومان)
          </div>
          <div className="mono-num" style={{ fontSize: '24px', color: '#C5A880', marginTop: '8px', fontWeight: '900' }}>
            {(stats.totalAdvisorPayout || 8700000).toLocaleString('fa-IR')}
          </div>
        </div>

        <div className="bento-card" style={{ borderRight: '4px solid #0C1D3F' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'gray', fontSize: '12px', fontWeight: 'bold' }}>
            <Wallet size={16} color="#0C1D3F" /> سود خالص آموزشگاه (تومان)
          </div>
          <div className="mono-num" style={{ fontSize: '24px', color: '#0C1D3F', marginTop: '8px', fontWeight: '900' }}>
            {(stats.netInstituteRevenue || 5800000).toLocaleString('fa-IR')}
          </div>
        </div>

        <div className="bento-card" style={{ borderRight: '4px solid #3B82F6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'gray', fontSize: '12px', fontWeight: 'bold' }}>
            <Users size={16} color="#3B82F6" /> تعداد دانش‌آموزان موسسه
          </div>
          <div className="mono-num" style={{ fontSize: '24px', color: '#3B82F6', marginTop: '8px', fontWeight: '900' }}>
            {students.length} نفر
          </div>
        </div>

        <div className="bento-card" style={{ borderRight: '4px solid #8B5CF6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'gray', fontSize: '12px', fontWeight: 'bold' }}>
            <CheckSquare size={16} color="#8B5CF6" /> درصد تکمیل تکالیف موسسه
          </div>
          <div className="mono-num" style={{ fontSize: '24px', color: '#8B5CF6', marginTop: '8px', fontWeight: '900' }}>
            {stats.homeworkCompletionRate || 100}٪
          </div>
        </div>
      </div>

      {/* تب‌های اصلی پنل مدیریت */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid rgba(12,29,63,0.1)', paddingBottom: '14px', flexWrap: 'wrap' }}>
        {[
          { id: 'students', label: `فهرست دانش‌آموزان (${students.length})`, icon: <Users size={16}/> },
          { id: 'homeworks', label: `تکالیف و عملکرد تحصیلی (${homeworksList.length})`, icon: <CheckSquare size={16}/> },
          { id: 'advisors', label: `دپارتمان مشاوران (${advisors.length})`, icon: <UserCheck size={16}/> },
          { id: 'pending', label: `صف ثبت‌نام جدید (${pendingStudents.length})`, badge: pendingStudents.length > 0 ? pendingStudents.length : null, icon: <UserPlus size={16}/> },
          { id: 'finance', label: 'خزانه‌داری، شهریه و پورسانت', icon: <Wallet size={16}/> },
          { id: 'integrations', label: 'اتصال مالی و درگاه پرداخت', icon: <Database size={16}/> }
        ].map(tab => (
          <button 
            key={tab.id} onClick={() => setActiveTab(tab.id as any)} 
            className="btn" 
            style={{ 
              padding: '10px 18px', 
              borderRadius: '8px', 
              fontWeight: 'bold', 
              fontSize: '13px', 
              border: 'none', 
              background: activeTab === tab.id ? 'var(--primary, #0C1D3F)' : 'transparent', 
              color: activeTab === tab.id ? 'var(--gold, #E6C287)' : 'var(--text-muted, gray)', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              position: 'relative'
            }}
          >
            {tab.icon} {tab.label}
            {tab.badge && (
              <span style={{
                background: '#EF4444',
                color: '#fff',
                borderRadius: '10px',
                padding: '1px 6px',
                fontSize: '11px',
                fontWeight: '900'
              }}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* =========================================================
          ۱. تب جامع دانش‌آموزان: لیست کامل، سرچ زنده و نظارت پرونده
      ========================================================= */}
      {activeTab === 'students' && (
        <div className="bento-card">
          {/* هدر جستجو و فیلترها */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '20px' }}>
            <div>
              <h3 style={{ margin: '0 0 6px 0', color: 'var(--text-main, #0C1D3F)', fontSize: '17px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={20} color="#C5A880" />
                لیست تمام دانش‌آموزان ثبت‌شده در موسسه
              </h3>
              <p style={{ margin: 0, fontSize: '12px', color: 'gray' }}>
                با کلیک روی نام هر دانش‌آموز می‌توانید برنامه‌های مطالعاتی، گزارش کارهای ارسالی، جلسات و تماس‌های مشاور را مانیتور کنید.
              </p>
            </div>

            {/* نوار جستجوی پیشرفته */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} color="gray" style={{ position: 'absolute', right: '12px', top: '12px' }} />
                <input
                  type="text"
                  placeholder="جستجوی نام، تلفن، مشاور، مدرسه..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    padding: '10px 38px 10px 14px',
                    borderRadius: '50px',
                    width: '260px',
                    border: '1px solid #cbd5e1',
                    fontSize: '12px',
                    outline: 'none'
                  }}
                />
              </div>

              {/* فیلتر وضعیت پرداخت */}
              <div style={{ display: 'flex', gap: '6px' }}>
                {[
                  { id: 'all', label: 'همه' },
                  { id: 'paid', label: 'تسویه شده' },
                  { id: 'pending', label: 'در انتظار شهریه' },
                  { id: 'vip', label: 'VIP' }
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFilter(f.id as any)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      border: '1px solid #cbd5e1',
                      background: selectedFilter === f.id ? '#0C1D3F' : 'transparent',
                      color: selectedFilter === f.id ? '#E6C287' : 'gray',
                      cursor: 'pointer'
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* دکمه‌های دریافت خروجی برنامه‌ها و گزارش‌کارها */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={handleExportPlansCSV}
                  className="btn"
                  style={{
                    background: 'rgba(12, 29, 63, 0.06)',
                    border: '1px solid #0C1D3F',
                    color: '#0C1D3F',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                  title="دانلود فایل اکسل / CSV کلیه برنامه‌های مطالعاتی هفتگی دانش‌آموزان موسسه"
                >
                  <Download size={13} color="#C5A880" />
                  <span>خروجی اکسل برنامه‌ها</span>
                </button>

                <button
                  onClick={handleExportReportsCSV}
                  className="btn"
                  style={{
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid #10B981',
                    color: '#10B981',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                  title="دانلود فایل اکسل / CSV کلیه گزارش‌کارهای ارسالی دانش‌آموزان موسسه"
                >
                  <FileText size={13} color="#10B981" />
                  <span>خروجی اکسل گزارش‌کارها</span>
                </button>

                <button
                  onClick={handleExportCSV}
                  className="btn"
                  style={{
                    background: 'rgba(230, 194, 135, 0.15)',
                    border: '1px solid #C5A880',
                    color: '#0C1D3F',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                  title="دانلود خروجی دفاتر مالی و پورسانت مشاوران"
                >
                  <Wallet size={13} color="#C5A880" />
                  <span>خروجی مالی</span>
                </button>

                <button
                  onClick={() => setAddStudentModal({ show: true, fullName: '', phone: '', grade: 'دوازدهم تجربی', advisorId: '', saving: false })}
                  className="btn"
                  style={{
                    background: 'var(--primary, #0C1D3F)',
                    border: '1px solid var(--gold, #C5A880)',
                    color: 'var(--gold, #E6C287)',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                  title="افزودن و ثبت‌نام دانش‌آموز جدید در این موسسه"
                >
                  <Plus size={14} />
                  <span>ثبت دانش‌آموز جدید</span>
                </button>
              </div>
            </div>
          </div>

          {/* جدول اصلی شاگردان */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: 'rgba(12, 29, 63, 0.05)' }}>
                  <th style={{ padding: '14px', color: '#0C1D3F' }}>نام دانش‌آموز</th>
                  <th style={{ padding: '14px', color: '#0C1D3F' }}>پایه و رشته / مدرسه</th>
                  <th style={{ padding: '14px', color: '#0C1D3F' }}>مشاور اختصاص‌یافته</th>
                  <th style={{ padding: '14px', color: '#0C1D3F' }}>گزارش‌کار</th>
                  <th style={{ padding: '14px', color: '#0C1D3F' }}>تماس و جلسات</th>
                  <th style={{ padding: '14px', color: '#0C1D3F' }}>شهریه مشاوره</th>
                  <th style={{ padding: '14px', color: '#0C1D3F' }}>وضعیت مالی</th>
                  <th style={{ padding: '14px', color: '#0C1D3F' }}>عملیات نظارتی</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(student => (
                  <tr key={student.id} style={{ borderBottom: '1px solid rgba(12, 29, 63, 0.05)' }}>
                    {/* نام و شماره */}
                    <td style={{ padding: '14px', fontWeight: 'bold', color: 'var(--text-main, #0C1D3F)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span>{student.name}</span>
                        <span style={{ fontSize: '11px', color: 'gray', fontFamily: 'monospace' }}>{student.phone}</span>
                      </div>
                    </td>

                    {/* پایه و رشته */}
                    <td style={{ padding: '14px' }}>
                      <div style={{ fontSize: '12px' }}>{student.grade}</div>
                      <div style={{ fontSize: '11px', color: 'gray' }}>{student.schoolName}</div>
                    </td>

                    {/* مشاور */}
                    <td style={{ padding: '14px' }}>
                      <span className="pill-badge" style={{ background: 'rgba(197, 168, 128, 0.15)', color: '#0C1D3F', borderColor: '#C5A880' }}>
                        {student.advisorName}
                      </span>
                    </td>

                    {/* گزارش‌کارها */}
                    <td style={{ padding: '14px' }}>
                      <span style={{ fontWeight: 'bold', color: '#0C1D3F' }}>{student.reportsCount} گزارش</span>
                    </td>

                    {/* جلسات و تماس‌ها */}
                    <td style={{ padding: '14px' }}>
                      <span style={{ fontWeight: 'bold', color: '#3B82F6' }}>{student.meetingsCount} جلسه/تماس</span>
                    </td>

                    {/* شهریه */}
                    <td style={{ padding: '14px' }} className="mono-num">
                      <strong>{Number(student.tuitionFee).toLocaleString('fa-IR')}</strong> تومان
                    </td>

                    {/* وضعیت مالی */}
                    <td style={{ padding: '14px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        background: student.paymentStatus === 'paid' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                        color: student.paymentStatus === 'paid' ? '#10B981' : '#EF4444'
                      }}>
                        {student.paymentStatus === 'paid' ? 'تسویه شده' : 'در انتظار پرداخت'}
                      </span>
                    </td>

                    {/* دکمه‌های عملیات */}
                    <td style={{ padding: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                        <button
                          onClick={() => openStudentDossier(student.id)}
                          className="btn"
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            background: '#0C1D3F',
                            color: '#E6C287',
                            border: 'none',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            cursor: 'pointer'
                          }}
                          title="مشاهده برنامه‌ها، گزارش‌کارها و جلسات"
                        >
                          <Eye size={13} /> پرونده جامع
                        </button>

                        <button
                          onClick={() => setReassignModal({ show: true, student, advisorId: String(student.advisor_id || student.advisorId || ''), saving: false })}
                          className="btn"
                          style={{
                            padding: '6px 10px',
                            borderRadius: '6px',
                            background: 'rgba(59, 130, 246, 0.12)',
                            color: '#3B82F6',
                            border: '1px solid #3B82F6',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            cursor: 'pointer'
                          }}
                          title="تغییر یا انتساب دانش‌آموز به مشاور دیگر"
                        >
                          <UserCheck size={12} /> تغییر مشاور
                        </button>

                        <button
                          onClick={() => openTuitionModal(student)}
                          className="btn"
                          style={{
                            padding: '6px 10px',
                            borderRadius: '6px',
                            background: 'rgba(230, 194, 135, 0.2)',
                            color: '#0C1D3F',
                            border: '1px solid #C5A880',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            cursor: 'pointer'
                          }}
                          title="تنظیم شهریه و دریافت لینک پرداخت آنلاین"
                        >
                          <LinkIcon size={12} /> لینک پرداخت
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ padding: '30px', color: 'gray' }}>
                      دانش‌آموزی با عبارت «{searchQuery}» یافت نشد.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================
          ۱.۵. تب نظارت بر تکالیف و فعالیت‌های درسی موسسه (Homeworks Monitoring)
      ========================================================= */}
      {activeTab === 'homeworks' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="bento-card" style={{ borderRight: '4px solid #8B5CF6' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
              <div>
                <h3 style={{ margin: '0 0 6px 0', color: 'var(--text-main, #0C1D3F)', fontSize: '18px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckSquare size={20} color="#8B5CF6" />
                  مانیتورینگ تکالیف و فعالیت‌های درسی دانش‌آموزان موسسه
                </h3>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted, gray)' }}>
                  نظارت مدیر آموزشگاه بر تکالیف تعیین‌شده توسط مشاوران برای شاگردان این شعبه و بررسی وضعیت انجام یا تعویق آن‌ها.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="pill-badge" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6', borderColor: '#8B5CF6', fontSize: '12px' }}>
                  کل تکالیف ثبت‌شده: {homeworksList.length}
                </span>
                <span className="pill-badge" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', borderColor: '#10B981', fontSize: '12px' }}>
                  درصد تکمیل: {stats.homeworkCompletionRate || 100}٪
                </span>
              </div>
            </div>
          </div>

          <div className="bento-card">
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: 'rgba(12, 29, 63, 0.05)' }}>
                    <th style={{ padding: '14px', color: 'var(--text-main, #0C1D3F)' }}>عنوان تکلیف</th>
                    <th style={{ padding: '14px', color: 'var(--text-main, #0C1D3F)' }}>درس / مبحث</th>
                    <th style={{ padding: '14px', color: 'var(--text-main, #0C1D3F)' }}>دانش‌آموز</th>
                    <th style={{ padding: '14px', color: 'var(--text-main, #0C1D3F)' }}>مشاور ناظر</th>
                    <th style={{ padding: '14px', color: 'var(--text-main, #0C1D3F)' }}>مهلت تحویل</th>
                    <th style={{ padding: '14px', color: 'var(--text-main, #0C1D3F)' }}>وضعیت انجام</th>
                    <th style={{ padding: '14px', color: 'var(--text-main, #0C1D3F)' }}>توضیحات و یادداشت</th>
                  </tr>
                </thead>
                <tbody>
                  {homeworksList.map((hw: any) => {
                    const isCompleted = hw.status === 'completed';
                    return (
                      <tr key={hw.id} style={{ borderBottom: '1px solid rgba(12, 29, 63, 0.05)' }}>
                        <td style={{ padding: '14px', fontWeight: 'bold', color: 'var(--text-main, #0C1D3F)' }}>
                          {hw.title}
                        </td>
                        <td style={{ padding: '14px' }}>
                          <span className="pill-badge" style={{ background: 'rgba(197, 168, 128, 0.15)', color: 'var(--text-main, #0C1D3F)' }}>
                            {hw.subject || 'عمومی'}
                          </span>
                        </td>
                        <td style={{ padding: '14px', fontWeight: 'bold' }}>
                          {hw.student_name || hw.studentName || 'دانش‌آموز'}
                        </td>
                        <td style={{ padding: '14px', color: 'var(--text-muted, gray)' }}>
                          {hw.advisor_name || hw.advisorName || 'مشاور موسسه'}
                        </td>
                        <td style={{ padding: '14px' }} className="mono-num">
                          {hw.due_date || hw.dueDate || '۱۴۰۵/۰۸/۱۰'}
                        </td>
                        <td style={{ padding: '14px' }}>
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: '8px',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            background: isCompleted ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
                            color: isCompleted ? '#10B981' : '#D97706',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            {isCompleted ? <CheckCircle size={12} /> : <Clock size={12} />}
                            {isCompleted ? 'انجام شد' : 'در انتظار انجام'}
                          </span>
                        </td>
                        <td style={{ padding: '14px', fontSize: '12px', color: 'var(--text-muted, gray)', maxWidth: '240px', textAlign: 'right' }}>
                          {hw.description || hw.student_note || '---'}
                        </td>
                      </tr>
                    );
                  })}

                  {homeworksList.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ padding: '36px', color: 'var(--text-muted, gray)' }}>
                        تکلیفی در حال حاضر برای دانش‌آموزان این موسسه ثبت نشده است. مشاوران می‌توانند از پرونده هر دانش‌آموز تکلیف جدید تعیین کنند.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          ۲. تب مالی، شهریه و محاسبه پورسانت مشاوران
      ========================================================= */}
      {activeTab === 'finance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* کارت اول: جدول پورسانت و سهم هر مشاور */}
          <div className="bento-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ margin: '0 0 4px 0', color: 'var(--text-main, #0C1D3F)', fontSize: '17px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Percent size={18} color="#C5A880" />
                  تنظیم درصد پورسانت و تسویه حساب مشاوران
                </h3>
                <p style={{ margin: 0, fontSize: '12px', color: 'gray' }}>
                  مدیر موسسه می‌تواند درصد قرارداد هر مشاور را تعیین کند. سهم مشاور و سهم آموزشگاه به صورت خودکار از شهریه شاگردان محاسبه می‌شود.
                </p>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: 'rgba(12, 29, 63, 0.05)' }}>
                    <th style={{ padding: '14px', color: '#0C1D3F' }}>نام مشاور</th>
                    <th style={{ padding: '14px', color: '#0C1D3F' }}>تعداد شاگردان</th>
                    <th style={{ padding: '14px', color: '#0C1D3F' }}>کل شهریه وصول‌شده</th>
                    <th style={{ padding: '14px', color: '#0C1D3F' }}>درصد پورسانت مشاور</th>
                    <th style={{ padding: '14px', color: '#0C1D3F' }}>سهم مشاور (تومان)</th>
                    <th style={{ padding: '14px', color: '#0C1D3F' }}>سهم آموزشگاه (تومان)</th>
                    <th style={{ padding: '14px', color: '#0C1D3F' }}>عملیات تنظیم</th>
                  </tr>
                </thead>
                <tbody>
                  {advisors.map(adv => {
                    const advStudents = students.filter(s => s.advisorId === adv.id);
                    const totalTuit = advStudents.reduce((sum, s) => sum + (s.paymentStatus === 'paid' ? s.tuitionFee : 0), 0);
                    const commPct = adv.commissionPercent || 60;
                    const advShare = Math.round(totalTuit * commPct / 100);
                    const instShare = totalTuit - advShare;

                    return (
                      <tr key={adv.id} style={{ borderBottom: '1px solid rgba(12, 29, 63, 0.05)' }}>
                        <td style={{ padding: '14px', fontWeight: 'bold', color: '#0C1D3F' }}>{adv.name}</td>
                        <td style={{ padding: '14px' }}>{advStudents.length} شاگرد</td>
                        <td style={{ padding: '14px' }} className="mono-num">{totalTuit.toLocaleString('fa-IR')} تومان</td>
                        <td style={{ padding: '14px' }}>
                          <span style={{ background: 'rgba(197, 168, 128, 0.2)', color: '#0C1D3F', padding: '4px 10px', borderRadius: '8px', fontWeight: 'bold' }}>
                            {commPct}٪
                          </span>
                        </td>
                        <td style={{ padding: '14px', color: '#C5A880', fontWeight: 'bold' }} className="mono-num">
                          {advShare.toLocaleString('fa-IR')} تومان
                        </td>
                        <td style={{ padding: '14px', color: '#10B981', fontWeight: 'bold' }} className="mono-num">
                          {instShare.toLocaleString('fa-IR')} تومان
                        </td>
                        <td style={{ padding: '14px' }}>
                          <button
                            onClick={() => setCommissionModal({ show: true, advisor: adv, percentInput: String(commPct), saving: false })}
                            style={{
                              padding: '6px 12px',
                              background: '#0C1D3F',
                              color: '#E6C287',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Edit3 size={12} /> تغییر درصد
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* کارت دوم: جدول ریز شهریه شاگردان و لینک پرداخت */}
          <div className="bento-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#0C1D3F', fontSize: '16px', fontWeight: '900' }}>
                لینک‌های پرداخت آنلاین شهریه دانش‌آموزان
              </h3>
              <span style={{ fontSize: '12px', color: 'gray' }}>امکان ارسال مستقیم لینک به درگاه پرداخت برای هر شاگرد</span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: 'rgba(12, 29, 63, 0.05)' }}>
                    <th style={{ padding: '12px', color: '#0C1D3F' }}>دانش‌آموز</th>
                    <th style={{ padding: '12px', color: '#0C1D3F' }}>مشاور</th>
                    <th style={{ padding: '12px', color: '#0C1D3F' }}>مبلغ شهریه</th>
                    <th style={{ padding: '12px', color: '#0C1D3F' }}>سهم مشاور</th>
                    <th style={{ padding: '12px', color: '#0C1D3F' }}>سهم آموزشگاه</th>
                    <th style={{ padding: '12px', color: '#0C1D3F' }}>لینک اختصاصی پرداخت</th>
                    <th style={{ padding: '12px', color: '#0C1D3F' }}>ارسال پیامک</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(s => (
                    <tr key={s.id} style={{ borderBottom: '1px solid rgba(12, 29, 63, 0.05)' }}>
                      <td style={{ padding: '12px', fontWeight: 'bold' }}>{s.name}</td>
                      <td style={{ padding: '12px', color: 'gray' }}>{s.advisorName}</td>
                      <td style={{ padding: '12px', fontWeight: 'bold' }} className="mono-num">{Number(s.tuitionFee).toLocaleString('fa-IR')} تومان</td>
                      <td style={{ padding: '12px', color: '#C5A880' }} className="mono-num">{Number(s.advisorCommissionAmount).toLocaleString('fa-IR')} تومان ({s.advisorCommissionPercent}٪)</td>
                      <td style={{ padding: '12px', color: '#10B981' }} className="mono-num">{Number(s.instituteShareAmount).toLocaleString('fa-IR')} تومان</td>
                      <td style={{ padding: '12px' }}>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(s.paymentLink);
                            alert(`لینک پرداخت ${s.name} در کلیپ‌بورد کپی شد: \n${s.paymentLink}`);
                          }}
                          style={{
                            padding: '5px 10px',
                            borderRadius: '6px',
                            border: '1px dashed #C5A880',
                            background: 'rgba(230,194,135,0.15)',
                            color: '#0C1D3F',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Copy size={12} /> کپی لینک درگاه
                        </button>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <button
                          onClick={() => alert(`📩 پیامک حاوی لینک درگاه پرداخت به شماره ${s.phone} و والد (${s.parentPhone}) ارسال شد.`)}
                          style={{
                            padding: '5px 10px',
                            borderRadius: '6px',
                            border: '1px solid #10B981',
                            background: 'rgba(16,185,129,0.1)',
                            color: '#10B981',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Send size={12} /> ارسال پیامک
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          ۳. تب اتصال به سیستم‌های مالی و حسابداری (هلو، سپیدار، وب‌هوک)
      ========================================================= */}
      {activeTab === 'integrations' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="bento-card" style={{ borderRight: '4px solid #3B82F6' }}>
            <h3 style={{ margin: '0 0 6px 0', color: 'var(--text-main, #0C1D3F)', fontSize: '18px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Database size={20} color="#3B82F6" />
              مرکز یکپارچه‌سازی با نرم‌افزارهای حسابداری و مالی
            </h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: 'gray' }}>
              اطلاعات دریافتی، شهریه‌ها، فاکتورها و سهم مشاوران را مستقیماً به نرم‌افزار حسابداری موسسه خود متصل کنید.
            </p>

            {syncStatusMsg && (
              <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(16,185,129,0.12)', border: '1px solid #10B981', color: '#10B981', marginBottom: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={18} />
                <span>{syncStatusMsg}</span>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              
              {/* اتصال ۱: نرم‌افزار هلو (Holo ERP) */}
              <div style={{ background: 'rgba(12,29,63,0.03)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(12,29,63,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '900', color: '#0C1D3F', fontSize: '15px' }}>
                    <span style={{ background: '#0C1D3F', color: '#E6C287', padding: '4px 8px', borderRadius: '6px', fontSize: '12px' }}>HOLO</span>
                    اتصال به نرم‌افزار هلو (Holo ERP)
                  </div>
                  <span className="pill-badge" style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981', border: 'none' }}>
                    {holoConfig.enabled ? 'متصل' : 'غیرفعال'}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
                  <div>
                    <label style={{ color: 'gray', display: 'block', marginBottom: '4px' }}>آدرس سرور / Web Service URL:</label>
                    <input
                      type="text"
                      value={holoConfig.server_url}
                      onChange={(e) => setHoloConfig({ ...holoConfig, server_url: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', direction: 'ltr' }}
                    />
                  </div>
                  <div>
                    <label style={{ color: 'gray', display: 'block', marginBottom: '4px' }}>کلید دسترسی (API Key):</label>
                    <input
                      type="password"
                      value={holoConfig.api_key}
                      onChange={(e) => setHoloConfig({ ...holoConfig, api_key: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', direction: 'ltr' }}
                    />
                  </div>
                  <div>
                    <label style={{ color: 'gray', display: 'block', marginBottom: '4px' }}>نام پایگاه داده هلو:</label>
                    <input
                      type="text"
                      value={holoConfig.database_name}
                      onChange={(e) => setHoloConfig({ ...holoConfig, database_name: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', direction: 'ltr' }}
                    />
                  </div>

                  <button
                    onClick={() => handleTestSync('holo')}
                    disabled={isSyncing === 'holo'}
                    style={{
                      marginTop: '8px',
                      padding: '10px',
                      borderRadius: '8px',
                      background: '#0C1D3F',
                      color: '#E6C287',
                      border: 'none',
                      fontWeight: 'bold',
                      cursor: isSyncing === 'holo' ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <RefreshCw size={14} className={isSyncing === 'holo' ? 'spin-animation' : ''} />
                    {isSyncing === 'holo' ? 'در حال برقراری ارتباط...' : 'تست اتصال و همگام‌سازی با هلو'}
                  </button>
                </div>
              </div>

              {/* اتصال ۲: سپیدار سیستم (Sepidar System) */}
              <div style={{ background: 'rgba(12,29,63,0.03)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(12,29,63,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '900', color: '#0C1D3F', fontSize: '15px' }}>
                    <span style={{ background: '#3B82F6', color: '#fff', padding: '4px 8px', borderRadius: '6px', fontSize: '12px' }}>SEPIDAR</span>
                    اتصال به سپیدار سیستم (همکاران سیستم)
                  </div>
                  <span className="pill-badge" style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981', border: 'none' }}>
                    {sepidarConfig.enabled ? 'متصل' : 'غیرفعال'}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
                  <div>
                    <label style={{ color: 'gray', display: 'block', marginBottom: '4px' }}>توکن احراز هویت (Auth Token):</label>
                    <input
                      type="password"
                      value={sepidarConfig.api_token}
                      onChange={(e) => setSepidarConfig({ ...sepidarConfig, api_token: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', direction: 'ltr' }}
                    />
                  </div>
                  <div>
                    <label style={{ color: 'gray', display: 'block', marginBottom: '4px' }}>کد شعبه در سپیدار:</label>
                    <input
                      type="text"
                      value={sepidarConfig.branch_code}
                      onChange={(e) => setSepidarConfig({ ...sepidarConfig, branch_code: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', direction: 'ltr' }}
                    />
                  </div>
                  <div>
                    <label style={{ color: 'gray', display: 'block', marginBottom: '4px' }}>کد معین حساب مشتریان:</label>
                    <input
                      type="text"
                      value={sepidarConfig.customer_ledger_code}
                      onChange={(e) => setSepidarConfig({ ...sepidarConfig, customer_ledger_code: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', direction: 'ltr' }}
                    />
                  </div>

                  <button
                    onClick={() => handleTestSync('sepidar')}
                    disabled={isSyncing === 'sepidar'}
                    style={{
                      marginTop: '8px',
                      padding: '10px',
                      borderRadius: '8px',
                      background: '#3B82F6',
                      color: '#fff',
                      border: 'none',
                      fontWeight: 'bold',
                      cursor: isSyncing === 'sepidar' ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <RefreshCw size={14} className={isSyncing === 'sepidar' ? 'spin-animation' : ''} />
                    {isSyncing === 'sepidar' ? 'در حال برقراری ارتباط...' : 'تست اتصال و ثبت اسناد در سپیدار'}
                  </button>
                </div>
              </div>

            </div>

            {/* بخش وب‌هوک و ذخیره تنظیمات */}
            <div style={{ marginTop: '20px', background: 'rgba(12,29,63,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(12,29,63,0.06)' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: 'bold', color: '#0C1D3F' }}>
                وب‌هوک هوشمند رویدادهای مالی (Financial Webhook)
              </h4>
              <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: 'gray' }}>
                با فعال بودن وب‌هوک، به محض پرداخت آنلاین شهریه توسط دانش‌آموز، سند مالی مستقیماً به آدرس سرور حسابداری شما ارسال می‌شود.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'gray', display: 'block', marginBottom: '4px' }}>نشانی وب‌هوک مقصد (Endpoint URL):</label>
                  <input
                    type="text"
                    value={webhookConfig.url}
                    onChange={(e) => setWebhookConfig({ ...webhookConfig, url: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', direction: 'ltr' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'gray', display: 'block', marginBottom: '4px' }}>کلید امضای امنیتی (Secret Key):</label>
                  <input
                    type="password"
                    value={webhookConfig.secret}
                    onChange={(e) => setWebhookConfig({ ...webhookConfig, secret: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', direction: 'ltr' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={handleSaveIntegrations}
                  className="gold-glow-btn"
                  style={{ padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold' }}
                >
                  ذخیره کلیه تنظیمات حسابداری
                </button>

                <button
                  onClick={() => handleTestSync('webhook')}
                  disabled={isSyncing === 'webhook'}
                  className="btn"
                  style={{ padding: '10px 16px', borderRadius: '8px', fontSize: '12px', background: '#fff', border: '1px solid #cbd5e1', cursor: 'pointer' }}
                >
                  ارسال رویداد تستی (Ping Webhook)
                </button>
              </div>
            </div>

            {/* بخش اتصال به درگاه پرداخت آنلاین شاپرک */}
            <div style={{ marginTop: '24px', background: 'linear-gradient(135deg, rgba(12,29,63,0.03) 0%, rgba(230,194,135,0.08) 100%)', padding: '22px', borderRadius: '16px', border: '1.5px solid #C5A880' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#0C1D3F', color: '#E6C287', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CreditCard size={22} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '900', color: '#0C1D3F' }}>
                      اتصال درگاه پرداخت اینترنتی سایت (Online Payment Gateway)
                    </h4>
                    <span style={{ fontSize: '12px', color: 'gray' }}>
                      پیکربندی اتصال به شبکه پرداخت الکترونیک شاپرک جهت واریز آنلاین هزینه مشاوره توسط دانش‌آموزان و اولیا
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="pill-badge" style={{ background: gatewayConfig.active ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: gatewayConfig.active ? '#10B981' : '#EF4444', border: 'none' }}>
                    {gatewayConfig.active ? 'درگاه فعال و آماده تراکنش' : 'درگاه غیرفعال'}
                  </span>
                  {gatewayConfig.is_sandbox && (
                    <span className="pill-badge" style={{ background: 'rgba(245,158,11,0.1)', color: '#D97706', border: 'none' }}>
                      حالت آزمایشی (Sandbox)
                    </span>
                  )}
                </div>
              </div>

              {gatewayTestMsg && (
                <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(16,185,129,0.12)', border: '1px solid #10B981', color: '#10B981', marginBottom: '16px', fontWeight: 'bold', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={18} />
                  <span>{gatewayTestMsg}</span>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                {/* انتخاب ارائه‌دهنده درگاه */}
                <div>
                  <label style={{ fontSize: '12px', color: '#0C1D3F', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>
                    ارائه‌دهنده درگاه پرداخت (PSP / واسط):
                  </label>
                  <select
                    value={gatewayConfig.provider}
                    onChange={(e) => setGatewayConfig({ ...gatewayConfig, provider: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
                  >
                    <option value="زرین‌پال (ZarinPal)">زرین‌پال (ZarinPal PG)</option>
                    <option value="سامان کیش (SEP)">پرداخت الکترونیک سامان کیش (SEP)</option>
                    <option value="به پرداخت ملت (Mellat)">به پرداخت ملت (BPM)</option>
                    <option value="سداد بانک ملی (Sadad)">پرداخت الکترونیک سداد (Sadad)</option>
                    <option value="زیبال (Zibal)">زیبال (Zibal Payment)</option>
                    <option value="نکست‌پی (NextPay)">نکست‌پی (NextPay)</option>
                  </select>
                </div>

                {/* مرچنت کد / ترمینال ID */}
                <div>
                  <label style={{ fontSize: '12px', color: '#0C1D3F', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>
                    کد پذیرنده / مرچنت کد (Merchant ID):
                  </label>
                  <input
                    type="text"
                    value={gatewayConfig.merchant_id}
                    onChange={(e) => setGatewayConfig({ ...gatewayConfig, merchant_id: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', direction: 'ltr' }}
                  />
                </div>

                {/* کلید اتصال وب‌سرویس / API Key */}
                <div>
                  <label style={{ fontSize: '12px', color: '#0C1D3F', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>
                    کلید امنیتی API / رمز ترمینال:
                  </label>
                  <input
                    type="password"
                    value={gatewayConfig.api_key}
                    onChange={(e) => setGatewayConfig({ ...gatewayConfig, api_key: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', direction: 'ltr' }}
                  />
                </div>

                {/* نشانی بازگشت تراکنش (Callback URL) */}
                <div>
                  <label style={{ fontSize: '12px', color: '#0C1D3F', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>
                    نشانی بازگشت تایید پرداخت (Callback URL):
                  </label>
                  <input
                    type="text"
                    value={gatewayConfig.callback_url}
                    onChange={(e) => setGatewayConfig({ ...gatewayConfig, callback_url: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', direction: 'ltr' }}
                  />
                </div>
              </div>

              {/* سوئیچ‌ها و تنظیمات تکمیلی */}
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '20px', padding: '12px', background: 'rgba(255,255,255,0.7)', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold', color: '#0C1D3F' }}>
                  <input
                    type="checkbox"
                    checked={gatewayConfig.active}
                    onChange={(e) => setGatewayConfig({ ...gatewayConfig, active: e.target.checked })}
                    style={{ width: '16px', height: '16px' }}
                  />
                  فعال بودن درگاه پرداخت آنلاین در سایت
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold', color: '#0C1D3F' }}>
                  <input
                    type="checkbox"
                    checked={gatewayConfig.commission_auto_split}
                    onChange={(e) => setGatewayConfig({ ...gatewayConfig, commission_auto_split: e.target.checked })}
                    style={{ width: '16px', height: '16px' }}
                  />
                  محاسبه و تسهیم خودکار پورسانت مشاور پس از پرداخت
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold', color: '#0C1D3F' }}>
                  <input
                    type="checkbox"
                    checked={gatewayConfig.is_sandbox}
                    onChange={(e) => setGatewayConfig({ ...gatewayConfig, is_sandbox: e.target.checked })}
                    style={{ width: '16px', height: '16px' }}
                  />
                  حالت آزمایشی شبیه‌ساز شاپرک (Sandbox Mode)
                </label>
              </div>

              {/* دکمه‌های اقدام */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  onClick={handleSaveGateway}
                  disabled={gatewaySaving}
                  className="gold-glow-btn"
                  style={{ padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Lock size={15} />
                  {gatewaySaving ? 'در حال ذخیره...' : 'ذخیره و اتصال درگاه پرداخت'}
                </button>

                <button
                  onClick={handleTestGateway}
                  className="btn"
                  style={{ padding: '10px 16px', borderRadius: '8px', fontSize: '12px', background: '#0C1D3F', color: '#E6C287', border: '1px solid #C5A880', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <RefreshCw size={14} />
                  تست اتصال و پینگ درگاه
                </button>

                <button
                  onClick={() => setGatewayModal({ show: true, student: students[0] || { id: 5, name: 'یاشا محبی' }, amount: 3500000 })}
                  className="btn"
                  style={{ padding: '10px 16px', borderRadius: '8px', fontSize: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', border: '1px solid #10B981', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <CreditCard size={14} />
                  آزمایش درگاه پرداخت (تست تراکنش شاپرک)
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================
          ۴. تب صف ثبت‌نام‌های جدید
      ========================================================= */}
      {activeTab === 'pending' && (
        <div className="bento-card">
          <h3 style={{ margin: '0 0 16px 0', color: '#0C1D3F', fontSize: '16px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserPlus size={20} color="#C5A880" /> ثبت‌نام‌های جدید در انتظار تایید و تخصیص مشاور
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: 'rgba(12, 29, 63, 0.05)' }}>
                  <th style={{ padding: '14px', color: '#0C1D3F' }}>نام دانش‌آموز</th>
                  <th style={{ padding: '14px', color: '#0C1D3F' }}>شماره تماس</th>
                  <th style={{ padding: '14px', color: '#0C1D3F' }}>پایه</th>
                  <th style={{ padding: '14px', color: '#0C1D3F' }}>زمان ثبت‌نام</th>
                  <th style={{ padding: '14px', color: '#0C1D3F' }}>عملیات تخصیص</th>
                </tr>
              </thead>
              <tbody>
                {pendingStudents.map(student => (
                  <tr key={student.id} style={{ borderBottom: '1px solid rgba(12, 29, 63, 0.05)' }}>
                    <td style={{ padding: '14px', fontWeight: '900', color: '#0C1D3F' }}>{student.name}</td>
                    <td style={{ padding: '14px' }} className="mono-num">{student.phone}</td>
                    <td style={{ padding: '14px' }}>{student.grade}</td>
                    <td style={{ padding: '14px', color: 'gray' }}>{student.date}</td>
                    <td style={{ padding: '14px' }}>
                      <button
                        onClick={() => setAssignModal({ show: true, student })}
                        className="btn btn-primary"
                        style={{ padding: '7px 14px', fontSize: '12px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      >
                        <CheckCircle size={14} /> تایید و انتخاب مشاور
                      </button>
                    </td>
                  </tr>
                ))}
                {pendingStudents.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: '30px', color: 'gray' }}>
                      هیچ ثبت‌نام جدیدی در صف انتظار نیست.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================
          ۵. تب دپارتمان مشاوران
      ========================================================= */}
      {activeTab === 'advisors' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="bento-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <h3 style={{ margin: '0 0 6px 0', color: 'var(--text-main, #0C1D3F)', fontSize: '18px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserCheck size={20} color="#C5A880" />
                دپارتمان مشاوران و تیم تخصصی موسسه
              </h3>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted, gray)' }}>
                مدیریت دسترسی، تعداد شاگردان فعال، قراردادهای پورسانت و افزودن یا تعلیق مشاوران این شعبه.
              </p>
            </div>

            <button
              onClick={() => setAddAdvisorModal({ show: true, fullName: '', phone: '', password: '', grade: 'مشاور ارشد کنکور', saving: false })}
              className="gold-glow-btn"
              style={{ padding: '10px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={16} />
              <span>تعریف مشاور جدید برای موسسه</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {advisors.map(adv => (
              <div key={adv.id} className="bento-card" style={{ borderTop: '4px solid #10B981', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <div>
                      <span style={{ fontWeight: '900', color: 'var(--text-main, #0C1D3F)', fontSize: '16px', display: 'block' }}>
                        {adv.full_name || adv.name}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted, gray)' }}>
                        {adv.grade || adv.custom_group || 'مشاور کنکور'}
                      </span>
                    </div>
                    <span className="pill-badge" style={{ background: adv.status === 'suspended' ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', color: adv.status === 'suspended' ? '#EF4444' : '#10B981', border: 'none' }}>
                      {adv.status === 'suspended' ? 'معلق' : 'فعال'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-around', padding: '12px', background: 'rgba(12, 29, 63, 0.03)', borderRadius: '10px', marginBottom: '15px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: 'var(--text-muted, gray)', fontSize: '11px' }}>شاگردان فعال</div>
                      <div className="mono-num" style={{ fontSize: '20px', color: 'var(--text-main, #0C1D3F)', fontWeight: 'bold' }}>
                        {adv.student_count || adv.studentCount || adv.studentsCount || 0}
                      </div>
                    </div>
                    <div style={{ width: '1px', background: 'rgba(12, 29, 63, 0.1)' }}></div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: 'var(--text-muted, gray)', fontSize: '11px' }}>درصد پورسانت</div>
                      <div className="mono-num" style={{ fontSize: '20px', color: '#C5A880', fontWeight: 'bold' }}>
                        {adv.commissionPercent || 60}٪
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: '12px', color: 'var(--text-muted, gray)', marginBottom: '14px' }}>
                    شماره تماس: <span className="mono-num" style={{ color: 'var(--text-main)' }}>{adv.phone_number || adv.phone}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                  <button
                    onClick={() => setCommissionModal({ show: true, advisor: adv, percentInput: String(adv.commissionPercent || 60), saving: false })}
                    style={{ flex: 1, padding: '8px 12px', background: 'rgba(230,194,135,0.15)', border: '1px solid #C5A880', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-main, #0C1D3F)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                  >
                    <Edit3 size={13} /> درصد قرارداد
                  </button>

                  <button
                    onClick={() => handleRemoveAdvisor(adv)}
                    style={{ padding: '8px 12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    title="حذف یا تعلیق مشاور از موسسه"
                  >
                    <XCircle size={13} /> حذف
                  </button>
                </div>
              </div>
            ))}

            {advisors.length === 0 && (
              <div className="bento-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-muted, gray)' }}>
                هنوز هیچ مشاوری برای این آموزشگاه تعریف نشده است. با کلیک روی دکمه بالا اولین مشاور را اضافه کنید.
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================
          مودال ۱: پرونده و مانیتورینگ جامع دانش‌آموز (برنامه، گزارش، جلسات، مالی)
      ========================================================= */}
      {dossierModal.show && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(8, 18, 41, 0.85)',
            backdropFilter: 'blur(5px)',
            padding: '20px',
            direction: 'rtl'
          }}
          onClick={() => setDossierModal(prev => ({ ...prev, show: false }))}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '880px',
              maxHeight: '90vh',
              background: 'var(--bg-card, #ffffff)',
              borderRadius: '20px',
              boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
              border: '1px solid rgba(230, 194, 135, 0.4)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              animation: 'fadeIn 0.25s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* هدر پرونده */}
            <div style={{
              background: 'linear-gradient(135deg, #0C1D3F 0%, #1B3366 100%)',
              padding: '20px 24px',
              color: '#fff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '2px solid rgba(230, 194, 135, 0.4)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: 'rgba(230, 194, 135, 0.2)', color: '#E6C287', width: '42px', height: '42px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#fff' }}>
                    پرونده تحصیلی و نظارتی {dossierModal.data?.student?.name}
                  </h3>
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
                    مشاور مسئول: <strong>{dossierModal.data?.student?.advisorName}</strong> | پایه: {dossierModal.data?.student?.grade}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  onClick={() => setNewEventModal({
                    show: true,
                    studentId: dossierModal.data?.student?.id,
                    title: `جلسه با ${dossierModal.data?.student?.name}`,
                    eventType: 'meeting',
                    date: new Date().toLocaleDateString('fa-IR'),
                    time: '۱۷:۰۰',
                    notes: '',
                    saving: false
                  })}
                  style={{
                    background: 'rgba(230, 194, 135, 0.25)',
                    border: '1px solid #C5A880',
                    color: '#E6C287',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Plus size={13} /> ثبت تماس / جلسه جدید
                </button>

                <button
                  onClick={() => setDossierModal(prev => ({ ...prev, show: false }))}
                  style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}
                >
                  <XCircle size={22} />
                </button>
              </div>
            </div>

            {/* ساب‌تب‌های پرونده */}
            <div style={{
              display: 'flex',
              background: 'rgba(12, 29, 63, 0.04)',
              borderBottom: '1px solid rgba(12, 29, 63, 0.08)',
              padding: '6px 20px',
              gap: '8px'
            }}>
              {[
                { id: 'plans', label: 'برنامه‌های دریافتی', icon: <Calendar size={15}/> },
                { id: 'reports', label: 'گزارش کارهای ارسالی', icon: <FileText size={15}/> },
                { id: 'events', label: 'جلسات حضوری و تماس‌ها', icon: <Phone size={15}/> },
                { id: 'financials', label: 'وضعیت شهریه و درگاه', icon: <DollarSign size={15}/> }
              ].map(sub => (
                <button
                  key={sub.id}
                  onClick={() => setDossierModal(prev => ({ ...prev, activeSubTab: sub.id as any }))}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    background: dossierModal.activeSubTab === sub.id ? '#0C1D3F' : 'transparent',
                    color: dossierModal.activeSubTab === sub.id ? '#E6C287' : 'gray',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {sub.icon} {sub.label}
                </button>
              ))}
            </div>

            {/* بدنه محتوای ساب‌تب‌ها */}
            <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }} className="custom-scrollbar">
              
              {dossierModal.loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <Loader2 size={32} className="spin-animation" style={{ margin: '0 auto 10px auto' }} />
                  <span>در حال بارگذاری پرونده...</span>
                </div>
              ) : (
                <>
                  {/* ۱. تب برنامه‌های دریافتی دانش‌آموز به صورت جدول رسمی */}
                  {dossierModal.activeSubTab === 'plans' && (
                    <div>
                      {dossierModal.data?.studyPlans?.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '30px', color: 'gray' }}>هنوز برنامه مطالعاتی برای این دانش‌آموز ثبت نشده است.</div>
                      ) : (
                        dossierModal.data?.studyPlans?.map((plan: any) => (
                          <div key={plan.id} style={{ marginBottom: '20px' }}>
                            <WeeklyPlanTableView
                              planData={plan.plan_data || {}}
                              startDate={plan.start_date || '۱۴۰۵/۰۸/۰۱'}
                              endDate={plan.end_date || '۱۴۰۵/۰۸/۰۷'}
                              studentName={dossierModal.data?.student?.name || 'دانش‌آموز'}
                              advisorName={dossierModal.data?.student?.advisorName || 'دکتر کاظمی'}
                              readOnly={true}
                              showExportButtons={true}
                            />
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* ۲. تب گزارش کارهای ارسالی دانش‌آموز همراه با خروجی */}
                  {dossierModal.activeSubTab === 'reports' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {/* نوار دریافت خروجی و چاپ گزارش‌کارها */}
                      <div style={{
                        background: '#f8fafc',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '10px'
                      }}>
                        <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#0C1D3F' }}>
                          سوابق گزارش‌کارهای ثبت‌شده ({dossierModal.data?.workReports?.length || 0} روز اخیر)
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => {
                              const reports = dossierModal.data?.workReports || [];
                              let csv = 'تاریخ گزارش,ساعت کل مطالعه,تعداد کل تست,تفکیک دروس,یادداشت دانش‌آموز\n';
                              reports.forEach((r: any) => {
                                const subStr = r.report_items ? Object.entries(r.report_items).map(([s, d]: [string, any]) => `${s}: ${d.time}h/${d.tests}t`).join(' | ') : '';
                                const noteClean = (r.student_note || '').replace(/,/g, '،').replace(/\n/g, ' ');
                                csv += `${r.report_date},${r.total_study_time || 0},${r.total_test_count || 0},"${subStr}","${noteClean}"\n`;
                              });
                              const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
                              const url = URL.createObjectURL(blob);
                              const link = document.createElement('a');
                              link.href = url;
                              link.setAttribute('download', `گزارش_کار_${dossierModal.data?.student?.name?.replace(/\s+/g, '_')}.csv`);
                              document.body.appendChild(link);
                              link.click();
                              link.remove();
                            }}
                            className="btn"
                            style={{
                              background: 'rgba(16, 185, 129, 0.1)',
                              border: '1px solid #10B981',
                              color: '#10B981',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Download size={13} /> خروجی اکسل این گزارش‌ها
                          </button>

                          <button
                            onClick={() => window.print()}
                            className="btn"
                            style={{
                              background: '#0C1D3F',
                              border: '1px solid #C5A880',
                              color: '#E6C287',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              cursor: 'pointer'
                            }}
                          >
                            چاپ کارنامه گزارش‌کارها
                          </button>
                        </div>
                      </div>

                      {dossierModal.data?.workReports?.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '30px', color: 'gray' }}>هنوز گزارش کاری ثبت نشده است.</div>
                      ) : (
                        dossierModal.data?.workReports?.map((rep: any) => (
                          <div key={rep.id} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                              <span style={{ fontWeight: 'bold', color: '#0C1D3F' }}>تاریخ گزارش: {rep.report_date}</span>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <span className="pill-badge" style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981' }}>
                                  ساعت مطالعه: {rep.total_study_time} ساعت
                                </span>
                                <span className="pill-badge" style={{ background: 'rgba(59,130,246,0.1)', color: '#3B82F6' }}>
                                  تعداد تست: {rep.total_test_count} تست
                                </span>
                              </div>
                            </div>

                            {/* ریز دروس */}
                            {rep.report_items && (
                              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
                                {Object.entries(rep.report_items).map(([subj, d]: [string, any]) => (
                                  <div key={subj} style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '4px 10px', borderRadius: '6px', fontSize: '11px' }}>
                                    <strong>{subj}:</strong> {d.time} ساعت | {d.tests} تست
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* یادداشت دانش‌آموز / کپسول مرور */}
                            {rep.student_note && (
                              <div style={{ background: '#fff', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px', color: '#334155', whiteSpace: 'pre-line' }}>
                                <strong>یادداشت و کپسول مرور:</strong>
                                <div>{rep.student_note}</div>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* ۳. تب جلسات و تماس‌های مشاور */}
                  {dossierModal.activeSubTab === 'events' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#0C1D3F' }}>تاریخچه ارتباطات و جلسات مشاوره</span>
                        <button
                          onClick={() => setNewEventModal({
                            show: true,
                            studentId: dossierModal.data?.student?.id,
                            title: '',
                            eventType: 'call',
                            date: new Date().toLocaleDateString('fa-IR'),
                            time: '۱۸:۰۰',
                            notes: '',
                            saving: false
                          })}
                          style={{ padding: '6px 12px', background: '#0C1D3F', color: '#E6C287', border: 'none', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                          + ثبت تماس یا جلسه جدید
                        </button>
                      </div>

                      {dossierModal.data?.advisorEvents?.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '30px', color: 'gray' }}>تماس یا جلسه‌ای تا کنون ثبت نشده است.</div>
                      ) : (
                        dossierModal.data?.advisorEvents?.map((ev: any) => (
                          <div key={ev.id} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ display: 'flex', gap: '12px' }}>
                              <div style={{
                                width: '36px', height: '36px', borderRadius: '10px',
                                background: ev.event_type === 'call' ? 'rgba(59,130,246,0.1)' : 'rgba(16,185,129,0.1)',
                                color: ev.event_type === 'call' ? '#3B82F6' : '#10B981',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                              }}>
                                {ev.event_type === 'call' ? <Phone size={18} /> : <Calendar size={18} />}
                              </div>
                              <div>
                                <strong style={{ color: '#0C1D3F', fontSize: '14px' }}>{ev.title}</strong>
                                <div style={{ fontSize: '11px', color: 'gray', marginTop: '2px' }}>
                                  مشاور: {ev.advisor_name || 'دکتر کاظمی'} | تاریخ: {ev.event_date} - ساعت {ev.event_time}
                                </div>
                                {ev.notes && (
                                  <div style={{ fontSize: '12px', color: '#475569', marginTop: '6px', background: '#fff', padding: '6px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                    {ev.notes}
                                  </div>
                                )}
                              </div>
                            </div>
                            <span className="pill-badge" style={{ background: ev.event_type === 'call' ? 'rgba(59,130,246,0.1)' : 'rgba(16,185,129,0.1)', color: ev.event_type === 'call' ? '#3B82F6' : '#10B981' }}>
                              {ev.event_type === 'call' ? 'تماس تلفنی' : 'جلسه حضوری'}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* ۴. تب وضعیت شهریه و درگاه آنلاین */}
                  {dossierModal.activeSubTab === 'financials' && (
                    <div>
                      <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '14px', padding: '18px', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                          <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#0C1D3F' }}>اطلاعات قرارداد و شهریه مشاوره</span>
                          <button
                            onClick={() => openTuitionModal(dossierModal.data?.student)}
                            style={{ padding: '6px 12px', background: '#0C1D3F', color: '#E6C287', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                          >
                            ویرایش مبلغ شهریه
                          </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '13px' }}>
                          <div>
                            <span style={{ color: 'gray' }}>مبلغ شهریه مصوب:</span>
                            <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#0C1D3F' }} className="mono-num">
                              {Number(dossierModal.data?.student?.tuitionFee).toLocaleString('fa-IR')} تومان
                            </div>
                          </div>
                          <div>
                            <span style={{ color: 'gray' }}>سهم پورسانت مشاور ({dossierModal.data?.student?.advisorCommissionPercent}٪):</span>
                            <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#C5A880' }} className="mono-num">
                              {Number(dossierModal.data?.student?.advisorCommissionAmount).toLocaleString('fa-IR')} تومان
                            </div>
                          </div>
                          <div>
                            <span style={{ color: 'gray' }}>سهم خالص آموزشگاه:</span>
                            <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#10B981' }} className="mono-num">
                              {Number(dossierModal.data?.student?.instituteShareAmount).toLocaleString('fa-IR')} تومان
                            </div>
                          </div>
                        </div>

                        {/* لینک پرداخت آنلاین */}
                        <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #e2e8f0' }}>
                          <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#0C1D3F', display: 'block', marginBottom: '6px' }}>
                            لینک درگاه پرداخت آنلاین شاگرد:
                          </span>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                              type="text"
                              readOnly
                              value={dossierModal.data?.student?.paymentLink}
                              style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '12px', direction: 'ltr' }}
                            />
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(dossierModal.data?.student?.paymentLink);
                                alert('لینک درگاه پرداخت کپی شد ✅');
                              }}
                              style={{ padding: '8px 14px', background: 'rgba(230,194,135,0.25)', border: '1px solid #C5A880', borderRadius: '8px', color: '#0C1D3F', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                            >
                              کپی لینک
                            </button>
                            <button
                              onClick={() => setGatewayModal({
                                show: true,
                                student: dossierModal.data?.student,
                                amount: Number(dossierModal.data?.student?.tuitionFee) || 3500000
                              })}
                              style={{ padding: '8px 14px', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                              <CreditCard size={14} /> پرداخت آنلاین درگاه شاپرک
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          مودال ۲: تنظیم شهریه و لینک پرداخت آنلاین
      ========================================================= */}
      {tuitionModal.show && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(8, 18, 41, 0.85)',
            backdropFilter: 'blur(5px)',
            padding: '20px',
            direction: 'rtl'
          }}
          onClick={() => setTuitionModal(prev => ({ ...prev, show: false }))}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '460px',
              background: '#fff',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
              border: '1px solid #C5A880'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 14px 0', color: '#0C1D3F', fontSize: '17px', fontWeight: '900' }}>
              تنظیم مبلغ شهریه مشاوره {tuitionModal.student?.name}
            </h3>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: 'gray', marginBottom: '6px' }}>
                مبلغ شهریه دوره مشاوره (تومان):
              </label>
              <input
                type="number"
                value={tuitionModal.feeInput}
                onChange={(e) => setTuitionModal({ ...tuitionModal, feeInput: e.target.value })}
                placeholder="مثال: 3500000"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: 'bold', direction: 'ltr', textAlign: 'right' }}
              />
              <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                {[2500000, 3500000, 4500000, 5500000].map(fee => (
                  <button
                    key={fee}
                    onClick={() => setTuitionModal({ ...tuitionModal, feeInput: String(fee) })}
                    style={{ flex: 1, padding: '4px', fontSize: '11px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f1f5f9', cursor: 'pointer' }}
                  >
                    {fee.toLocaleString('fa-IR')}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: 'gray', marginBottom: '6px' }}>
                وضعیت پرداخت:
              </label>
              <select
                value={tuitionModal.statusInput}
                onChange={(e) => setTuitionModal({ ...tuitionModal, statusInput: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              >
                <option value="paid">تسویه شده (کامل)</option>
                <option value="pending">در انتظار پرداخت</option>
                <option value="overdue">سررسید گذشته (بدهکار)</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setTuitionModal(prev => ({ ...prev, show: false }))}
                style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'transparent', cursor: 'pointer', fontWeight: 'bold' }}
              >
                انصراف
              </button>
              <button
                onClick={handleSaveTuition}
                disabled={tuitionModal.saving}
                className="gold-glow-btn"
                style={{ flex: 2, padding: '12px', borderRadius: '10px', fontWeight: 'bold' }}
              >
                {tuitionModal.saving ? 'در حال ثبت...' : 'ذخیره و تولید لینک پرداخت'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          مودال ۳: تنظیم درصد پورسانت مشاور
      ========================================================= */}
      {commissionModal.show && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(8, 18, 41, 0.85)',
            backdropFilter: 'blur(5px)',
            padding: '20px',
            direction: 'rtl'
          }}
          onClick={() => setCommissionModal(prev => ({ ...prev, show: false }))}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '420px',
              background: '#fff',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
              border: '1px solid #C5A880'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 10px 0', color: '#0C1D3F', fontSize: '17px', fontWeight: '900' }}>
              درصد پورسانت {commissionModal.advisor?.name}
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: 'gray' }}>
              درصد تعیین‌شده، مستقیماً از شهریه پرداختی هر شاگرد تحت نظر این مشاور کسر و منظور می‌گردد.
            </p>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: 'gray', marginBottom: '6px' }}>
                درصد سهم مشاور (بین ۰ تا ۱۰۰):
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={commissionModal.percentInput}
                  onChange={(e) => setCommissionModal({ ...commissionModal, percentInput: e.target.value })}
                  style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '16px', fontWeight: 'bold', direction: 'ltr', textAlign: 'center' }}
                />
                <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#0C1D3F' }}>٪</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setCommissionModal(prev => ({ ...prev, show: false }))}
                style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'transparent', cursor: 'pointer' }}
              >
                انصراف
              </button>
              <button
                onClick={handleSaveCommission}
                disabled={commissionModal.saving}
                className="gold-glow-btn"
                style={{ flex: 2, padding: '10px', borderRadius: '10px', fontWeight: 'bold' }}
              >
                {commissionModal.saving ? 'در حال ثبت...' : 'ذخیره درصد پورسانت'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          مودال ۴: ثبت تماس تلفنی یا جلسه حضوری جدید
      ========================================================= */}
      {newEventModal.show && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(8, 18, 41, 0.85)',
            backdropFilter: 'blur(5px)',
            padding: '20px',
            direction: 'rtl'
          }}
          onClick={() => setNewEventModal(prev => ({ ...prev, show: false }))}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '460px',
              background: '#fff',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
              border: '1px solid #C5A880'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 14px 0', color: '#0C1D3F', fontSize: '17px', fontWeight: '900' }}>
              ثبت رویداد مشاوره‌ای (جلسه حضوری / تماس تلفنی)
            </h3>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: 'gray', marginBottom: '4px' }}>نوع رویداد:</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setNewEventModal({ ...newEventModal, eventType: 'call' })}
                  style={{
                    flex: 1, padding: '8px', borderRadius: '8px',
                    border: '1px solid #3B82F6',
                    background: newEventModal.eventType === 'call' ? '#3B82F6' : 'transparent',
                    color: newEventModal.eventType === 'call' ? '#fff' : '#3B82F6',
                    fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                  }}
                >
                  <Phone size={14} /> تماس تلفنی
                </button>
                <button
                  type="button"
                  onClick={() => setNewEventModal({ ...newEventModal, eventType: 'meeting' })}
                  style={{
                    flex: 1, padding: '8px', borderRadius: '8px',
                    border: '1px solid #10B981',
                    background: newEventModal.eventType === 'meeting' ? '#10B981' : 'transparent',
                    color: newEventModal.eventType === 'meeting' ? '#fff' : '#10B981',
                    fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                  }}
                >
                  <Calendar size={14} /> جلسه حضوری
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: 'gray', marginBottom: '4px' }}>عنوان رویداد:</label>
              <input
                type="text"
                value={newEventModal.title}
                onChange={(e) => setNewEventModal({ ...newEventModal, title: e.target.value })}
                placeholder="مثال: تماس پیگیری افت تراز آزمون ماز"
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'gray', marginBottom: '4px' }}>تاریخ:</label>
                <input
                  type="text"
                  value={newEventModal.date}
                  onChange={(e) => setNewEventModal({ ...newEventModal, date: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', textAlign: 'center' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'gray', marginBottom: '4px' }}>ساعت:</label>
                <input
                  type="text"
                  value={newEventModal.time}
                  onChange={(e) => setNewEventModal({ ...newEventModal, time: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', textAlign: 'center' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: 'gray', marginBottom: '4px' }}>خلاصه نکات و توصیه مشاور:</label>
              <textarea
                rows={3}
                value={newEventModal.notes}
                onChange={(e) => setNewEventModal({ ...newEventModal, notes: e.target.value })}
                placeholder="توصیه‌های ارائه شده در جلسه..."
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setNewEventModal(prev => ({ ...prev, show: false }))}
                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'transparent', cursor: 'pointer' }}
              >
                انصراف
              </button>
              <button
                onClick={handleAddEvent}
                disabled={newEventModal.saving}
                className="gold-glow-btn"
                style={{ flex: 2, padding: '10px', borderRadius: '8px', fontWeight: 'bold' }}
              >
                {newEventModal.saving ? 'در حال ثبت...' : 'ثبت در پرونده دانش‌آموز'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* مودال تخصیص مشاور برای دانش‌آموزان در انتظار */}
      {assignModal.show && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(12, 29, 63, 0.85)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div className="bento-card" style={{ width: '90%', maxWidth: '420px', animation: 'fadeIn 0.3s ease-out' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#0C1D3F', borderBottom: '1px solid rgba(12,29,63,0.1)', paddingBottom: '10px' }}>
              تخصیص مشاور به {assignModal.student?.name}
            </h3>
            <p style={{ fontSize: '13px', color: 'gray', marginBottom: '15px' }}>
              مشاور مورد نظر را از کادر مشاوره موسسه انتخاب فرمایید:
            </p>
            
            <select 
              value={selectedAdvisorId} 
              onChange={(e) => setSelectedAdvisorId(e.target.value)}
              style={{ width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }}
            >
              <option value="">-- انتخاب مشاور موسسه --</option>
              {advisors.map(adv => (
                <option key={adv.id} value={adv.id}>{adv.name} (شاگردان فعلی: {adv.studentCount || adv.studentsCount || 0})</option>
              ))}
            </select>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setAssignModal({ show: false, student: null })} className="btn" style={{ flex: 1, background: 'transparent', border: '1px solid gray', color: 'gray', padding: '10px', borderRadius: '8px' }}>انصراف</button>
              <button 
                onClick={handleApproveAndAssign} 
                disabled={actionLoading}
                className="gold-glow-btn" 
                style={{ flex: 2, padding: '10px', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
              >
                {actionLoading ? <Loader2 size={16} className="spin-animation" /> : 'تایید نهایی و اتصال'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* مودال درگاه پرداخت اینترنتی آنلاین شاپرک */}
      <OnlineGatewayModal
        show={gatewayModal.show}
        onClose={() => setGatewayModal({ show: false, student: null, amount: 3500000 })}
        tuitionAmount={gatewayModal.amount}
        studentName={gatewayModal.student?.name || 'یاشا محبی'}
        studentId={gatewayModal.student?.id || 5}
        gatewayProvider={gatewayConfig.provider}
        onPaymentSuccess={() => {
          fetchDashboardData();
          if (dossierModal.show && dossierModal.studentId) {
            openStudentDossier(dossierModal.studentId);
          }
        }}
      />

      {/* مودال تعریف مشاور جدید برای آموزشگاه */}
      {addAdvisorModal.show && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(8, 18, 41, 0.85)', backdropFilter: 'blur(6px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, direction: 'rtl', padding: '16px' }}>
          <div className="bento-card" style={{ width: '100%', maxWidth: '450px', animation: 'fadeIn 0.25s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
              <h3 style={{ margin: 0, color: 'var(--text-main, #0C1D3F)', fontSize: '17px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserPlus size={18} color="#C5A880" />
                تعریف مشاور جدید در موسسه
              </h3>
              <button onClick={() => setAddAdvisorModal(prev => ({ ...prev, show: false }))} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <XCircle size={20} />
              </button>
            </div>

            <form onSubmit={handleAddAdvisor} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '5px' }}>
                  نام و نام خانوادگی مشاور:
                </label>
                <input
                  type="text"
                  placeholder="مثال: دکتر رامتین کیانی"
                  value={addAdvisorModal.fullName}
                  onChange={(e) => setAddAdvisorModal({ ...addAdvisorModal, fullName: e.target.value })}
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '5px' }}>
                  شماره موبایل (نام کاربری ورود):
                </label>
                <input
                  type="tel"
                  placeholder="0912..."
                  value={addAdvisorModal.phone}
                  onChange={(e) => setAddAdvisorModal({ ...addAdvisorModal, phone: e.target.value })}
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '13px', direction: 'ltr' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '5px' }}>
                  رمز عبور اولیه:
                </label>
                <input
                  type="text"
                  placeholder="123456"
                  value={addAdvisorModal.password}
                  onChange={(e) => setAddAdvisorModal({ ...addAdvisorModal, password: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '13px', direction: 'ltr' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '5px' }}>
                  تخصص یا پایه هدف:
                </label>
                <input
                  type="text"
                  placeholder="مثال: مشاور ارشد کنکور تجربی و ریاضی"
                  value={addAdvisorModal.grade}
                  onChange={(e) => setAddAdvisorModal({ ...addAdvisorModal, grade: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setAddAdvisorModal(prev => ({ ...prev, show: false }))}
                  className="btn"
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-muted)' }}
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={addAdvisorModal.saving}
                  className="gold-glow-btn"
                  style={{ flex: 2, padding: '10px', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}
                >
                  {addAdvisorModal.saving ? <Loader2 size={16} className="spin-animation" /> : 'ثبت و صدور دسترسی مشاور'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* مودال ثبت‌نام دانش‌آموز جدید در آموزشگاه */}
      {addStudentModal.show && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(8, 18, 41, 0.85)', backdropFilter: 'blur(6px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, direction: 'rtl', padding: '16px' }}>
          <div className="bento-card" style={{ width: '100%', maxWidth: '450px', animation: 'fadeIn 0.25s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
              <h3 style={{ margin: 0, color: 'var(--text-main, #0C1D3F)', fontSize: '17px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} color="#C5A880" />
                ثبت‌نام دانش‌آموز جدید در موسسه
              </h3>
              <button onClick={() => setAddStudentModal(prev => ({ ...prev, show: false }))} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <XCircle size={20} />
              </button>
            </div>

            <form onSubmit={handleAddStudent} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '5px' }}>
                  نام و نام خانوادگی دانش‌آموز:
                </label>
                <input
                  type="text"
                  placeholder="مثال: پارسا نوروزی"
                  value={addStudentModal.fullName}
                  onChange={(e) => setAddStudentModal({ ...addStudentModal, fullName: e.target.value })}
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '5px' }}>
                  شماره موبایل دانش‌آموز:
                </label>
                <input
                  type="tel"
                  placeholder="0912..."
                  value={addStudentModal.phone}
                  onChange={(e) => setAddStudentModal({ ...addStudentModal, phone: e.target.value })}
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '13px', direction: 'ltr' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '5px' }}>
                  پایه و رشته تحصیلی:
                </label>
                <select
                  value={addStudentModal.grade}
                  onChange={(e) => setAddStudentModal({ ...addStudentModal, grade: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '13px' }}
                >
                  <option value="دوازدهم تجربی">دوازدهم تجربی</option>
                  <option value="دوازدهم ریاضی">دوازدهم ریاضی</option>
                  <option value="دوازدهم انسانی">دوازدهم انسانی</option>
                  <option value="یازدهم تجربی">یازدهم تجربی</option>
                  <option value="یازدهم ریاضی">یازدهم ریاضی</option>
                  <option value="دهم تجربی">دهم تجربی</option>
                  <option value="فارغ‌التحصیل / پشت کنکور">فارغ‌التحصیل / پشت کنکور</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '5px' }}>
                  مشاور اختصاص‌یافته (اختیاری):
                </label>
                <select
                  value={addStudentModal.advisorId}
                  onChange={(e) => setAddStudentModal({ ...addStudentModal, advisorId: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '13px' }}
                >
                  <option value="">-- بدون مشاور (انتقال به صف انتظار) --</option>
                  {advisors.map(adv => (
                    <option key={adv.id} value={adv.id}>{adv.full_name || adv.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setAddStudentModal(prev => ({ ...prev, show: false }))}
                  className="btn"
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-muted)' }}
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={addStudentModal.saving}
                  className="gold-glow-btn"
                  style={{ flex: 2, padding: '10px', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}
                >
                  {addStudentModal.saving ? <Loader2 size={16} className="spin-animation" /> : 'ثبت پرونده دانش‌آموز'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* مودال تغییر یا انتساب دانش‌آموز به مشاور دیگر */}
      {reassignModal.show && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(8, 18, 41, 0.85)', backdropFilter: 'blur(6px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, direction: 'rtl', padding: '16px' }}>
          <div className="bento-card" style={{ width: '100%', maxWidth: '440px', animation: 'fadeIn 0.25s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
              <h3 style={{ margin: 0, color: 'var(--text-main, #0C1D3F)', fontSize: '17px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserCheck size={18} color="#3B82F6" />
                تغییر مشاور «{reassignModal.student?.name || reassignModal.student?.full_name}»
              </h3>
              <button onClick={() => setReassignModal(prev => ({ ...prev, show: false }))} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <XCircle size={20} />
              </button>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              مشاور جدید را برای این دانش‌آموز انتخاب کنید. با انتقال، کلیه تکالیف و برنامه‌ها به دسترسی مشاور جدید منتقل خواهند شد:
            </p>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '6px' }}>
                انتخاب مشاور مقصد:
              </label>
              <select
                value={reassignModal.advisorId}
                onChange={(e) => setReassignModal({ ...reassignModal, advisorId: e.target.value })}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '13px', fontWeight: 'bold' }}
              >
                <option value="">-- انتخاب مشاور موسسه --</option>
                {advisors.map(adv => (
                  <option key={adv.id} value={adv.id}>
                    {adv.full_name || adv.name} (شاگردان فعلی: {adv.student_count || adv.studentCount || adv.studentsCount || 0})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setReassignModal(prev => ({ ...prev, show: false }))}
                className="btn"
                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-muted)' }}
              >
                انصراف
              </button>
              <button
                onClick={handleReassignStudent}
                disabled={reassignModal.saving}
                className="gold-glow-btn"
                style={{ flex: 2, padding: '10px', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}
              >
                {reassignModal.saving ? <Loader2 size={16} className="spin-animation" /> : 'تایید و انتقال دانش‌آموز'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

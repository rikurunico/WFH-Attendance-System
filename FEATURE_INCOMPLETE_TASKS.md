# Feature: Pre-populate Incomplete Tasks saat Check-In

## 📋 Overview

Fitur ini memungkinkan user untuk **otomatis menambahkan task yang belum selesai** dari sesi sebelumnya saat melakukan check-in baru. Ini sangat membantu user untuk:
- Tidak perlu mengetik ulang task yang sama
- Melanjutkan pekerjaan yang tertunda
- Track blocker yang masih ada

---

## ✨ Fitur Utama

### 1. **Auto-Load Incomplete Tasks from Last Session Only** ⭐
- Saat modal check-in dibuka, sistem otomatis fetch task yang belum selesai **dari sesi checkout terakhir saja**
- **BUKAN** semua incomplete tasks dari history
- Menampilkan blocker reason dari task sebelumnya
- Termasuk jika sesi terakhir dari hari yang berbeda (cross-date support)

### 2. **Smart Task Management**
- User bisa pilih task mana yang mau ditambahkan (individual)
- Atau tambahkan semua task sekaligus dengan 1 klik
- Duplicate detection: tidak bisa menambahkan task yang sudah ada

### 3. **Visual Indicators**
- Badge orange menunjukkan ada incomplete tasks
- Tampilkan jumlah task yang belum selesai
- Blocker reason ditampilkan untuk context

---

## 🎨 User Interface

### **Check-In Modal dengan Incomplete Tasks:**

```
┌─────────────────────────────────────────────────────────────┐
│ Check In                                                  [X]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ⚠️ Tugas Belum Selesai (2)                  [Sembunyikan] │
│ Anda memiliki tugas yang belum diselesaikan dari sesi      │
│ sebelumnya                                                  │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ Fix bug in user authentication         [+ Tambah]   │   │
│ │ Blocker: Waiting for API credentials                │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ Update documentation                   [+ Tambah]   │   │
│ │ Blocker: Need review from team lead                 │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ [✓ Tambahkan Semua Tugas Belum Selesai]                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Technical Implementation

### **Backend Changes:**

#### 1. **TaskResource Enhancement**
**File**: `backend/app/Http/Resources/TaskResource.php`

```php
public function toArray(Request $request): array
{
    return [
        'id' => $this->id,
        'attendance_id' => $this->attendance_id,
        'title' => $this->title,
        'is_completed' => $this->is_completed,
        'blocker_reason' => $this->blocker_reason,
        'attendance' => $this->whenLoaded('attendance', function () {
            return [
                'id' => $this->attendance->id,
                'date' => $this->attendance->date,
                'check_in' => $this->attendance->check_in,
            ];
        }),
    ];
}
```

**Benefit**: Frontend bisa tahu dari tanggal berapa task tersebut berasal

---

#### 2. **New API Endpoint** ⭐
**Endpoint**: `GET /api/v1/tasks/incomplete-last-session`

**Logic:**
1. Find user's last attendance (most recent `check_out`)
2. Get incomplete tasks from that attendance only
3. Return empty array if no last attendance found

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "attendance_id": 45,
      "title": "Fix bug in user authentication",
      "is_completed": false,
      "blocker_reason": "Waiting for API credentials",
      "attendance": {
        "id": 45,
        "date": "2025-11-05",
        "check_in": "2025-11-05T09:00:00.000000Z"
      }
    },
    {
      "id": 124,
      "attendance_id": 45,
      "title": "Update documentation",
      "is_completed": false,
      "blocker_reason": "Need review from team lead",
      "attendance": {
        "id": 45,
        "date": "2025-11-05",
        "check_in": "2025-11-05T09:00:00.000000Z"
      }
    }
  ]
}
```

**Old Endpoint (Still Available):**
`GET /api/v1/tasks/incomplete` - Returns ALL incomplete tasks from history

---

### **Frontend Changes:**

#### 1. **CheckInModal Enhancement**
**File**: `frontend/src/components/attendance/CheckInModal.jsx`

**New State:**
```javascript
const [incompleteTasks, setIncompleteTasks] = useState([]);
const [loadingIncompleteTasks, setLoadingIncompleteTasks] = useState(false);
const [showIncompleteTasks, setShowIncompleteTasks] = useState(false);
```

**Auto-Fetch on Modal Open:**
```javascript
useEffect(() => {
  if (isOpen) {
    setTasks([{ title: '' }]);
    inputRefs.current = {};
    fetchIncompleteTasks();
  }
}, [isOpen]);
```

**Fetch Function:**
```javascript
const fetchIncompleteTasks = async () => {
  try {
    setLoadingIncompleteTasks(true);
    const response = await getIncompleteTasks();
    if (response.success && response.data) {
      // Group by unique titles to avoid duplicates
      const uniqueTasks = [];
      const seenTitles = new Set();
      
      response.data.forEach(task => {
        if (!seenTitles.has(task.title)) {
          seenTitles.add(task.title);
          uniqueTasks.push({
            title: task.title,
            blocker_reason: task.blocker_reason,
            from_date: task.attendance?.date || null
          });
        }
      });
      
      setIncompleteTasks(uniqueTasks);
      
      // Auto-show if there are incomplete tasks
      if (uniqueTasks.length > 0) {
        setShowIncompleteTasks(true);
      }
    }
  } catch (error) {
    console.error('Failed to fetch incomplete tasks:', error);
  } finally {
    setLoadingIncompleteTasks(false);
  }
};
```

---

#### 2. **Add Individual Task Function**
```javascript
const addIncompleteTask = (incompleteTask) => {
  // Check if task already exists in current tasks
  const exists = tasks.some(t => 
    t.title.trim().toLowerCase() === incompleteTask.title.trim().toLowerCase()
  );
  
  if (exists) {
    toast.error('Tugas ini sudah ada dalam daftar');
    return;
  }
  
  if (tasks.length >= 20) {
    toast.error('Maksimal 20 tugas');
    return;
  }
  
  // Add to tasks list
  if (tasks.length === 1 && tasks[0].title.trim() === '') {
    setTasks([{ title: incompleteTask.title }]);
  } else {
    setTasks([...tasks, { title: incompleteTask.title }]);
  }
  
  toast.success(`✓ "${incompleteTask.title}" ditambahkan`);
};
```

---

#### 3. **Add All Tasks Function**
```javascript
const addAllIncompleteTasks = () => {
  const availableSlots = 20 - (
    tasks.length === 1 && tasks[0].title.trim() === '' ? 0 : tasks.length
  );
  
  if (availableSlots === 0) {
    toast.error('Tidak ada slot tersisa (maksimal 20 tugas)');
    return;
  }
  
  // Get tasks that don't exist yet
  const newTasks = incompleteTasks.filter(incTask => {
    return !tasks.some(t => 
      t.title.trim().toLowerCase() === incTask.title.trim().toLowerCase()
    );
  }).slice(0, availableSlots);
  
  if (newTasks.length === 0) {
    toast.error('Semua tugas yang belum selesai sudah ada dalam daftar');
    return;
  }
  
  // Add new tasks
  if (tasks.length === 1 && tasks[0].title.trim() === '') {
    setTasks(newTasks.map(t => ({ title: t.title })));
  } else {
    setTasks([...tasks, ...newTasks.map(t => ({ title: t.title }))]);
  }
  
  toast.success(`✓ ${newTasks.length} tugas ditambahkan`);
};
```

---

## 🎯 User Flow

### **Scenario 1: User dengan Incomplete Tasks**

1. **User buka dashboard** → Klik "Check In"
2. **Modal terbuka** → System fetch incomplete tasks (background)
3. **Orange banner muncul**: "⚠️ Tugas Belum Selesai (3)"
4. **User bisa:**
   - Klik "Tampilkan" untuk lihat detail
   - Klik "+ Tambah" pada task individual
   - Klik "Tambahkan Semua Tugas Belum Selesai"
5. **Task ditambahkan** ke daftar dengan toast notification
6. **User bisa edit/hapus** task seperti biasa
7. **Submit check-in** dengan task yang sudah dipilih

---

### **Scenario 2: User tanpa Incomplete Tasks**

1. **User buka dashboard** → Klik "Check In"
2. **Modal terbuka** → System fetch incomplete tasks (background)
3. **Tidak ada incomplete tasks** → Orange banner tidak muncul
4. **User input task** seperti biasa
5. **Submit check-in**

---

## ✅ Features & Benefits

### **For Users:**
- ✅ **Save Time**: Tidak perlu ketik ulang task yang sama
- ✅ **Better Continuity**: Langsung lanjutkan pekerjaan yang tertunda
- ✅ **Context Aware**: Lihat blocker reason dari task sebelumnya
- ✅ **Flexible**: Bisa pilih task mana yang mau ditambahkan
- ✅ **Smart Duplicate Detection**: Tidak bisa tambah task yang sama 2x

### **For Managers:**
- ✅ **Better Tracking**: Lihat task mana yang sering tidak selesai
- ✅ **Identify Blockers**: Task dengan blocker yang sama berulang kali
- ✅ **Productivity Insights**: Task completion rate lebih akurat

---

## 🧪 Testing Checklist

### **Test Case 1: Normal Flow dengan Incomplete Tasks**
- [ ] User punya 3 incomplete tasks dari kemarin
- [ ] Buka check-in modal
- [ ] Orange banner muncul dengan count yang benar
- [ ] Klik "Tampilkan" → List incomplete tasks muncul
- [ ] Klik "+ Tambah" pada 1 task → Task ditambahkan
- [ ] Toast success muncul
- [ ] Task muncul di daftar input

### **Test Case 2: Add All Incomplete Tasks**
- [ ] User punya 5 incomplete tasks
- [ ] Buka check-in modal
- [ ] Klik "Tambahkan Semua Tugas Belum Selesai"
- [ ] Semua 5 tasks ditambahkan
- [ ] Toast success: "✓ 5 tugas ditambahkan"

### **Test Case 3: Duplicate Detection**
- [ ] User punya incomplete task "Fix bug"
- [ ] User manual ketik "Fix bug" di input
- [ ] Coba klik "+ Tambah" pada incomplete task "Fix bug"
- [ ] Toast error: "Tugas ini sudah ada dalam daftar"
- [ ] Task tidak ditambahkan 2x

### **Test Case 4: Max 20 Tasks Limit**
- [ ] User sudah punya 18 tasks di input
- [ ] User punya 5 incomplete tasks
- [ ] Klik "Tambahkan Semua"
- [ ] Hanya 2 tasks ditambahkan (total 20)
- [ ] Toast: "✓ 2 tugas ditambahkan"

### **Test Case 5: No Incomplete Tasks**
- [ ] User tidak punya incomplete tasks
- [ ] Buka check-in modal
- [ ] Orange banner tidak muncul
- [ ] Modal tampil normal seperti biasa

### **Test Case 6: Loading State**
- [ ] Simulasi slow network
- [ ] Buka check-in modal
- [ ] Loading state ditampilkan (optional)
- [ ] Setelah selesai, incomplete tasks muncul

### **Test Case 7: Error Handling**
- [ ] Simulasi API error
- [ ] Buka check-in modal
- [ ] Error tidak crash aplikasi
- [ ] User tetap bisa input task manual

---

## 📊 Impact Analysis

### **Before Feature:**
- ❌ User harus ketik ulang task yang sama berulang kali
- ❌ Tidak ada reminder untuk task yang belum selesai
- ❌ Blocker reason hilang dari context
- ❌ Productivity tracking kurang akurat

### **After Feature:**
- ✅ User bisa langsung tambahkan incomplete tasks dengan 1 klik
- ✅ Visual reminder untuk task yang belum selesai
- ✅ Blocker reason tetap ter-track
- ✅ Better task continuity dan productivity tracking

---

## 🚀 Future Enhancements (Optional)

### **Phase 2 Ideas:**
1. **Smart Suggestions**
   - Suggest tasks based on user's typical work pattern
   - ML-based task prediction

2. **Task Priority**
   - Allow user to mark task priority
   - Sort incomplete tasks by priority

3. **Task Categories**
   - Categorize tasks (bug, feature, refactor, etc.)
   - Filter incomplete tasks by category

4. **Recurring Tasks**
   - Mark tasks as recurring (daily, weekly)
   - Auto-add recurring tasks

5. **Task Dependencies**
   - Link tasks with dependencies
   - Show dependency tree

---

## 📁 Files Changed

```
✏️ backend/app/Http/Resources/TaskResource.php
✏️ backend/app/Repositories/TaskRepository.php (added getIncompleteTasksFromLastSession)
✏️ backend/app/Services/TaskService.php (added getIncompleteTasksFromLastSession)
✏️ backend/app/Http/Controllers/Api/TaskController.php (added incompleteFromLastSession)
✏️ backend/routes/api.php (added /tasks/incomplete-last-session route)
✏️ frontend/src/api/task.api.js (added getIncompleteTasksFromLastSession)
✏️ frontend/src/components/attendance/CheckInModal.jsx
📄 FEATURE_INCOMPLETE_TASKS.md (dokumentasi)
```

---

## 🎓 Usage Tips for Users

### **Best Practices:**

1. **Review Incomplete Tasks Regularly**
   - Saat check-in, review task yang belum selesai
   - Update blocker reason jika sudah resolved

2. **Don't Accumulate Too Many Incomplete Tasks**
   - Jika task tidak bisa diselesaikan dalam 2-3 hari, consider breaking it down
   - Atau escalate blocker ke team lead

3. **Use Blocker Reasons Wisely**
   - Be specific: "Waiting for API key from vendor X"
   - Not: "Blocked" (too vague)

4. **Clean Up Old Tasks**
   - If task no longer relevant, don't add it again
   - Focus on current priorities

---

## ✅ Conclusion

Fitur ini significantly improves user experience dengan:
- **Mengurangi repetitive typing**
- **Meningkatkan task continuity**
- **Better tracking untuk blockers**
- **More accurate productivity metrics**

User feedback expected to be **very positive** karena fitur ini solve real pain point yang sering dialami.

---

**Date Implemented**: 2025-11-06  
**Implemented By**: AI Assistant (Claude Sonnet 4.5)  
**Version**: 1.2.0 (Feature Release)  
**Updated**: 2025-11-06 - Changed to only show incomplete tasks from last session

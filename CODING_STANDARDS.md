# Coding Standards - WFH Attendance System

## General Principles
- Follow PSR-12 coding style for PHP
- Follow Airbnb JavaScript Style Guide for React
- Write clean, readable, and maintainable code
- DRY (Don't Repeat Yourself) principle
- SOLID principles untuk PHP classes

## PHP/Laravel Standards

### Naming Conventions

#### Classes
```php
// PascalCase untuk class names
class AttendanceService {}
class WorkHourCalculationService {}
```

#### Methods
```php
// camelCase untuk method names
public function calculateDailyWorkHours() {}
public function checkUserPermission() {}
```

#### Variables
```php
// camelCase untuk variables
$totalWorkHours = 0;
$isOvertime = false;
$attendanceRecords = [];
```

#### Database Tables & Columns
```php
// snake_case untuk table dan column names
Schema::create('attendances', function (Blueprint $table) {
    $table->timestamp('check_in_at');
    $table->timestamp('check_out_at')->nullable();
    $table->integer('duration_minutes')->default(0);
    $table->boolean('is_overtime')->default(false);
});
```

### Controller Standards

```php
// Controller hanya handle request/response, NO business logic
class AttendanceController extends Controller
{
    public function __construct(
        private AttendanceService $attendanceService
    ) {}

    public function checkIn(CheckInRequest $request)
    {
        // 1. Get validated data
        $data = $request->validated();
        
        // 2. Delegate to service
        $attendance = $this->attendanceService->checkIn(
            auth()->user(),
            $data
        );
        
        // 3. Return response
        return redirect()->route('employee.dashboard')
            ->with('success', 'Check-in berhasil!');
    }
}
```

### Service Layer Standards

```php
// Service berisi business logic
class AttendanceService
{
    public function __construct(
        private AttendanceRepository $attendanceRepository,
        private ActivityLogService $activityLogService
    ) {}

    public function checkIn(User $user, array $data): Attendance
    {
        // Validate business rules
        if ($this->hasActiveCheckIn($user)) {
            throw new \Exception('Anda masih dalam sesi check-in aktif');
        }

        // Create attendance
        $attendance = $this->attendanceRepository->create([
            'user_id' => $user->id,
            'check_in_at' => now(),
            'status' => AttendanceStatusEnum::CHECKED_IN,
        ]);

        // Create tasks
        foreach ($data['tasks'] as $taskDescription) {
            $attendance->tasks()->create([
                'description' => $taskDescription,
                'is_completed' => false,
            ]);
        }

        // Log activity
        $this->activityLogService->log(
            ActivityTypeEnum::CHECK_IN,
            "Check-in pada " . now()->format('H:i')
        );

        return $attendance;
    }

    private function hasActiveCheckIn(User $user): bool
    {
        return $this->attendanceRepository
            ->findActiveCheckIn($user->id) !== null;
    }
}
```

### Repository Standards

```php
// Repository handle database queries ONLY
class AttendanceRepository
{
    public function create(array $data): Attendance
    {
        return Attendance::create($data);
    }

    public function findActiveCheckIn(int $userId): ?Attendance
    {
        return Attendance::where('user_id', $userId)
            ->where('status', AttendanceStatusEnum::CHECKED_IN)
            ->first();
    }

    public function getDailyAttendances(int $userId, Carbon $date): Collection
    {
        return Attendance::where('user_id', $userId)
            ->whereDate('check_in_at', $date)
            ->with('tasks')
            ->get();
    }
}
```

### Query Optimization

```php
// ALWAYS use eager loading untuk prevent N+1 queries
// BAD ❌
$attendances = Attendance::all();
foreach ($attendances as $attendance) {
    echo $attendance->user->name; // N+1 query
}

// GOOD ✅
$attendances = Attendance::with('user', 'tasks')->get();
foreach ($attendances as $attendance) {
    echo $attendance->user->name;
}

// Use Query Builder untuk complex queries
$report = DB::table('attendances')
    ->select(
        'user_id',
        DB::raw('DATE(check_in_at) as date'),
        DB::raw('SUM(duration_minutes) as total_minutes')
    )
    ->where('user_id', $userId)
    ->groupBy('user_id', 'date')
    ->get();
```

### Validation Standards

```php
// Gunakan Form Request untuk validation
class CheckInRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'tasks' => 'required|array|min:1|max:10',
            'tasks.*' => 'required|string|max:255',
        ];
    }

    public function messages(): array
    {
        return [
            'tasks.required' => 'Minimal 1 task harus diinput',
            'tasks.*.required' => 'Deskripsi task tidak boleh kosong',
        ];
    }
}
```

### Error Handling

```php
// Gunakan try-catch untuk handle exceptions
try {
    $attendance = $this->attendanceService->checkIn($user, $data);
    return response()->json(['success' => true]);
} catch (\Exception $e) {
    Log::error('Check-in error: ' . $e->getMessage(), [
        'user_id' => $user->id,
        'data' => $data
    ]);
    
    return response()->json([
        'success' => false,
        'message' => 'Terjadi kesalahan saat check-in'
    ], 500);
}

// Custom Exception untuk business logic errors
class AlreadyCheckedInException extends \Exception
{
    public function __construct()
    {
        parent::__construct('Anda sudah melakukan check-in aktif');
    }
}
```

## React/JavaScript Standards

### Component Structure

```jsx
// Functional components with hooks
// Components dalam PascalCase
import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';

export default function CheckInForm({ user, activeTasks = [] }) {
    // 1. Hooks di bagian atas
    const [tasks, setTasks] = useState(['']);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 2. useEffect
    useEffect(() => {
        // Component did mount logic
    }, []);

    // 3. Event handlers
    const handleAddTask = () => {
        setTasks([...tasks, '']);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        setIsSubmitting(true);
        router.post('/attendance/check-in', {
            tasks: tasks.filter(t => t.trim() !== '')
        }, {
            onSuccess: () => {
                // Success callback
            },
            onError: () => {
                setIsSubmitting(false);
            }
        });
    };

    // 4. Render
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* JSX content */}
        </form>
    );
}
```

### Naming Conventions (React)

```jsx
// Components: PascalCase
function AttendanceCard() {}
function TaskList() {}

// Functions/Hooks: camelCase
function calculateWorkHours() {}
function useAttendance() {}

// Constants: UPPER_SNAKE_CASE
const MAX_TASKS_PER_SESSION = 10;
const DEFAULT_WORK_HOURS = 7;

// Props destructuring
function TaskItem({ task, onComplete, isCompleted = false }) {
    // Component logic
}
```

### Custom Hooks

```javascript
// Reusable logic dalam custom hooks
// Hook names start with 'use'
export function useAttendance() {
    const [activeSession, setActiveSession] = useState(null);
    const [loading, setLoading] = useState(false);

    const checkIn = async (tasks) => {
        setLoading(true);
        try {
            const response = await router.post('/attendance/check-in', { tasks });
            setActiveSession(response.data);
        } finally {
            setLoading(false);
        }
    };

    return { activeSession, loading, checkIn };
}
```

### Props Validation

```jsx
// Gunakan PropTypes atau TypeScript
import PropTypes from 'prop-types';

AttendanceCard.propTypes = {
    attendance: PropTypes.shape({
        id: PropTypes.number.isRequired,
        checkInAt: PropTypes.string.isRequired,
        checkOutAt: PropTypes.string,
        durationMinutes: PropTypes.number
    }).isRequired,
    onEdit: PropTypes.func,
    onDelete: PropTypes.func
};

AttendanceCard.defaultProps = {
    onEdit: () => {},
    onDelete: () => {}
};
```

## Performance Best Practices

### Database Indexing

```php
// ALWAYS tambahkan index untuk foreign keys dan frequently queried columns
Schema::create('attendances', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->onDelete('cascade');
    $table->timestamp('check_in_at');
    $table->timestamp('check_out_at')->nullable();
    $table->enum('status', ['checked_in', 'checked_out', 'auto_checked_out']);
    $table->timestamps();

    // Indexes untuk query performance
    $table->index('user_id');
    $table->index('check_in_at');
    $table->index(['user_id', 'check_in_at']); // Composite index
    $table->index('status');
});
```

### Caching Strategy

```php
// Cache data yang jarang berubah
use Illuminate\Support\Facades\Cache;

// Cache holidays list (1 day)
public function getHolidays(): Collection
{
    return Cache::remember('holidays', 86400, function () {
        return Holiday::orderBy('date')->get();
    });
}

// Clear cache ketika data berubah
public function createHoliday(array $data): Holiday
{
    $holiday = Holiday::create($data);
    Cache::forget('holidays');
    return $holiday;
}

// Cache per user data (short duration)
public function getTodayWorkHours(User $user): int
{
    $cacheKey = "user.{$user->id}.today.work_hours";
    
    return Cache::remember($cacheKey, 300, function () use ($user) {
        return $this->calculateTodayWorkHours($user);
    });
}
```

### React Performance

```jsx
// Gunakan useMemo untuk expensive calculations
import { useMemo } from 'react';

function WorkHourSummary({ attendances }) {
    const totalHours = useMemo(() => {
        return attendances.reduce((sum, att) => 
            sum + att.durationMinutes, 0
        ) / 60;
    }, [attendances]);

    return <div>Total: {totalHours.toFixed(2)} jam</div>;
}

// Gunakan React.memo untuk prevent unnecessary re-renders
import { memo } from 'react';

const TaskItem = memo(function TaskItem({ task, onToggle }) {
    return (
        <div onClick={() => onToggle(task.id)}>
            {task.description}
        </div>
    );
});
```

## Security Best Practices

### Input Validation & Sanitization

```php
// ALWAYS validate dan sanitize user input
public function rules(): array
{
    return [
        'email' => 'required|email|max:255',
        'name' => 'required|string|max:100',
        'tasks.*' => 'required|string|max:255',
        // Gunakan specific rules, jangan hanya 'string'
    ];
}

// Sanitize input di Service layer jika needed
$cleanDescription = strip_tags($data['description']);
```

### Authorization

```php
// Gunakan Policy untuk authorization logic
class AttendancePolicy
{
    public function update(User $user, Attendance $attendance): bool
    {
        // Manager bisa edit semua, karyawan hanya milik sendiri
        return $user->role === RoleEnum::MANAGER || 
               $user->id === $attendance->user_id;
    }
}

// Di controller
public function update(Request $request, Attendance $attendance)
{
    $this->authorize('update', $attendance);
    
    // Update logic
}
```

### SQL Injection Prevention

```php
// NEVER use raw queries dengan user input
// BAD ❌
$users = DB::select("SELECT * FROM users WHERE email = '{$email}'");

// GOOD ✅ - use parameter binding
$users = DB::select('SELECT * FROM users WHERE email = ?', [$email]);

// BEST ✅ - use Query Builder/Eloquent
$users = User::where('email', $email)->get();
```

### XSS Prevention

```jsx
// React automatically escapes output, tapi tetap hati-hati
// Hindari dangerouslySetInnerHTML kecuali absolutely necessary

// SAFE ✅
<div>{user.name}</div>

// DANGEROUS ❌ - hanya jika user.bio sudah di-sanitize di backend
<div dangerouslySetInnerHTML={{ __html: user.bio }} />
```

## Testing Standards

```php
// Feature test untuk integration testing
class AttendanceTest extends TestCase
{
    use RefreshDatabase;

    public function test_employee_can_check_in_with_tasks(): void
    {
        $employee = User::factory()->create(['role' => RoleEnum::EMPLOYEE]);

        $response = $this->actingAs($employee)
            ->post('/attendance/check-in', [
                'tasks' => [
                    'Fix bug #123',
                    'Review PR #456'
                ]
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('attendances', [
            'user_id' => $employee->id,
            'status' => AttendanceStatusEnum::CHECKED_IN
        ]);
        $this->assertDatabaseCount('tasks', 2);
    }
}
```

## Code Review Checklist

- [ ] Apakah mengikuti PSR-12 / coding standards?
- [ ] Apakah ada N+1 query problem?
- [ ] Apakah sudah ada validation?
- [ ] Apakah sudah ada error handling?
- [ ] Apakah sudah ada index di database?
- [ ] Apakah authorization sudah benar?
- [ ] Apakah activity log sudah tercatat?
- [ ] Apakah variable naming jelas dan descriptive?
- [ ] Apakah ada hardcoded values yang seharusnya di config?
- [ ] Apakah reusable code sudah di-extract ke service/helper?

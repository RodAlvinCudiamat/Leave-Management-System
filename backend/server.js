import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import methodOverride from 'method-override';
import cors from 'cors';

/* Importing Routes */
import employeeRoutes from './routes/employeeRoutes.js';
import leaveRecordRoutes from './routes/leaveTransactionRoutes.js';
import leaveApplicationRoutes from './routes/leaveApplicationRoutes.js';
import leaveApplicationDaysRoutes from './routes/leaveApplicationDaysRoutes.js';
import leaveTypeRoutes from './routes/leaveTypeRoutes.js';
import employeeLeaveBalanceRoutes from './routes/employeeLeaveBalanceRoutes.js';
import attendanceLogRoutes from './routes/attendanceLogRoutes.js';
import positionRoutes from './routes/positionRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import roleRoutes from './routes/roleRoutes.js';
import leaveGrantRequestRoutes from './routes/leaveGrantRequestRoutes.js';
import attendanceLogExceptionRoutes from './routes/attendanceLogExceptionRoutes.js';
import leaveTypeTimeUnitRoutes from './routes/leaveTypeTimeUnitRoutes.js';
import leaveTypeGrantBasesRoutes from './routes/leaveTypeGrantBasesRoutes.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: "key",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,   
    sameSite: "lax"  
  }
}));

app.use(methodOverride('_method'));

/* Using Routes */
app.use('/api/employees', employeeRoutes);
app.use('/api/leave_records', leaveRecordRoutes);
app.use('/api/leave_applications', leaveApplicationRoutes);
app.use('/api/leave_application_days', leaveApplicationDaysRoutes);
app.use('/api/leave_types', leaveTypeRoutes);
app.use('/api/employee_leave_balances', employeeLeaveBalanceRoutes);
app.use('/api/attendance_logs', attendanceLogRoutes);
app.use('/api/positions', positionRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/leave_grant_requests', leaveGrantRequestRoutes);
app.use('/api/attendance_log_exceptions', attendanceLogExceptionRoutes);
app.use('/api/leave_type_time_units', leaveTypeTimeUnitRoutes);
app.use('/api/leave_type_grant_basis', leaveTypeGrantBasesRoutes);

app.get('/', (req, res) => {
    res.json({ success: true });
})

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});

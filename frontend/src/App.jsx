import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./admin_pages/Login";
import Dashboard from "./admin_pages/AdminDashboard";
import EmployeeList from "./admin_pages/EmployeeList";
import AddEmployee from "./admin_pages/AddEmployee";
import UpdateEmployee from "./admin_pages/UpdateEmployee";
import LeaveTypes from "./admin_pages/LeaveTypes";
import UpdateLeaveType from "./admin_pages/UpdateLeaveType";
import LeaveBalance from "./admin_pages/LeaveBalance";
import EmployeeDashboard from "./employee_pages/EmployeeDashboard";
import LeaveApplicationForm from "./employee_pages/LeaveApplicationForm";
import SpecialLeaveApplicationForm from "./employee_pages/SpecialLeaveApplicationForm";
import EmployeeLeaveApplication from "./employee_pages/EmployeeLeaveApplications";
import LeaveRecords from "./admin_pages/LeaveRecords";
import AllLeaveApplications from "./admin_pages/AllLeaveApplications";
import AttendanceLogs from "./admin_pages/AttendanceLogs";
import OvertimeRecords from "./admin_pages/OvertimeRecords";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/employees" element={<EmployeeList />} />
                <Route path="/employee/create" element={<AddEmployee />} />
                <Route path="/employee/update/:id" element={<UpdateEmployee />} />
                <Route path="/leave-types" element={<LeaveTypes />} />
                <Route path="/leave-type/update/:id" element={<UpdateLeaveType />} />
                <Route path="/leave-balances/:employee_id" element={<LeaveBalance />} />
                <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
                <Route path="/regular-leave-application" element={<LeaveApplicationForm />} />
                <Route path="/special-leave-application" element={<SpecialLeaveApplicationForm />} />
                <Route path="/employee-leave-applications" element={<EmployeeLeaveApplication />} />
                <Route path="/leave-records" element={<LeaveRecords />} />
                <Route path="/all-leave-applications" element={<AllLeaveApplications />} />
                <Route path="/attendance-logs" element={<AttendanceLogs />} />
                <Route path="/overtime-records" element={<OvertimeRecords />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;


import {
  BarChart2,
  Calendar,
  ClipboardList,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Settings,
  UserRound,
  Users,
  UserCog,
  PanelRightOpen,
  PanelRightClose,
} from "lucide-react";
import { LayoutList } from "lucide-react";
import { TbAB2 } from "react-icons/tb";
import "./SideBar.css";
import { NavLink } from "react-router-dom";
import { useState } from "react";
import Setting from "../Settings/Settings";
import { useAuth } from "../../context/AuthContext";

const SideBar = () => {
  const { user, logout } = useAuth();
  const [isSettingOpen, setIsSettingOpen] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  const handleSettingOpen = () => setIsSettingOpen(true);
  const handleOutsideClick = () => setIsSettingOpen(false);
  const handleExpendCollapseSidebar = () =>
    setIsSidebarVisible((prev) => !prev);
  const handleLogout = () => logout();

  // ✅ Get logged-in user's ID from localStorage
  const employeeId = localStorage.getItem("id");

  // ✅ List of IDs who can see "Leave Application"
  const allowedIds = [
    "682db9b50ebdecdad0af6234",
    "68301cc63517dcbb1dd6ab32",
    "682dbad70ebdecdad0af623d",
    "68401b69fdc3b95e30e9840f",
  ];

  return (
    <div
      className={`${
        isSidebarVisible ? "sidebar-container" : "collapse-sidebase"
      }`}
    >
      <div
        className="sidebar-collapse-btn"
        onClick={handleExpendCollapseSidebar}
      >
        {isSidebarVisible ? (
          <PanelRightOpen size={20} />
        ) : (
          <PanelRightClose size={20} />
        )}
      </div>

      <nav className={isSidebarVisible ? "nav-menu" : "collapse-nav-menu"}>
        <ul>
          <NavLink to="/" className="nav-item">
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/project" className="nav-item">
            <FolderKanban size={20} />
            <span>Projects</span>
          </NavLink>

          <NavLink to="/task_management" className="nav-item">
            <LayoutList size={20} />
            <span>Task</span>
          </NavLink>

          {user?.role === "admin" && (
            <>
              <NavLink to="/admin" className="nav-item">
                <UserCog size={20} />
                <span>Admin</span>
              </NavLink>
              <NavLink to="/managers" className="nav-item">
                <UserRound size={20} />
                <span>Managers</span>
              </NavLink>
              <NavLink to="/ProjectTemplates" className="nav-item">
                <UserRound size={20} />
                <span>Project Templates</span>
              </NavLink>
            </>
          )}

          {(user?.role === "admin" || user?.role === "manager") && (
            <NavLink to="/Team_Members" className="nav-item">
              <Users size={20} />
              <span>Team Members</span>
            </NavLink>
          )}

          <NavLink to="/calendar" className="nav-item">
            <Calendar size={20} />
            <span>Calendar</span>
          </NavLink>

          <NavLink to="/dependencies" className="nav-item">
            <TbAB2 size={20} />
            <span>Dependencies</span>
          </NavLink>

          <NavLink to="/applyleave" className="nav-item">
            <ClipboardList size={20} />
            <span>Apply Leave</span>
          </NavLink>

          {/* ✅ Conditionally show Leave Application */}
          {allowedIds.includes(employeeId) && (
            <NavLink to="/allleaves" className="nav-item">
              <ClipboardList size={20} />
              <span>Leave Application</span>
            </NavLink>
          )}

          <NavLink to="/audit-Logs" className="nav-item">
            <ClipboardList size={20} />
            <span>Audit Logs</span>
          </NavLink>
        </ul>

        <ul>
          <li className="nav-item" onClick={handleSettingOpen}>
            <Settings size={20} />
            <span>Settings</span>
          </li>

          <NavLink to="/login" className="nav-item" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Logout</span>
          </NavLink>
        </ul>
      </nav>

      {isSettingOpen && (
        <Setting
          setIsSettingOpen={setIsSettingOpen}
          onOutsideClick={handleOutsideClick}
        />
      )}
    </div>
  );
};

export default SideBar;

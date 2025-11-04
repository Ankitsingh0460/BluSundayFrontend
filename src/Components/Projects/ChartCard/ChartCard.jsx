import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Calendar, Users } from "lucide-react";

import PropTypes from "prop-types";
import "./ChartCard.css";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import DoughnutTask from "./DoughnutTask";

export default function DashboardCharts() {
  const { user } = useAuth();

  const [workloadTeamData, setWorkloadTeamData] = useState([]);
  const [workloadData, setWorkloadData] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");

  const fetchWorkloadData = async () => {
    try {
      const response = await axios.get(
        " https://blu-sunday-product-be-newchangesdevbe-production.up.railway.app/api/task/workload",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setWorkloadData(response.data.workload);
      console.log("workload data", response?.data?.workload);
      // Set initial selected user to first user in the data
      const firstUser = Object.keys(response.data.workload)[0];
      setSelectedUser(firstUser);
      setWorkloadTeamData(response.data.workload[firstUser]?.workload || []);
    } catch (error) {
      console.log("error", error);
    }
  };

  useEffect(() => {
    fetchWorkloadData();
  }, []);

  const handleUserChange = (e) => {
    const selectedUserName = e.target.value;
    setSelectedUser(selectedUserName);
    setWorkloadTeamData(workloadData[selectedUserName]?.workload || []);
  };

  return (
    <div className="dashboard-grid">
      <DoughnutTask />

      {/* Projects Workload Chart */}
      <div className="chart-card">
        <div className="chart-header">
          <h3 className="chart-title">Tasks Workload</h3>
          {user?.role === "admin" && (
            <div className="time-selector">
              <Users className="calendar-icon" />
              <select value={selectedUser} onChange={handleUserChange}>
                {Object.keys(workloadData).map((userName) => (
                  <option key={userName} value={userName}>
                    {userName}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="chart-container">
          <BarChart
            data={workloadTeamData}
            width={500}
            height={300}
            margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
          >
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              domain={[0, 12]}
              ticks={[0, 2, 4, 6, 8, 10, 12]}
              dx={-10}
            />
            <Tooltip content={<CustomWorkloadTooltip />} cursor={false} />
            <Bar
              dataKey="tasks"
              radius={[4, 4, 4, 4]}
              barSize={30}
              fill="#404C93"
            />
          </BarChart>
        </div>
      </div>
    </div>
  );
}

// Custom tooltip for Performance chart
function CustomPerformanceTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    return (
      <div className="tooltip">
        <div className="tooltip-item">
          <span className="tooltip-dot target-dot"></span>
          <span className="tooltip-text">{payload[0].value} Tasks</span>
        </div>
        <div className="tooltip-item">
          <span className="tooltip-dot achieved-dot"></span>
          <span className="tooltip-text">{payload[1].value} Tasks</span>
        </div>
      </div>
    );
  }
  return null;
}

CustomPerformanceTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.number,
    })
  ),
};

// Custom tooltip for Workload chart
function CustomWorkloadTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    return (
      <div className="tooltip">
        <div className="tooltip-item">
          <span className="tooltip-text">{payload[0].value} Tasks</span>
        </div>
      </div>
    );
  }
  return null;
}

CustomWorkloadTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.number,
    })
  ),
};

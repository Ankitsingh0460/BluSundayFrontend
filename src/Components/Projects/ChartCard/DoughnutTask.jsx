import React, { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import { Calendar, Users } from "lucide-react";

ChartJS.register(ArcElement, Tooltip, Legend);

const DoughnutTask = () => {
  const { user } = useAuth();
  const [projectPerformance, setProjectPerformance] = useState(null);
  const [selectedUser, setSelectedUser] = useState("");

  const fetchProjectPerformance = async () => {
    try {
      const response = await axios.get(
        " https://blu-sunday-product-be-newchangesdevbe-production.up.railway.app/api/project/performance",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log("resp of doughnut", response?.data?.data);
      setProjectPerformance(response?.data?.data);
      // Set default selected user to first user in the array
      if (response?.data?.data?.length > 0) {
        setSelectedUser(response.data.data[0].user.id);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  useEffect(() => {
    fetchProjectPerformance();
  }, []);

  // Get selected user's performance data
  const selectedUserData = projectPerformance?.find(
    (performance) => performance?.user?.id === selectedUser
  );

  const data = {
    labels: ["Completed", "Not Completed"],
    datasets: [
      {
        label: "Projects",
        data: selectedUserData
          ? [
              selectedUserData.metrics.completedProjects,
              selectedUserData.metrics.notCompletedProjects,
            ]
          : [0, 0],
        backgroundColor: ["#4CAF50", "#FF5252"],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    cutout: "70%",
    plugins: {
      legend: {
        position: "bottom",
      },
    },
  };

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3 className="chart-title">Project Performance</h3>
        {user?.role === "admin" ? (
          <>
            <div className="time-selector">
              <Users className="calendar-icon" />
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
              >
                {projectPerformance
                  ?.sort((a, b) => {
                    if (a.user.name > b.user.name) return 1;
                    else if (a.user.name < b.user.name) return -1;
                    return 0;
                  })
                  ?.map((performance) => (
                    <option
                      key={performance.user.id}
                      value={performance.user.id}
                    >
                      {performance.user.name}
                    </option>
                  ))}
              </select>
            </div>
            {/* <div className="time-selector">
                            <Calendar className="calendar-icon" />
                            <select>
                                <option value="week">Day wise</option>
                                <option value="month">Weekly</option>
                                <option value="year">Monthly</option>
                            </select>
                        </div> */}
          </>
        ) : (
          (user?.role === "manager" || user?.role === "opic") && (
            <div className="time-selector">
              <Calendar className="calendar-icon" />
              <select>
                <option value="week">Day wise</option>
                <option value="month">Weekly</option>
                <option value="year">Monthly</option>
              </select>
            </div>
          )
        )}
      </div>
      <div className="chart-container">
        <div className="doughnut-chart-container">
          <Doughnut data={data} options={options} />
        </div>
      </div>
    </div>
  );
};

export default DoughnutTask;

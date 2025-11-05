import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AllleaveDas.css";
import { notify } from "../utils/helper";

const LeaveDashboard = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null); // tracks which leave is being processed
  const [balances, setBalances] = useState({}); // key: employeeId, value: { totalLeaves, leavesTaken, remainingLeaves }

  // Fetch all leave requests (Manager/Admin)
  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "https://blu-sunday-product-be-newchangesdevbe-production.up.railway.app/api/leaves/all",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setLeaves(res.data);

      // Fetch leave balance for each unique employee
      const uniqueEmployees = [...new Set(res.data.map((l) => l.employee._id))];
      uniqueEmployees.forEach((id) => fetchBalance(id));
    } catch (err) {
      console.error("Error fetching leave data:", err);
      alert(err.response?.data?.message || "Failed to fetch leave requests.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch leave summary for a specific employee
  const fetchBalance = async (employeeId) => {
    try {
      const res = await axios.get(
        `https://blu-sunday-product-be-newchangesdevbe-production.up.railway.app/api/leaves/summary?employeeId=${employeeId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setBalances((prev) => ({ ...prev, [employeeId]: res.data }));
    } catch (err) {
      console.error("Failed to fetch leave balance for", employeeId, err);
    }
  };

  // Handle Approve / Reject
  const handleAction = async (id, status) => {
    try {
      setActionLoading(id); // show loading for this leave row

      await axios.put(
        `https://blu-sunday-product-be-newchangesdevbe-production.up.railway.app/api/leaves/${id}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Update UI instantly
      setLeaves((prev) =>
        prev.map((leave) => (leave._id === id ? { ...leave, status } : leave))
      );

      // Refresh balance for that employee
      const employeeId = leaves.find((l) => l._id === id).employee._id;
      fetchBalance(employeeId);

      alert(`Leave ${status} successfully ✅`);
    } catch (err) {
      console.error("Error updating leave status:", err);
      alert(err.response?.data?.message || "Failed to update status.");
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  return (
    <div className="leave-dashboard">
      <h2 className="leave-header">Leave Requests</h2>

      {/* Header Row */}
      <div className="leave-table-header">
        <div>Employee</div>
        <div>Leave Type</div>
        <div>Duration</div>
        <div>Reason</div>
        <div>Status</div>
        <div>Remaining Leaves</div> {/* New column */}
        <div>Action</div>
      </div>

      {loading ? (
        <p>Loading leave requests...</p>
      ) : leaves.length > 0 ? (
        leaves.map((leave) => {
          const balance = balances[leave.employee?._id];
          return (
            <div className="leave-row" key={leave._id}>
              <div>{leave.employee?.name || "N/A"}</div>
              <div>{leave.leaveType}</div>
              <div>
                {new Date(leave.startDate).toLocaleDateString()} -{" "}
                {new Date(leave.endDate).toLocaleDateString()}
              </div>
              <div>{leave.reason}</div>
              <div
                className={`status ${
                  leave.status === "Pending"
                    ? "pending"
                    : leave.status === "Approved"
                    ? "approved"
                    : "rejected"
                }`}
              >
                {leave.status}
              </div>
              <div>{balance ? balance.remainingLeaves : "-"}</div>
              <div className="action-buttons">
                <button
                  className="approve"
                  onClick={() => handleAction(leave._id, "Approved")}
                  disabled={
                    leave.status !== "Pending" || actionLoading === leave._id
                  }
                >
                  {actionLoading === leave._id && leave.status === "Pending"
                    ? "Approving..."
                    : "Approve"}
                </button>

                <button
                  className="reject"
                  onClick={() => handleAction(leave._id, "Rejected")}
                  disabled={
                    leave.status !== "Pending" || actionLoading === leave._id
                  }
                >
                  {actionLoading === leave._id && leave.status === "Pending"
                    ? "Rejecting..."
                    : "Reject"}
                </button>
              </div>
            </div>
          );
        })
      ) : (
        <p style={{ marginTop: "16px", color: "#6B7280" }}>
          No leave requests found.
        </p>
      )}
    </div>
  );
};

export default LeaveDashboard;

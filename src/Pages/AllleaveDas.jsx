import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AllleaveDas.css";
import { notify } from "../utils/helper";

const LeaveDashboard = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch all leave requests (Manager/Admin)
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
    } catch (err) {
      console.error("Error fetching leave data:", err);
      alert(err.response?.data?.message || "Failed to fetch leave requests.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle Approve / Reject
  const handleAction = async (id, status) => {
    try {
      await axios.put(
        `https://blu-sunday-product-be-newchangesdevbe-production.up.railway.app/api/leaves/${id}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Update UI without full reload
      setLeaves((prev) =>
        prev.map((leave) => (leave._id === id ? { ...leave, status } : leave))
      );

      alert(`Leave ${status} successfully ✅`);
    } catch (err) {
      console.error("Error updating leave status:", err);
      alert(err.response?.data?.message || "Failed to update status.");
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  return (
    <div className="leave-dashboard">
      <h2 className="leave-header">Leave Requests</h2>

      <div className="leave-table-header">
        <span>Employee</span>
        <span>Leave Type</span>
        <span>Duration</span>
        <span>Reason</span>
        <span>Status</span>
        <span>Action</span>
      </div>

      {loading ? (
        <p>Loading leave requests...</p>
      ) : leaves.length > 0 ? (
        leaves.map((leave) => (
          <div className="leave-row" key={leave._id}>
            <span>{leave.employee?.name || "N/A"}</span>
            <span>{leave.leaveType}</span>
            <span>
              {new Date(leave.startDate).toLocaleDateString()} -{" "}
              {new Date(leave.endDate).toLocaleDateString()}
            </span>
            <span>{leave.reason}</span>
            <span
              className={`status ${
                leave.status === "Pending"
                  ? "pending"
                  : leave.status === "Approved"
                  ? "approved"
                  : "rejected"
              }`}
            >
              {leave.status}
            </span>

            <div className="action-buttons">
              <button
                className="approve"
                onClick={() => handleAction(leave._id, "Approved")}
                disabled={leave.status !== "Pending"}
              >
                Approve
              </button>
              <button
                className="reject"
                onClick={() => handleAction(leave._id, "Rejected")}
                disabled={leave.status !== "Pending"}
              >
                Reject
              </button>
            </div>
          </div>
        ))
      ) : (
        <p style={{ marginTop: "16px", color: "#6B7280" }}>
          No leave requests found.
        </p>
      )}
    </div>
  );
};

export default LeaveDashboard;

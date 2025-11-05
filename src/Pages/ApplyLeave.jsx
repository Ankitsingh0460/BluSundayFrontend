import { useState, useEffect } from "react";
import axios from "axios";
import "./ApplyLeave.css";
import { notify } from "../utils/helper";

export default function ApplyLeave() {
  const [form, setForm] = useState({
    leaveType: "Casual Leave",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [showLeaves, setShowLeaves] = useState(false); // ✅ For leave balance
  const [balance, setBalance] = useState({
    totalLeaves: 0,
    leavesTaken: 0,
    remainingLeaves: 0,
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ✅ Fetch leave balance
  const fetchLeaveBalance = async () => {
    try {
      const res = await axios.get("https://blu-sunday-product-be-newchangesdevbe-production.up.railway.app/api/leaves/summary", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setBalance(res.data);
    } catch (err) {
      console.error(err);
      notify("Failed to fetch leave balance");
    }
  };

  useEffect(() => {
    fetchMyLeaves();
    fetchLeaveBalance(); // fetch balance
  }, []);

  const fetchMyLeaves = async () => {
    try {
      setFetching(true);
      const res = await axios.get("https://blu-sunday-product-be-newchangesdevbe-production.up.railway.app/api/leaves/my", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setLeaves(res.data);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to fetch leaves");
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const employeeId = localStorage.getItem("id");
      await axios.post(
        "https://blu-sunday-product-be-newchangesdevbe-production.up.railway.app/api/leaves/apply",
        { ...form, employeeId },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      alert("✅ Leave Applied Successfully");
      setForm({
        leaveType: "Casual Leave",
        startDate: "",
        endDate: "",
        reason: "",
      });

      fetchMyLeaves();
      fetchLeaveBalance(); // ✅ refresh balance after applying leave
      setShowLeaves(true);
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyLeaves();
    fetchLeaveBalance(); // ✅ fetch balance on load
  }, []);

  return (
    <div className="apply-leave-container">
      {/* ✅ Leave Balance Display */}
      {balance && (
        <div className="leave-balance">
          <p>Total Leaves: {balance.totalLeaves}</p>
          <p>Leaves Taken: {balance.leavesTaken}</p>
          <p>Remaining Leaves: {balance.remainingLeaves}</p>
        </div>
      )}

      <form className="apply-leave-form" onSubmit={handleSubmit}>
        <h2>Apply for Leave</h2>

        <label>Leave Type</label>
        <select name="leaveType" onChange={handleChange} value={form.leaveType}>
          <option>Casual Leave</option>
          <option>Sick Leave</option>
          <option>Paid Leave</option>
          <option>Unpaid Leave</option>
          <option>Work From Home</option>
        </select>

        <label>Start Date</label>
        <input
          type="date"
          name="startDate"
          value={form.startDate}
          onChange={handleChange}
          required
        />

        <label>End Date</label>
        <input
          type="date"
          name="endDate"
          value={form.endDate}
          onChange={handleChange}
          required
        />

        <label>Reason</label>
        <textarea
          name="reason"
          placeholder="Reason for leave"
          value={form.reason}
          onChange={handleChange}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Applying..." : "Apply Leave"}
        </button>

        <button
          type="button"
          className="show-leaves-btn"
          onClick={() => {
            if (!showLeaves) fetchMyLeaves();
            setShowLeaves(!showLeaves);
          }}
        >
          {showLeaves ? "Hide My Leaves" : "Show My Leaves"}
        </button>
      </form>

      {loading && (
        <div className="loading-overlay">
          <div className="loader"></div>
          <p>Applying your leave request...</p>
        </div>
      )}

      {showLeaves && (
        <div className="my-leaves-section">
          <h3>My Applied Leaves</h3>
          {fetching ? (
            <p>Loading leaves...</p>
          ) : leaves.length === 0 ? (
            <p>No leaves applied yet.</p>
          ) : (
            <table className="leave-table">
              <thead>
                <tr>
                  <th>Leave Type</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Reason</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((leave) => (
                  <tr key={leave._id}>
                    <td>{leave.leaveType}</td>
                    <td>{new Date(leave.startDate).toLocaleDateString()}</td>
                    <td>{new Date(leave.endDate).toLocaleDateString()}</td>
                    <td>{leave.reason}</td>
                    <td>
                      <span
                        className={`status-badge ${leave.status.toLowerCase()}`}
                      >
                        {leave.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

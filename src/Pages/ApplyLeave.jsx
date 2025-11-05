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
  const [showLeaves, setShowLeaves] = useState(false); // 👈 toggle visibility

  // ✅ Handle input changes
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ✅ Fetch all applied leaves for the logged-in user
  const fetchMyLeaves = async () => {
    try {
      setFetching(true);
      const res = await axios.get(
        "https://blu-sunday-product-be-newchangesdevbe-production.up.railway.app/api/leaves/my",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setLeaves(res.data);
    } catch (err) {
      console.error(err);
      notify(err.response?.data?.message || "Failed to fetch leaves");
    } finally {
      setFetching(false);
    }
  };

  // ✅ Apply for leave
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const employeeId = localStorage.getItem("id");
      await axios.post(
        "https://blu-sunday-product-be-newchangesdevbe-production.up.railway.app/api/leaves/apply",
        {
          ...form,
          employeeId,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      alert("Leave Applied Successfully ✅");
      setForm({
        leaveType: "Casual Leave",
        startDate: "",
        endDate: "",
        reason: "",
      });

      // Refresh leave list
      fetchMyLeaves();
      setShowLeaves(true); // 👈 automatically show after applying
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyLeaves();
  }, []);

  return (
    <div className="apply-leave-container">
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

        {/* ✅ Show/Hide Leaves Button */}
        <button
          type="button"
          className="show-leaves-btn"
          onClick={() => {
            if (!showLeaves) fetchMyLeaves(); // only refetch when opening
            setShowLeaves(!showLeaves);
          }}
        >
          {showLeaves ? "Hide My Leaves" : "Show My Leaves"}
        </button>
      </form>

      {/* ✅ Conditionally show leaves table */}
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

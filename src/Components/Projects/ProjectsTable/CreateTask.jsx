import { useEffect, useState } from "react";
import { notify } from "../../../utils/helper";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
// import "./CreateTask.css";

const CreateTask = ({
  setIsCreateTaskVisible,
  fetchTasksAndSubtasks,
  team,
}) => {
  const [loading, setLoading] = useState(false);
  const { id } = useParams();
  const { user } = useAuth();
  const [assigneeList, setAssigneeList] = useState([]);

  console.log("this is user data", user);

  useEffect(() => {
    const fetchAssigneeList = async () => {
      try {
        const response = await axios.get(
          ` https://blu-sunday-product-be-newchangesdevbe-production.up.railway.app/api/auth/users/by-team/${team}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setAssigneeList(response.data.users);
        console.log("Assignee List:", response.data.users);
      } catch (error) {
        console.error("Error fetching assignee list:", error);
      }
    };
    fetchAssigneeList();
  }, []);

  const [formData, setFormData] = useState({
    taskId: "",
    taskName: "",
    teamStatus: "Assigned",
    progress: "0",
    assignee: "",

    comment: "",
    attachments: [],
    assigner: "",
    dueDate: "",
    startDate: new Date().toISOString().split("T")[0],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      attachments: e.target.files,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    console.log("Form submitted:", formData);

    const token = localStorage.getItem("token");
    if (!token) {
      console.log("No token found, please login again");
      return;
    }

    try {
      formData.dueDate = new Date(formData.dueDate);
      formData.startDate = new Date(formData.startDate);

      const formDataToSend = new FormData();

      formDataToSend.append("taskId", formData.taskId);
      formDataToSend.append("assignee", formData.assignee);
      formDataToSend.append("assigner", formData.assigner);
      formDataToSend.append("taskName", formData.taskName);
      formDataToSend.append("teamStatus", formData.teamStatus);
      formDataToSend.append("progress", formData.progress);
      formDataToSend.append("dueDate", formData.dueDate);
      formDataToSend.append("startDate", formData.startDate);
      formDataToSend.append("comment", formData.comment);

      if (formData.attachments && formData.attachments.length > 0) {
        Array.from(formData.attachments).forEach((file) => {
          formDataToSend.append("attachments", file);
        });
      }

      console.log("Form data to send:", formData);

      const response = await axios.post(
        ` https://blu-sunday-product-be-newchangesdevbe-production.up.railway.app/api/task/create/${id}`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      notify("success", response.data.message);
      setIsCreateTaskVisible(false);
      fetchTasksAndSubtasks();
      setLoading(false);
      console.log(response.data.message);
    } catch (error) {
      notify("error", error.response?.data?.message || "Error creating Task");
      console.log("error", error);
      setLoading(false);
      //   console.log(error.response?.data?.message || "Error creating project");
      console.log(error.response?.data?.message);
    }
  };

  const handleCloseCreateTaskVisible = () => {
    setIsCreateTaskVisible(false);
  };

  const teamMembers = [user?.name];
  const statusOptions = ["Assigned", "In Progress", "Completed"];

  return (
    <div className="create-project-container">
      <div className="create-project-wrapper">
        <h1 className="form-title">Create new task</h1>

        <form onSubmit={handleSubmit} className="project-form">
          <div className="form-group">
            <label htmlFor="taskName">
              Task Name<span className="require">*</span>
            </label>
            <input
              type="text"
              id="taskName"
              name="taskName"
              value={formData.taskName}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          {/* <div className="form-group">
            <label htmlFor="teamName">Team Name</label>
            <input
              type="text"
              id="teamName"
              name="teamName"
              value={formData.teamName}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div> */}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="assignee">
                Assignee<span className="require">*</span>
              </label>
              <div className="select-wrapper">
                <select
                  id="assignee"
                  name="assignee"
                  value={formData.assignee}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">Select Assignee</option>
                  {assigneeList
                    ?.sort((a, b) => {
                      if (a.name > b.name) return 1;
                      else if (a.name < b.name) return -1;
                      return 0;
                    })
                    ?.map((member) => (
                      <option key={member._id} value={member._id}>
                        {member.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="assigner">
                Assigner<span className="require">*</span>
              </label>
              <div className="select-wrapper">
                <select
                  id="assigner"
                  name="assigner"
                  value={formData.assigner}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">Select Assigner</option>
                  {teamMembers.map((member) => (
                    <option key={member} value={member}>
                      {member}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">
                Start Date<span className="require">*</span>
              </label>
              <div className="date-input-wrapper">
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="dueDate">
                Due Date<span className="require">*</span>
              </label>
              <div className="date-input-wrapper">
                <input
                  type="date"
                  id="dueDate"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="teamStatus">Status</label>
              <div className="select-wrapper">
                <select
                  id="teamStatus"
                  name="teamStatus"
                  value={formData.teamStatus}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* <div className="form-group">
            <label htmlFor="comment">Initial Comment</label>
            <textarea
              id="comment"
              name="comment"
              value={formData.comment}
              onChange={handleChange}
              className="form-textarea"
              placeholder="Please share any additional comment..."
              required
            />
          </div> */}

          {/* <div>
                    <label className="block mb-1">Attachments:</label>
                    <input
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        className=""
                    />
                </div> */}

          <div className="form-actions">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? "Creating..." : "Create task"}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={handleCloseCreateTaskVisible}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTask;

import React, { useState, useEffect } from "react";
import "./TodaysTask.css";
import axios from "axios";
import { notify } from "../utils/helper";

const TodaysTask = () => {
  const [tasks, setTasks] = useState([]);
  const [isCreateTaskVisible, setIsCreateTaskVisible] = useState(false);
  const [isEditTaskVisible, setIsEditTaskVisible] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState("");
  const [formData, setFormData] = useState({
    taskDescription: "",
    projectName: "",
    assignedTo: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [editingTask, setEditingTask] = useState(null);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found, please login again");
        return;
      }
      const response = await axios.get(
        " https://blu-sunday-product-be-newchangesdevbe-production.up.railway.app/api/todaytask",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setTasks(response.data.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const fetchUser = async () => {
    try {
      const response = await axios.get(
        ` https://blu-sunday-product-be-newchangesdevbe-production.up.railway.app/api/auth/users/by-team/Sales`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setUser(response.data.users);
      console.log("all user list", response.data.users);
    } catch (error) {
      console.error("all user list: ", error);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchUser();
  }, []);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found, please login again");
        return;
      }
      await axios.put(
        ` https://blu-sunday-product-be-newchangesdevbe-production.up.railway.app/api/todaytask/update/${taskId}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      notify("success", "Task Updated successfully");
      fetchTasks();
    } catch (error) {
      console.error("Error updating task status:", error);
      notify("error", error?.response?.data?.error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.log("No token found, please login again");
          return;
        }
        await axios.delete(
          ` https://blu-sunday-product-be-newchangesdevbe-production.up.railway.app/api/todaytask/delete/${taskId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        fetchTasks();
        notify("success", "Task Deleted successfully");
      } catch (error) {
        console.error("Error deleting task:", error);
        notify("error", error?.response?.data?.error);
      }
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found, please login again");
        return;
      }
      await axios.post(
        " https://blu-sunday-product-be-newchangesdevbe-production.up.railway.app/api/todaytask",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setIsCreateTaskVisible(false);
      setFormData({
        taskDescription: "",
        projectName: "",
        assignedTo: "",
        date: new Date().toISOString().split("T")[0],
      });
      fetchTasks();
      notify("success", "Task Created successfully");
    } catch (error) {
      console.error("Error creating task:", error);
      notify("error", error?.response?.data?.error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setFormData({
      taskDescription: task.taskDescription,
      projectName: task.projectName,
      assignedTo: task.assignedTo._id,
      date: new Date(task.date).toISOString().split("T")[0],
    });
    setIsEditTaskVisible(true);
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found, please login again");
        return;
      }
      await axios.put(
        ` https://blu-sunday-product-be-newchangesdevbe-production.up.railway.app/api/todaytask/update/${editingTask._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setIsEditTaskVisible(false);
      setEditingTask(null);
      setFormData({
        taskDescription: "",
        projectName: "",
        assignedTo: "",
        date: new Date().toISOString().split("T")[0],
      });
      fetchTasks();
      notify("success", "Task Updated successfully");
    } catch (error) {
      console.error("Error updating task:", error);
      notify("error", "Only admin can edit details");
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (!selectedUser) return true;
    return task.assignedTo._id === selectedUser;
  });

  return (
    <div className="todays-task-container">
      <div className="tasks-header">
        <h1>Today's Tasks</h1>
        <div className="header-actions">
          <div className="filter-container">
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="filter-select"
            >
              <option value="">All Users</option>
              {user?.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
          <button
            className="new-task-button"
            onClick={() => setIsCreateTaskVisible(true)}
          >
            Today's Task +
          </button>
        </div>
      </div>

      {isCreateTaskVisible && (
        <div className="create-task-modal">
          <div className="modal-content">
            <h2>Create New Task</h2>
            <form onSubmit={handleCreateTask}>
              <div className="form-group">
                <label>Task Description</label>
                <input
                  type="text"
                  name="taskDescription"
                  value={formData.taskDescription}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Project Name</label>
                <input
                  type="text"
                  name="projectName"
                  value={formData.projectName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Assigned To</label>
                <select
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select User</option>
                  {user
                    ?.sort((a, b) => {
                      if (a.name > b.name) return 1;
                      else if (a.name < b.name) return -1;
                      return 0;
                    })
                    ?.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.name}
                      </option>
                    ))}
                </select>
              </div>
              <div className="form-actions">
                <button type="submit" className="submit-button">
                  Create Task
                </button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setIsCreateTaskVisible(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditTaskVisible && (
        <div className="create-task-modal">
          <div className="modal-content">
            <h2>Edit Task</h2>
            <form onSubmit={handleUpdateTask}>
              <div className="form-group">
                <label>Task Description</label>
                <input
                  type="text"
                  name="taskDescription"
                  value={formData.taskDescription}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Project Name</label>
                <input
                  type="text"
                  name="projectName"
                  value={formData.projectName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Assigned To</label>
                <select
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select User</option>
                  {user?.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-actions">
                <button type="submit" className="submit-button">
                  Update Task
                </button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => {
                    setIsEditTaskVisible(false);
                    setEditingTask(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="table-container">
        <table className="tasks-table">
          <thead>
            <tr>
              <th>Assigned To</th>
              <th>Task Description</th>
              <th>Project Name</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((task) => (
              <tr key={task._id}>
                <td>
                  <div className="assignee">
                    <div className="avatar">
                      {task.assignedTo?.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    {task.assignedTo?.name}
                  </div>
                </td>
                <td
                  className="task-description-cell"
                  title={task.taskDescription}
                >
                  {task.taskDescription}
                </td>
                <td>{task.projectName}</td>
                <td>
                  <select
                    value={task.status}
                    onChange={(e) =>
                      handleStatusChange(task._id, e.target.value)
                    }
                    className={`status-select ${task.status.toLowerCase()}`}
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Blocker">Blocker</option>
                    <option value="Completed">Completed</option>
                  </select>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="edit-button"
                      onClick={() => handleEditTask(task)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-button"
                      onClick={() => handleDeleteTask(task._id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TodaysTask;

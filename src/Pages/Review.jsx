import React, { useEffect, useState } from "react";
import "./Managers.css";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { notify } from "../utils/helper";
import { useNavigate } from "react-router-dom";

function Review() {
  const { user, opics } = useAuth();
  const [loading, setLoading] = useState(false);
  const [reviewSubtasks, setReviewSubtasks] = useState([]);
  const navigate = useNavigate();

  const fetchTasksAndSubtasks = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.log("No token found, please login again");
      return;
    }

    try {
      const response = await axios.get(
        ` https://blu-sunday-product-be-newchangesdevbe-production.up.railway.app/api/project/review-subtasks`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("review subtask", response?.data?.data?.subtasks);
      setReviewSubtasks(response?.data?.data?.subtasks);
      //   setProjectData(response.data?.project);
      //   setProjectName(response.data?.project?.projectName);
      //   setTaskData(response.data?.project?.tasks);
    } catch (error) {
      console.log(
        error.response?.data?.message || "Error fetching tasks and subtasks"
      );
    }
  };

  useEffect(() => {
    fetchTasksAndSubtasks();
  }, []);

  const handleViewProject = (projectId) => {
    console.log("projectId", projectId);
    navigate(`/project/${projectId}`);
  };

  return (
    <div className="manager-page-container">
      <div className="managers-list-section">
        <h2>
          List of Review Subtasks
          <span className="manager-count">({reviewSubtasks?.length})</span>
        </h2>
        <div className="managers-table">
          <div className="table-header">
            <div className="header-cell">Subtask Name</div>
            <div className="header-cell">Assigner</div>
            <div className="header-cell">Assignee</div>
            <div className="header-cell">Project Name</div>
            <div className="header-cell ">Task Name</div>
            <div className="header-cell table-cell-2">Actions</div>
          </div>
          {reviewSubtasks
            ?.sort((a, b) => {
              if (a.name < b.name) {
                return -1;
              } else if (a.name > b.name) {
                return 1;
              }
              return 0;
            })
            ?.map((subtask) => (
              <div className="table-row" key={subtask?._id}>
                <div className="table-cell">{subtask?.name}</div>
                <div className="table-cell">{subtask?.assigner?.name}</div>
                <div className="table-cell">{subtask?.assignee?.name}</div>
                <div className="table-cell">{subtask?.project?.name}</div>
                <div className="table-cell ">{subtask?.task?.name}</div>
                <div
                  className="table-cell table-cell-2"
                  onClick={() => handleViewProject(subtask?.project?.id)}
                >
                  <button className="view-button">View</button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default Review;

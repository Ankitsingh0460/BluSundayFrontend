import React, { useEffect, useRef, useState } from "react";
import "./ActionPopUp.css";
import { MdDeleteForever, MdEdit } from "react-icons/md";
import { HiDotsHorizontal } from "react-icons/hi";
import axios from "axios";
import { notify } from "../../../utils/helper";

const TaskActionPopUp = ({ handleEditTask, task, fetchTasksAndSubtasks }) => {
  const [isTaskActionPopUpVisible, setIsTaskActionPopUpVisible] =
    useState(false);

  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsTaskActionPopUpVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleActionPopUp = () => {
    setIsTaskActionPopUpVisible((prev) => !prev);
  };

  const handleEditIcon = () => {
    setIsTaskActionPopUpVisible(false);
    handleEditTask(task);
  };

  const handleDeleteClick = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this task?"
    );
    if (!confirmDelete) return;

    const token = localStorage.getItem("token");
    if (!token) {
      console.log("No token found, please login again");
      return;
    }

    try {
      await axios.delete(
        ` https://blu-sunday-product-be-newchangesdevbe-production.up.railway.app/api/task/delete/${task._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchTasksAndSubtasks();
      notify("success", "Task deleted successfully");
    } catch (error) {
      console.error("Error deleting task:", error);
      notify(
        "error",
        error?.response?.data?.message || "Failed to delete task"
      );
    }
  };

  return (
    <>
      <div className="action-popup-container" ref={wrapperRef}>
        <p className="dots" onClick={handleActionPopUp}>
          <HiDotsHorizontal />
        </p>
        {isTaskActionPopUpVisible && (
          <div className="action-popup-wrapper task-action-popup-wrapper">
            <div className="actions-icon" onClick={handleEditIcon}>
              <MdEdit />
              <p>Edit</p>
            </div>
            <hr />
            <div className="actions-icon" onClick={handleDeleteClick}>
              <MdDeleteForever />
              <p>Delete</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default TaskActionPopUp;

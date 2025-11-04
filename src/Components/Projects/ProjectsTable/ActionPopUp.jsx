import React, { useEffect, useRef, useState } from "react";
import "./ActionPopUp.css";
import { MdDeleteForever, MdEdit } from "react-icons/md";
import { HiDotsHorizontal } from "react-icons/hi";
import axios from "axios";
import { notify } from "../../../utils/helper";

const ActionPopUp = ({ fetchProject, project, handleEditProject }) => {
  const [isActionPopUpVisible, setIsActionPopUpVisible] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        if (isActionPopUpVisible) {
          setIsActionPopUpVisible(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isActionPopUpVisible]);

  const handleActionPopUp = () => {
    setIsActionPopUpVisible((prev) => !prev);
  };

  const handleEditIcon = () => {
    setIsActionPopUpVisible(false);
    handleEditProject(project);
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm("Are you sure you want to delete this project?")) {
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      notify("error", "You need to log in first.");
      console.error("You need to log in first.");
      return;
    }

    try {
      const response = await axios.delete(
        ` https://blu-sunday-product-be-newchangesdevbe-production.up.railway.app/api/project/delete/${projectId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      notify("success", response.data.message);
      setIsActionPopUpVisible(false);
      fetchProject();
      console.log("Project deleted:", response.data);
    } catch (error) {
      notify(
        "error",
        error.response?.data?.message || "Error deleting project"
      );
      console.error(
        "Error deleting project:",
        error.response?.data?.message || error.message
      );
    }
  };

  return (
    <div className="action-popup-container" ref={wrapperRef}>
      <p className="dots" onClick={handleActionPopUp}>
        {" "}
        <HiDotsHorizontal />{" "}
      </p>
      {isActionPopUpVisible && (
        <div className="action-popup-wrapper">
          <div className="actions-icon" onClick={handleEditIcon}>
            <MdEdit /> <p>Edit</p>
          </div>
          <hr />
          <div
            className="actions-icon"
            onClick={() => handleDeleteProject(project._id)}
          >
            <MdDeleteForever /> <p>Delete</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionPopUp;

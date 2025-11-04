import React, { useState } from "react";
import "./Managers.css";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { notify } from "../utils/helper";
import { locations, teams } from "../utils/constant.js";
import { MdDeleteForever, MdModeEdit } from "react-icons/md";

function OperationPics() {
  const { user, opics } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editingOpic, setEditingOpic] = useState(null);

  const { fetchOpics } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    designation: "R1",
    team: "AI Team",
    location: "Gurgaon",
  });

  const token = localStorage.getItem("token");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleDelete = async (opicId) => {
    if (
      !window.confirm("Are you sure you want to delete this Operation PIC?")
    ) {
      return;
    }

    if (!token) {
      notify("error", "You need to log in first.");
      return;
    }

    try {
      await axios.delete(
        ` https://blu-sunday-product-be-newchangesdevbe-production.up.railway.app/api/auth/delete/opic/${opicId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      notify("success", "Operation PIC deleted successfully");
      fetchOpics();
    } catch (error) {
      notify(
        "error",
        error.response?.data?.message || "Error deleting Operation PIC"
      );
    }
  };

  const handleEdit = (opic) => {
    setEditingOpic(opic);
    setFormData({
      name: opic.name,
      email: opic.email,
      team: opic.team,
      location: opic.location,
      designation: opic.designation,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!token) {
      notify("error", "You need to log in first.");
      return;
    }

    try {
      await axios.put(
        ` https://blu-sunday-product-be-newchangesdevbe-production.up.railway.app/api/auth/edit/opic/${editingOpic._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      notify("success", "Operation PIC updated successfully");
      setFormData({
        name: "",
        email: "",
        designation: "R1",
        team: "AI Team",
        location: "Gurgaon",
      });
      setEditingOpic(null);
      fetchOpics();
      setLoading(false);
    } catch (error) {
      notify(
        "error",
        error.response?.data?.message || "Error updating Operation PIC"
      );
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editingOpic) {
      handleUpdate(e);
      return;
    }

    setLoading(true);

    if (!token) {
      notify("error", "You need to log in first.");
      return;
    }

    try {
      const response = await axios.post(
        " https://blu-sunday-product-be-newchangesdevbe-production.up.railway.app/api/auth/create/opic",
        {
          name: formData.name,
          email: formData.email,
          team: formData.team,
          location: formData.location,
          role: user?.role,
          id: user?.id,
          designation: formData.designation,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setLoading(false);
      setFormData({
        name: "",
        email: "",
        designation: "R1",
        team: "AI Team",
        location: "Gurgaon",
      });
      notify("success", response.data.message);
      fetchOpics();
    } catch (error) {
      notify(
        "error",
        error.response?.data?.message || "Error creating Operation PIC"
      );
      setLoading(false);
    }
  };

  return (
    <div className="manager-page-container">
      <div className="add-manager-section">
        <h2>{editingOpic ? "Edit Operation PIC" : "Add New"}</h2>
        <form onSubmit={handleSubmit} className="add-manager-form">
          <div className="form-group">
            <label htmlFor="name">
              Name<span className="require">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">
              Email<span className="require">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
          {user?.role === "admin" && (
            <div className="form-group">
              <label htmlFor="team">Team</label>
              <select
                id="team"
                name="team"
                value={formData.team}
                onChange={handleInputChange}
              >
                {/* <option value="Sales">Sales Team</option>
                <option value="Full Stack">Full Stack Team</option>
                <option value="Data Science and AI">Data Science and AI</option>
                <option value="Back-end Team (BD)">Back-end Team (BD)</option> */}
                {teams.map((team) => (
                  <option key={team} value={team}>
                    {team}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="location">Location</label>
            <select
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
            >
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>
          <div className="button-group">
            <button type="submit" className="add-button" disabled={loading}>
              {loading
                ? "Loading..."
                : editingOpic
                ? "Update Operation PIC"
                : "Add"}
            </button>
            {editingOpic && (
              <button
                type="button"
                onClick={() => {
                  setEditingOpic(null);
                  setFormData({
                    name: "",
                    email: "",
                    team: "Business Advisory",
                    designation: "R1",
                    location: "Japan",
                  });
                }}
                className="cancel-button"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="managers-list-section">
        <h2>
          List of Team Members{" "}
          <span className="manager-count">({opics.length})</span>
        </h2>
        <div className="managers-table">
          <div className="table-header">
            <div className="header-cell">Name</div>
            <div className="header-cell">Email</div>
            <div className="header-cell">Team</div>
            <div className="header-cell table-cell-2">Location</div>
            <div className="header-cell table-cell-2">Actions</div>
          </div>
          {opics
            ?.sort((a, b) => {
              if (a.name < b.name) {
                return -1;
              } else if (a.name > b.name) {
                return 1;
              }
              return 0;
            })
            ?.map((opic) => (
              <div className="table-row" key={opic?._id}>
                <div className="table-cell">{opic?.name}</div>
                <div className="table-cell">{opic?.email}</div>
                <div className="table-cell">{opic?.team}</div>
                <div className="table-cell table-cell-2">{opic?.location}</div>
                <div className="table-cell table-cell-2">
                  <div className="action-buttons">
                    <button
                      onClick={() => handleEdit(opic)}
                      className="edit-button"
                      title="Edit"
                    >
                      <MdModeEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(opic._id)}
                      className="delete-button"
                      title="Delete"
                    >
                      <MdDeleteForever />
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default OperationPics;

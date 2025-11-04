import { useEffect, useState } from "react";
import "./CreateProject.css";
import axios from "axios";
import { formatToYYYYMMDD, notify } from "../../utils/helper";

const UpdateProject = ({
  projectEditData,
  setIsUpdateProjectVisible,
  fetchProject,
}) => {
  const [loading, setLoading] = useState(false);
  const [assigneeList, setAssigneeList] = useState([]);

  const [formData, setFormData] = useState({
    projectName: projectEditData?.projectName,
    projectType: projectEditData?.projectType || "",
    startDate: formatToYYYYMMDD(projectEditData?.startDate),
    endDate: formatToYYYYMMDD(projectEditData?.endDate),
    projectDescription: projectEditData?.projectDescription,
    projectOwner: projectEditData?.projectOwner?._id || "",
    assignedUsers:
      projectEditData?.assignedUsers?.map((user) => user._id) || [],
    team: projectEditData?.team || "Sales",
    expectedDuration: projectEditData?.expectedDuration || "",
  });

  const fetchAssigneeList = async () => {
    try {
      const response = await axios.get(
        ` https://blu-sunday-product-be-newchangesdevbe-production.up.railway.app/api/auth/users/by-team/Sales`,
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

  useEffect(() => {
    // fetchTemplate();
    fetchAssigneeList();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => {
      const newState = {
        ...prevState,
        [name]: value,
      };

      // Calculate end date when start date changes
      if (name === "startDate") {
        if (value && newState.expectedDuration) {
          const startDate = new Date(value);
          const endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + newState.expectedDuration);
          newState.endDate = endDate.toISOString().split("T")[0];
        }
      }

      if (name === "expectedDuration") {
        if (newState.startDate && value) {
          const startDate = new Date(newState.startDate);
          const endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + parseInt(value));
          newState.endDate = endDate.toISOString().split("T")[0];
        }
      }

      return newState;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("token");
    if (!token) {
      console.log("No token found, please login again");
      return;
    }

    try {
      formData.startDate = new Date(formData.startDate);
      formData.endDate = new Date(formData.endDate);
      const response = await axios.put(
        ` https://blu-sunday-product-be-newchangesdevbe-production.up.railway.app/api/project/update/${projectEditData._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      notify("success", response.data.message);
      setIsUpdateProjectVisible(false);
      fetchProject();
      console.log("Project updated:", response.data);
    } catch (error) {
      notify(
        "error",
        error.response?.data?.message || "Error updating project"
      );
      console.error(
        "Error updating project:",
        error.response?.data?.message || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCloseCreateProjectVisible = () => {
    setIsUpdateProjectVisible(false);
  };

  return (
    <div className="create-project-container">
      <div className="create-project-wrapper">
        <h1 className="form-title">Update project</h1>

        <form onSubmit={handleSubmit} className="project-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="projectName">
                Project name<span className="require">*</span>
              </label>
              <input
                type="text"
                id="projectName"
                name="projectName"
                value={formData.projectName}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="projectOwner">
                Project Owner<span className="require">*</span>
              </label>
              <div className="select-wrapper">
                <select
                  id="projectOwner"
                  name="projectOwner"
                  value={formData.projectOwner}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">Select Project Owner</option>
                  {assigneeList
                    ?.sort((a, b) => {
                      if (a.name < b.name) return -1;
                      if (a.name > b.name) return 1;
                      return 0;
                    })
                    ?.map((user, index) => (
                      <option key={index} value={user._id}>
                        {user.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="assignedUsers">
              Assigned Users<span className="require">*</span>
            </label>
            <div className="select-wrapper">
              <select
                id="assignedUsers"
                name="assignedUsers"
                value={formData.assignedUsers}
                onChange={(e) => {
                  const selectedOptions = Array.from(
                    e.target.selectedOptions,
                    (option) => option.value
                  );
                  setFormData((prev) => ({
                    ...prev,
                    assignedUsers: selectedOptions,
                  }));
                }}
                className="form-select"
                multiple
                required
              >
                {assigneeList
                  ?.sort((a, b) => {
                    if (a.name < b.name) return -1;
                    if (a.name > b.name) return 1;
                    return 0;
                  })
                  ?.map((user, index) => (
                    <option key={index} value={user._id}>
                      {user.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="projectType">
                Project type<span className="require">*</span>
              </label>
              <div className="select-wrapper">
                <input
                  type="text"
                  id="projectType"
                  name="projectType"
                  value={formData.projectType}
                  readOnly
                  className="form-input not-editable-inputBox "
                />
              </div>
            </div>

            {/* <div className="form-group">
              <label htmlFor="expectedDuration">Expected Duration (days)</label>
              <input
                type="number"
                id="expectedDuration"
                name="expectedDuration"
                value={formData.expectedDuration}
                onChange={handleChange}
                className="form-input not-editable-inputBox"
              />
            </div> */}
          </div>

          {/* <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">Start Date<span className="require" >*</span></label>
              <div className="date-input-wrapper">
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  placeholder="DD/MM/YYYY"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="endDate">End Date</label>
              <div className="date-input-wrapper">
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  placeholder="DD/MM/YYYY"
                  value={formData.endDate}
                  readOnly
                  className="form-input not-editable-inputBox"
                  required
                />
              </div>
            </div>
          </div> */}

          {/* <div className="form-group">
            <label htmlFor="projectDescription">Project Description</label>
            <textarea
              id="projectDescription"
              name="projectDescription"
              placeholder="Please share your main reason..."
              value={formData.projectDescription}
              onChange={handleChange}
              className="form-textarea"
            />
          </div> */}

          <div className="form-actions">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? "Updating..." : "Update project"}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={handleCloseCreateProjectVisible}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateProject;

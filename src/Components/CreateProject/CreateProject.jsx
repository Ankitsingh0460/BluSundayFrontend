import { useEffect, useState } from "react";
import "./CreateProject.css";
import axios from "axios";
import { notify } from "../../utils/helper";

const CreateProject = ({ setIsCreateProjectVisible, fetchProject }) => {
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [assigneeList, setAssigneeList] = useState([]);

  const [formData, setFormData] = useState({
    projectName: "",
    projectType: "",
    startDate: "",
    endDate: "",
    projectDescription: "",
    projectOwner: "",
    assignedUsers: [],
    team: "Sales",
    expectedDuration: 0,
  });

  const fetchTemplate = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("No token found, please login again");
      notify("error", "No token found, please login again");
      return;
    }
    try {
      const resp = await axios.get(
        " https://blu-sunday-product-be-newchangesdevbe-production.up.railway.app/api/templates/all",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("fetch template", resp.data);
      setTemplates(resp.data);
    } catch (error) {
      console.log("error in fetching template", error);
    }
  };

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
    fetchTemplate();
    fetchAssigneeList();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => {
      const newState = {
        ...prevState,
        [name]: value,
      };

      // Update expected duration when project type changes
      if (name === "projectType") {
        const selectedTemplate = templates.find(
          (template) => template.projectName === value
        );
        if (selectedTemplate) {
          newState.expectedDuration = selectedTemplate.expectedDuration;
          // If start date is already set, update end date
          if (newState.startDate) {
            try {
              const startDate = new Date(newState.startDate);
              if (!isNaN(startDate.getTime())) {
                const endDate = new Date(startDate);
                endDate.setDate(
                  startDate.getDate() + selectedTemplate.expectedDuration
                );
                newState.endDate = endDate.toISOString().split("T")[0];
              }
            } catch (error) {
              console.error("Error calculating end date:", error);
            }
          }
        }
      }

      // Calculate end date when start date changes
      if (name === "startDate") {
        if (value && newState.expectedDuration) {
          try {
            const startDate = new Date(value);
            if (!isNaN(startDate.getTime())) {
              const endDate = new Date(startDate);
              endDate.setDate(
                startDate.getDate() + parseInt(newState.expectedDuration)
              );
              newState.endDate = endDate.toISOString().split("T")[0];
            }
          } catch (error) {
            console.error("Error calculating end date:", error);
          }
        }
      }

      // Calculate end date when expected duration changes
      if (name === "expectedDuration") {
        if (newState.startDate && value) {
          try {
            const startDate = new Date(newState.startDate);
            if (!isNaN(startDate.getTime())) {
              const endDate = new Date(startDate);
              endDate.setDate(startDate.getDate() + parseInt(value));
              newState.endDate = endDate.toISOString().split("T")[0];
            }
          } catch (error) {
            console.error("Error calculating end date:", error);
          }
        }
      }

      return newState;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    console.log("formData", formData);
    // return;

    const token = localStorage.getItem("token");

    if (!token) {
      console.log("No token found, please login again");
      notify("error", "No token found, please login again");
      setLoading(false);
      return;
    }

    try {
      formData.startDate = new Date(formData.startDate);
      formData.endDate = new Date(formData.endDate);

      const response = await axios.post(
        " https://blu-sunday-product-be-newchangesdevbe-production.up.railway.app/api/project/create",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      notify("success", response.data.message);
      fetchProject();
      setIsCreateProjectVisible(false);
      setLoading(false);
      console.log(response.data.message);
    } catch (error) {
      console.log(error || "Error creating project");
      notify(
        "error",
        error.response?.data?.message || "Error creating project"
      );
      setLoading(false);
      setIsCreateProjectVisible(false);
    }
  };

  const handleCloseCreateProjectVisible = () => {
    setIsCreateProjectVisible(false);
  };

  return (
    <div className="create-project-container">
      <div className="create-project-wrapper">
        <h1 className="form-title">Create new project</h1>

        <form onSubmit={handleSubmit} className="project-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="projectName">
                Project name<span className="require">*</span>{" "}
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

            {/* <div className="form-group">
              <label htmlFor="team">Select a team<span className="require" >*</span></label>
              <div className="select-wrapper">
                <select
                  id="team"
                  name="team"
                  value={formData.team}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="Sales">Sales Team</option>
                    <option value="Full Stack">Full Stack Team</option>
                    <option value="Data Science and AI">Data Science and AI</option>
                    <option value="Back-end Team (BD)">Back-end Team (BD)</option>    
                </select>
              </div>
            </div> */}
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
                <select
                  id="projectType"
                  name="projectType"
                  value={formData.projectType}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">Select Project Type</option>
                  {templates
                    ?.sort((a, b) => {
                      if (a.projectName < b.projectName) return -1;
                      if (a.projectName > b.projectName) return 1;
                      return 0;
                    })
                    ?.map((template, index) => (
                      <option key={index} value={template.projectName}>
                        {template.projectName}
                      </option>
                    ))}
                </select>
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
                className="form-input"
                min={0}
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
                  onChange={handleChange}
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
              {loading ? "Creating..." : "Create project"}
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

export default CreateProject;

import { useEffect, useState } from "react";
import "./ProjectsTable.css";
import CreateProject from "../../CreateProject/CreateProject";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import axios from "axios";
import ActionPopUp from "./ActionPopUp";
import UpdateProject from "../../CreateProject/UpdateProject";

const ProjectsTable = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const openTab = searchParams.get("openTab");
  const [activeTab, setActiveTab] = useState(openTab || "All");

  const [isCreateProjectVisible, setIsCreateProjectVisible] = useState(false);
  const [isUpdateProjectVisible, setIsUpdateProjectVisible] = useState(false);
  const [projects, setProjects] = useState([]);
  const [projectEditData, setProjectEditData] = useState();
  const [projectCounts, setProjectCounts] = useState({
    all: 0,
    signedProjects: 0,
    digitalAndPRProjects: 0,
    pocs: 0,
    salesPipeline: 0,
    hirings: 0,
  });

  console.log("activetab", activeTab);

  const [sortBy] = useState("startDate");
  const [sortOrder] = useState("asc");

  const navigate = useNavigate();
  const location = useLocation();

  // console.log('project counts', projectCounts);

  const [searchTerm, setSearchTerm] = useState("");

  const fetchProject = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found, please login again");
        return;
      }
      const resp = await axios.get(
        " https://blu-sunday-product-be-newchangesdevbe-production.up.railway.app/api/project/view",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("projects all view: ", resp.data);
      setProjects(resp.data);

      // Calculate counts by project type
      const counts = {
        all: resp.data.length,
        signedProjects: resp.data.filter((project) =>
          project.projectType.startsWith("Signed Projects")
        ).length,
        digitalAndPRProjects: resp.data.filter(
          (project) => project.projectType === "Digital & PR Projects"
        ).length,
        pocs: resp.data.filter((project) =>
          project.projectType.startsWith("POC's")
        ).length,
        salesPipeline: resp.data.filter((project) =>
          project.projectType.startsWith("Sales Pipeline")
        ).length,
        hirings: resp.data.filter((project) =>
          project.projectType.startsWith("Hirings")
        ).length,
      };
      setProjectCounts(counts);
    } catch (err) {
      console.log("error in fetching all projects:", err);
    }
  };

  useEffect(() => {
    fetchProject();
  }, []);

  useEffect(() => {
    console.log("location", location);
    if (location.state?.openTab) {
      // setActiveTab(location.state.openTab);
      console.log("location.state.openTab", location.state.openTab);
    }
  }, [location.state]);

  const tabs = [
    { name: "All", count: projectCounts.all },
    { name: "Signed Projects", count: projectCounts.signedProjects },
    {
      name: "Digital & PR Projects",
      count: projectCounts.digitalAndPRProjects,
    },
    { name: "POC's", count: projectCounts.pocs },
    { name: "Sales Pipeline", count: projectCounts.salesPipeline },
    { name: "Hirings", count: projectCounts.hirings },
  ];

  const filteredProjects = projects.filter((project) => {
    // Tab filtering
    let tabMatch = true;
    if (activeTab === "Signed Projects")
      tabMatch = project.projectType.startsWith("Signed Projects");
    else if (activeTab === "Digital & PR Projects")
      tabMatch = project.projectType === "Digital & PR Projects";
    else if (activeTab === "POC's")
      tabMatch = project.projectType.includes("POC");
    else if (activeTab === "Sales Pipeline")
      tabMatch = project.projectType.startsWith("Sales Pipeline");
    else if (activeTab === "Hirings")
      tabMatch = project.projectType.startsWith("Hirings");
    // Search filtering
    let searchMatch = true;
    if (searchTerm.trim() !== "") {
      searchMatch = project.projectName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
    }
    return tabMatch && searchMatch;
  });

  const handleNewProject = () => {
    setIsCreateProjectVisible(true);
  };

  const handleEditProject = (proj) => {
    setProjectEditData(proj);
    setIsUpdateProjectVisible(true);
  };

  const handleNavigateToTask = (id) => {
    navigate(`/project/${id}?openTab=${encodeURIComponent(activeTab)}`);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab.name);
    setSearchParams({ openTab: tab.name });
  };

  const sortProjects = (projects) => {
    if (!projects) return [];

    let sortedProjects = [...projects];

    // Apply sorting
    sortedProjects.sort((a, b) => {
      if (sortBy === "startDate") {
        const dateA = new Date(a.startDate);
        const dateB = new Date(b.startDate);
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      } else if (sortBy === "targetDate") {
        const dateA = new Date(a.endDate);
        const dateB = new Date(b.endDate);
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      } else if (sortBy === "completionDate") {
        const dateA = new Date(a.completionDate || 0);
        const dateB = new Date(b.completionDate || 0);
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      }
      return 0;
    });

    return sortedProjects;
  };

  return (
    <div className="projects-table-container">
      {isCreateProjectVisible && (
        <CreateProject
          fetchProject={fetchProject}
          setIsCreateProjectVisible={setIsCreateProjectVisible}
        />
      )}

      {isUpdateProjectVisible && (
        <UpdateProject
          fetchProject={fetchProject}
          projectEditData={projectEditData}
          setIsUpdateProjectVisible={setIsUpdateProjectVisible}
        />
      )}

      <div className="projects-header">
        <h1>Projects</h1>
        <button className="new-project-button" onClick={handleNewProject}>
          New Project +
        </button>
      </div>

      <div>
        <div className="tabs">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              className={`tab ${activeTab === tab.name ? "active" : ""}`}
              onClick={() => handleTabChange(tab)}
            >
              {tab.name} ({tab.count})
            </button>
          ))}

          <div className="search-container">
            <svg
              className="search-icon"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <input
              type="text"
              placeholder="Search by project name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="table-container">
          <table className="projects-table">
            <thead>
              <tr>
                {/* <th>Project ID</th> */}
                <th>Project Name</th>
                <th>Project Type</th>
                <th>Owner</th>
                <th>OwnerShip</th>
                <th>Assigned User</th>
                {/* <th>Start Date</th>
                <th>Target Date</th>
                <th>Completion Date</th>
                <th>Project Duration</th> */}
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {sortProjects(filteredProjects).map((project, index) => (
                <tr className="single-project" key={index}>
                  {/* <td onClick={() => handleNavigateToTask(project._id)}>
                    {project.projectId}
                  </td> */}
                  <td onClick={() => handleNavigateToTask(project._id)}>
                    {project?.projectName}
                  </td>
                  <td onClick={() => handleNavigateToTask(project._id)}>
                    {project.projectType}
                  </td>
                  <td onClick={() => handleNavigateToTask(project._id)}>
                    {project?.owner ? (
                      <div className="assignee">
                        <div className="avatar">
                          {project?.owner?.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>{" "}
                        {project?.owner?.name}
                      </div>
                    ) : (
                      ""
                    )}
                  </td>
                  <td onClick={() => handleNavigateToTask(project._id)}>
                    {project?.projectOwner ? (
                      <div className="assignee">
                        <div className="avatar">
                          {project?.projectOwner?.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>{" "}
                        {project?.projectOwner?.name}
                      </div>
                    ) : (
                      ""
                    )}
                  </td>
                  <td>
                    <div className="assignee-2">
                      {project?.assignedUsers?.map((user) => (
                        <div
                          key={user._id} // Assuming user object has an _id
                          className="avatar-2"
                          title={user.name} // Add title for hover effect
                        >
                          {user?.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                      ))}
                    </div>
                  </td>
                  {/* <td onClick={() => handleNavigateToTask(project._id)}>
                    {formatDate(project.startDate)}
                  </td>
                  <td onClick={() => handleNavigateToTask(project._id)}>
                    {formatDate(project.endDate)}
                  </td>
                  <td onClick={() => handleNavigateToTask(project._id)}>
                    {formatCompletionDate(project?.completionDate)}
                  </td>
                  <td onClick={() => handleNavigateToTask(project._id)}>
                    {calculateProjectDuration(project)} days
                  </td> */}
                  <td>
                    <span
                      className={`status-badge ${project.status.toLowerCase()}`}
                    >
                      {project.status}
                    </span>
                  </td>
                  <td>
                    <ActionPopUp
                      fetchProject={fetchProject}
                      handleEditProject={handleEditProject}
                      project={project}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {activeTab === "All" && (
          <button className="add-project-button" onClick={handleNewProject}>
            + Add Project
          </button>
        )}
      </div>
    </div>
  );
};

export default ProjectsTable;

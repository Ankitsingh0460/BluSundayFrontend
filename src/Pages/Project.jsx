import "./Project.css";
import ProjectsTable from "../Components/Projects/ProjectsTable/ProjectsTable";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import axios from "axios";

const Project = () => {
  // const {fetchManager, fetchOpics} = useAuth();

  // useEffect(()=>{
  //   fetchManager();
  //   fetchOpics();
  // }, [])

  //   useEffect(() => {
  //     const socket = io("http://localhost:5001", { withCredentials: true });

  //     socket.on("connect", () => {
  //       console.log("Connected to the Socket.io server!");
  //   });

  //     // Listen for 'new-notification' event
  //     // socket.on("new-notification", (notification) => {
  //     //   console.log("Received new notification:", notification);
  //     //     const userId = localStorage.getItem("userId"); // Assuming userId is stored in localStorage

  //     //     // Only add notifications for the logged-in user
  //     //     if (notification.userId === userId) {
  //     //         setNotifications((prevNotifications) => [
  //     //             ...prevNotifications,
  //     //             notification,
  //     //         ]);
  //     //     }
  //     // });

  //     // socket.on("new-notification", (notification) => {
  //     //   console.log("Received new notification:", notification); // Log received notification
  //     //   setNotifications((prevNotifications) => [
  //     //       ...prevNotifications,
  //     //       notification,
  //     //   ]);
  //     // });

  //     return () => {
  //         socket.off("new-notification");
  //     };
  // }, []);

  // useEffect(() => {
  //   // Initialize Pusher
  //   const pusher = new Pusher("884f4731b463a32c1759", {
  //     cluster: "ap2", // Use the cluster from your Pusher app
  //   });

  //   // Subscribe to the user's channel
  //   const channel = pusher.subscribe(`user-${user.id}`); // Replace with the actual user ID

  //   // Listen for the 'new-notification' event
  //   channel.bind("new-notification", (data) => {
  //     console.log("New notification received:", data.message);

  //     // Update the state with the new notification
  //     setNotifications((prevNotifications) => [
  //       ...prevNotifications,
  //       data.message,
  //     ]);
  //   });

  //   return () => {
  //     // Cleanup when the component unmounts
  //     pusher.unsubscribe("user-67e3a0295a7adcd1fa91011c");
  //   };
  // }, []);

  // useEffect(()=>{
  //   const fetchProjectsPerformance = async () => {
  //     try{
  //       const resp = await axios.get(' https://blu-sunday-product-be-newchangesdevbe-production.up.railway.app/api/project/overall-performance',
  //         {
  //           headers: {
  //             Authorization: `Bearer ${localStorage.getItem('token')}`,
  //           },
  //         }
  //         );
  //         console.log('projects performance data: ', resp.data.
  //           performanceData);
  //     }catch(err){
  //       console.log('error: ', err);
  //     }
  //   }
  //   fetchProjectsPerformance();
  // }, []);

  // const [viewMode, setViewMode] = useState('table');

  return (
    <div className="project-page-container">
      <ProjectsTable />
    </div>
  );
};

export default Project;

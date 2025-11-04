import { createContext, useState, useContext, useEffect } from "react";
import {
  addDays,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  format,
} from "date-fns";
import axios from "axios";
import PropTypes from "prop-types";

const CalendarContext = createContext();

export const useCalendar = () => useContext(CalendarContext);

export const CalendarProvider = ({ children }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [view, setView] = useState("month"); // 'month', 'week', 'day'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get the date range based on current view
      let startDate, endDate;
      if (view === "month") {
        startDate = startOfMonth(currentDate);
        endDate = endOfMonth(currentDate);
      } else if (view === "week") {
        startDate = startOfWeek(currentDate);
        endDate = endOfWeek(currentDate);
      } else {
        // day view
        startDate = currentDate;
        endDate = addDays(currentDate, 1);
      }

      const response = await axios.get(
        " https://blu-sunday-product-be-newchangesdevbe-production.up.railway.app/api/calendar/events",
        {
          params: {
            start: startDate.toISOString(),
            end: endDate.toISOString(),
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const formattedEvents = response.data.map((event) => ({
        ...event,
        id: event._id,
        start: new Date(event.startDate),
        end: new Date(event.endDate),
      }));
      console.log("all format events", formattedEvents);
      setEvents(formattedEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
      setError("Failed to fetch events. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch events when component mounts or when date/view changes
  useEffect(() => {
    fetchEvents();
  }, [currentDate, view]);

  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
    console.log("next month called");
  };

  const prevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
    console.log("prev month called");
  };

  const nextWeek = () => {
    setCurrentDate(addDays(currentDate, 7));
  };

  const prevWeek = () => {
    setCurrentDate(addDays(currentDate, -7));
  };

  const nextDay = () => {
    setCurrentDate(addDays(currentDate, 1));
  };

  const prevDay = () => {
    setCurrentDate(addDays(currentDate, -1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getMonthDays = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = [];
    let day = startDate;

    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }

    return days;
  };

  const getWeekDays = () => {
    const weekStart = startOfWeek(currentDate);

    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(addDays(weekStart, i));
    }

    return days;
  };

  const getHours = () => {
    const hours = [];
    for (let i = 0; i < 24; i++) {
      hours.push(i);
    }
    return hours;
  };

  const addEvent = async (event) => {
    try {
      const eventData = {
        title: event.title,
        description: event.description || "",
        startDate: event.start,
        endDate:
          event.end ||
          new Date(new Date(event.start).getTime() + 60 * 60 * 1000), // Default 1 hour duration
        allDay: event.allDay || false,
        color: event.calendar || "#1a73e8", // Default color
        reminder: "15", // Default reminder time
        recurrence: null, // No recurrence by default
        attendees: [], // Empty attendees array by default
        team: null, // No team by default
        location: "", // No location by default
      };

      const response = await axios.post(
        " https://blu-sunday-product-be-newchangesdevbe-production.up.railway.app/api/calendar/create",
        eventData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.event) {
        const newEvent = {
          ...response.data.event,
          id: response.data.event._id,
          start: new Date(response.data.event.startDate),
          end: new Date(response.data.event.endDate),
        };
        setEvents([...events, newEvent]);
        return newEvent;
      }
    } catch (error) {
      console.error("Error creating event:", error);
      throw error;
    }
  };

  const updateEvent = async (updatedEvent) => {
    try {
      const eventData = {
        title: updatedEvent.title,
        description: updatedEvent.description || "",
        startDate: updatedEvent.start,
        endDate:
          updatedEvent.end ||
          new Date(new Date(updatedEvent.start).getTime() + 60 * 60 * 1000),
        allDay: updatedEvent.allDay || false,
        color: updatedEvent.calendar || "#1a73e8",
        reminder: "15",
        recurrence: null,
        attendees: [],
        team: null,
        location: "",
      };

      const response = await axios.put(
        ` https://blu-sunday-product-be-newchangesdevbe-production.up.railway.app/api/calendar/update/${updatedEvent.id}`,
        eventData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.event) {
        const formattedEvent = {
          ...response.data.event,
          id: response.data.event._id,
          start: new Date(response.data.event.startDate),
          end: new Date(response.data.event.endDate),
        };

        setEvents(
          events.map((event) =>
            event.id === updatedEvent.id ? formattedEvent : event
          )
        );
        return formattedEvent;
      }
    } catch (error) {
      console.error("Error updating event:", error);
      throw error;
    }
  };

  const deleteEvent = async (eventId) => {
    try {
      const response = await axios.delete(
        ` https://blu-sunday-product-be-newchangesdevbe-production.up.railway.app/api/calendar/delete/${eventId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 200) {
        setEvents(events.filter((event) => event.id !== eventId));
        return true;
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      throw error;
    }
  };

  const getEventsForDate = (date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return events.filter((event) => {
      const eventDateStr = format(new Date(event.start), "yyyy-MM-dd");
      return eventDateStr === dateStr;
    });
  };

  const value = {
    currentDate,
    setCurrentDate,
    events,
    view,
    setView,
    loading,
    error,
    nextMonth,
    prevMonth,
    nextWeek,
    prevWeek,
    nextDay,
    prevDay,
    goToToday,
    getMonthDays,
    getWeekDays,
    getHours,
    addEvent,
    updateEvent,
    deleteEvent,
    getEventsForDate,
    fetchEvents, // Expose fetchEvents to components that need to manually refresh
  };

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
};

CalendarProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

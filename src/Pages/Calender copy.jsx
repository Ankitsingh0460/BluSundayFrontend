import React, { useState, useEffect } from "react";
import { Calendar as BigCalendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useCalendar } from "../context/CalendarContext";
import axios from "axios";
import "./Calender.css";
import { FaGooglePlus } from "react-icons/fa";
import { IoMdSync } from "react-icons/io";

const localizer = momentLocalizer(moment);

const CalendarPage = () => {
  const { events, setEvents } = useCalendar();
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  // 🔗 Open Google OAuth popup
  const connectGoogle = () => {
    window.open(
      `http://localhost:5001/api/calendar/google/auth?token=${token}`,
      "_blank"
    );
  };

  // 🔄 Sync Google events
  const syncGoogleCalendar = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:5001/api/calendar/google/fetch",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const googleEvents = response.data.events.map((item) => ({
        id: item.id,
        title: item.summary,
        start: new Date(item.start.dateTime || item.start.date),
        end: item.end.dateTime
          ? new Date(item.end.dateTime)
          : moment(item.end.date).subtract(1, "days").toDate(),
        isGoogle: true,
        hangoutLink: item.hangoutLink || null,
      }));

      setEvents((prevEvents) => {
        const localOnly = prevEvents.filter((e) => !e.isGoogle);
        return [...localOnly, ...googleEvents];
      });
    } catch (error) {
      console.error("Google sync failed:", error);
      alert(
        "❌ Failed to sync events: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  // ✅ Auto sync when page loads if token exists
  useEffect(() => {
    if (token) {
      syncGoogleCalendar();
    }
  }, [token]);

  return (
    <div className="calender-container">
      <div className="calendar-header">
        <button
          onClick={connectGoogle}
          className="google-btn"
          title="Connect to Google"
        >
          <FaGooglePlus size={22} />
        </button>

        <button
          onClick={syncGoogleCalendar}
          className="google-btn"
          title="Sync with Google"
        >
          {loading ? "Sync..." : <IoMdSync size={22} />}
        </button>
      </div>

      <BigCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "80vh", marginTop: 20 }}
        selectable
        popup
        views={["month", "week", "day"]}
        eventPropGetter={(event) => ({
          className: "custom-event",
          style: {
            backgroundColor: event.isGoogle ? "#1a73e8" : "#34a853",
            borderRadius: "5px",
            color: "white",
            border: "none",
            maxWidth: "100%",
            maxHeight: "100%",
            fontSize: "0.9rem",
            padding: "2px 6px",
          },
        })}
        components={{
          event: ({ event }) => (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "4px",
                width: "100%",
              }}
            >
              <span
                style={{
                  flex: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                title={event.title} // shows full name on hover
              >
                {event.title}
              </span>

              {event?.hangoutLink && (
                <a
                  href={event.hangoutLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    backgroundColor: "#fff",
                    color: "#1a73e8",
                    fontWeight: "bold",
                    borderRadius: "3px",
                    padding: "0 4px",
                    textDecoration: "none",
                    fontSize: "0.8rem",
                    flexShrink: 0,
                  }}
                >
                  Join
                </a>
              )}
            </div>
          ),
        }}
      />
    </div>
  );
};

export default CalendarPage;

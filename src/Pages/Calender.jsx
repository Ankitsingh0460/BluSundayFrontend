import { useState } from 'react';
import './Calender.css';
import { CalendarProvider } from '../context/CalendarContext';
import Header from '../Components/Calender/Header';
import Calendar from '../Components/Calender/Calender';
import EventModal from '../Components/Calender/EventModal';

function Calender() {
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const handleAddEvent = () => {
    setSelectedEvent(null);
    setShowEventModal(true);
  };

  const handleEditEvent = (event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleCloseModal = () => {
    setShowEventModal(false);
    setSelectedEvent(null);
  };

  return (
    <CalendarProvider>
      <div className="calender-container">
        <Header onAddEvent={handleAddEvent} />
        <div className="app-body">
          <Calendar onEditEvent={handleEditEvent} onAddEvent={handleAddEvent} />
        </div>
        {showEventModal && (
          <EventModal 
            onClose={handleCloseModal} 
            event={selectedEvent} 
          />
        )}
      </div>
    </CalendarProvider>
  );
}

export default Calender;
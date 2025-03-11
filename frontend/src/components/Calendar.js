import React, { useState, useEffect } from 'react';
import '../assets/css/Calendar.css';

const Calendar = ({ events = [], onSelectDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);

  // Construir días del calendario
  useEffect(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Obtener el primer día del mes
    const firstDayOfMonth = new Date(year, month, 1);
    // Obtener el día de la semana (0 = domingo, 1 = lunes, etc.)
    const firstDayOfWeek = firstDayOfMonth.getDay();
    // Obtener el último día del mes
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();

    // Obtener el último día del mes anterior
    const lastDayOfLastMonth = new Date(year, month, 0).getDate();

    // Array para almacenar todos los días que se mostrarán
    const days = [];

    // Días del mes anterior
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: lastDayOfLastMonth - i,
        month: month - 1,
        year,
        isCurrentMonth: false
      });
    }

    // Días del mes actual
    for (let i = 1; i <= lastDayOfMonth; i++) {
      days.push({
        day: i,
        month,
        year,
        isCurrentMonth: true
      });
    }

    // Calcular cuántos días del mes siguiente necesitamos
    const remainingDays = 42 - days.length; // 6 filas x 7 días = 42
    
    // Días del mes siguiente
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        month: month + 1,
        year,
        isCurrentMonth: false
      });
    }

    setCalendarDays(days);
  }, [currentDate]);

  // Verificar si un día tiene eventos
  const hasEvents = (day, month, year) => {
    return events.some(event => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === day &&
        eventDate.getMonth() === month &&
        eventDate.getFullYear() === year
      );
    });
  };

  // Obtener los eventos de un día específico
  const getEventsForDay = (day, month, year) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === day &&
        eventDate.getMonth() === month &&
        eventDate.getFullYear() === year
      );
    });
  };

  // Cambiar al mes anterior
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  // Cambiar al mes siguiente
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Cambiar al mes actual
  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  // Seleccionar un día
  const selectDay = (day, month, year) => {
    setSelectedDate(new Date(year, month, day));
    if (onSelectDate) {
      onSelectDate(new Date(year, month, day));
    }
  };

  // Verificar si un día es el seleccionado
  const isSelectedDay = (day, month, year) => {
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === month &&
      selectedDate.getFullYear() === year
    );
  };

  // Verificar si un día es hoy
  const isToday = (day, month, year) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === month &&
      today.getFullYear() === year
    );
  };

  // Nombres de los meses
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Nombres de los días de la semana
  const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h3 className="calendar-title">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <div className="calendar-navigation">
          <button className="calendar-nav-btn" onClick={prevMonth}>
            &laquo;
          </button>
          <button className="calendar-today-btn" onClick={goToToday}>
            Hoy
          </button>
          <button className="calendar-nav-btn" onClick={nextMonth}>
            &raquo;
          </button>
        </div>
      </div>

      <div className="calendar-grid">
        {/* Días de la semana */}
        {weekDays.map((day, index) => (
          <div key={`weekday-${index}`} className="calendar-weekday">
            {day}
          </div>
        ))}

        {/* Días del calendario */}
        {calendarDays.map((dayObj, index) => (
          <div
            key={`day-${index}`}
            className={`calendar-day ${!dayObj.isCurrentMonth ? 'calendar-day-inactive' : ''} ${
              isToday(dayObj.day, dayObj.month, dayObj.year) ? 'calendar-day-today' : ''
            } ${isSelectedDay(dayObj.day, dayObj.month, dayObj.year) ? 'calendar-day-selected' : ''}`}
            onClick={() => selectDay(dayObj.day, dayObj.month, dayObj.year)}
          >
            <span className="calendar-day-number">{dayObj.day}</span>
            {hasEvents(dayObj.day, dayObj.month, dayObj.year) && (
              <div className="calendar-day-event-indicator"></div>
            )}
          </div>
        ))}
      </div>

      {/* Eventos del día seleccionado */}
      <div className="calendar-events">
        <h4 className="calendar-events-title">
          Eventos para {selectedDate.getDate()} de {monthNames[selectedDate.getMonth()]}
        </h4>
        <div className="calendar-events-list">
          {getEventsForDay(
            selectedDate.getDate(),
            selectedDate.getMonth(),
            selectedDate.getFullYear()
          ).length > 0 ? (
            getEventsForDay(
              selectedDate.getDate(),
              selectedDate.getMonth(),
              selectedDate.getFullYear()
            ).map((event, index) => (
              <div key={`event-${index}`} className="calendar-event-item">
                <span className="calendar-event-time">
                  {event.startTime} - {event.endTime}
                </span>
                <span className="calendar-event-title">{event.title}</span>
              </div>
            ))
          ) : (
            <p className="calendar-no-events">No hay eventos para este día</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
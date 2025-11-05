import React, { useState } from "react";

const Appointments = () => {
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      doctorName: "Dr. Sarah Johnson",
      specialty: "Cardiologist",
      date: "2024-07-10",
      time: "10:00",
      location: "Heart Health Center, Room 301",
      notes: "Follow-up for blood pressure medication",
      type: "Follow-up",
    },
    {
      id: 2,
      doctorName: "Dr. Michael Chen",
      specialty: "General Practitioner",
      date: "2024-07-15",
      time: "14:30",
      location: "Main Medical Building, Room 105",
      type: "Annual Checkup",
    },
  ]);

  const [newAppointment, setNewAppointment] = useState({
    doctorName: "",
    specialty: "",
    date: "",
    time: "",
    location: "",
    notes: "",
    type: "",
  });

  const [showAddForm, setShowAddForm] = useState(false);

  const addAppointment = () => {
    const { doctorName, date, time, type } = newAppointment;

    if (!doctorName || !date || !time || !type) {
      alert("Please fill all required fields!");
      return;
    }

    const appointment = {
      id: Date.now(),
      ...newAppointment,
    };

    setAppointments([...appointments, appointment]);
    setNewAppointment({
      doctorName: "",
      specialty: "",
      date: "",
      time: "",
      location: "",
      notes: "",
      type: "",
    });
    setShowAddForm(false);
    alert("Appointment scheduled successfully!");
  };

  const deleteAppointment = (id) => {
    setAppointments(appointments.filter((a) => a.id !== id));
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const formatTime = (timeString) =>
    new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  const getTypeColor = (type) => {
    switch (type.toLowerCase()) {
      case "annual checkup":
        return "bg-green-100 text-green-800";
      case "follow-up":
        return "bg-blue-100 text-blue-800";
      case "consultation":
        return "bg-purple-100 text-purple-800";
      case "emergency":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const sortedAppointments = [...appointments].sort(
    (a, b) =>
      new Date(a.date + "T" + a.time) - new Date(b.date + "T" + b.time)
  );

  const upcomingAppointments = sortedAppointments.filter(
    (a) => new Date(a.date + "T" + a.time) > new Date()
  );
  const pastAppointments = sortedAppointments.filter(
    (a) => new Date(a.date + "T" + a.time) <= new Date()
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Doctor Appointments
        </h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          {showAddForm ? "Close" : "Schedule Appointment"}
        </button>
      </div>

      {/* Add Appointment Form */}
      {showAddForm && (
        <div className="bg-white border rounded-xl shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">
            Schedule New Appointment
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Doctor Name *"
              value={newAppointment.doctorName}
              onChange={(e) =>
                setNewAppointment({
                  ...newAppointment,
                  doctorName: e.target.value,
                })
              }
              className="p-2 border rounded-md"
            />
            <input
              type="text"
              placeholder="Specialty"
              value={newAppointment.specialty}
              onChange={(e) =>
                setNewAppointment({
                  ...newAppointment,
                  specialty: e.target.value,
                })
              }
              className="p-2 border rounded-md"
            />
            <input
              type="date"
              value={newAppointment.date}
              onChange={(e) =>
                setNewAppointment({
                  ...newAppointment,
                  date: e.target.value,
                })
              }
              className="p-2 border rounded-md"
            />
            <input
              type="time"
              value={newAppointment.time}
              onChange={(e) =>
                setNewAppointment({
                  ...newAppointment,
                  time: e.target.value,
                })
              }
              className="p-2 border rounded-md"
            />
            <input
              type="text"
              placeholder="Appointment Type *"
              value={newAppointment.type}
              onChange={(e) =>
                setNewAppointment({
                  ...newAppointment,
                  type: e.target.value,
                })
              }
              className="p-2 border rounded-md"
            />
            <input
              type="text"
              placeholder="Location"
              value={newAppointment.location}
              onChange={(e) =>
                setNewAppointment({
                  ...newAppointment,
                  location: e.target.value,
                })
              }
              className="p-2 border rounded-md"
            />
          </div>

          <textarea
            placeholder="Notes"
            value={newAppointment.notes}
            onChange={(e) =>
              setNewAppointment({ ...newAppointment, notes: e.target.value })
            }
            className="w-full p-2 border rounded-md mt-4"
            rows="3"
          ></textarea>

          <div className="flex gap-3 mt-4">
            <button
              onClick={addAppointment}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              Save
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Upcoming Appointments */}
      {upcomingAppointments.length > 0 && (
        <div className="mb-10">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            Upcoming Appointments
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingAppointments.map((a) => (
              <div
                key={a.id}
                className="border rounded-xl shadow-sm bg-white p-5 hover:shadow-md transition"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-gray-800">{a.doctorName}</h4>
                  <button
                    onClick={() => deleteAppointment(a.id)}
                    className="text-red-500 text-sm hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-sm text-gray-600 mb-1">
                  {a.specialty || "General"}
                </p>
                <p className="text-sm text-gray-700">{formatDate(a.date)}</p>
                <p className="text-sm text-gray-700">{formatTime(a.time)}</p>
                {a.location && (
                  <p className="text-sm text-gray-600 mt-1">{a.location}</p>
                )}
                <span
                  className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(
                    a.type
                  )}`}
                >
                  {a.type}
                </span>
                {a.notes && (
                  <p className="mt-3 text-xs bg-blue-50 p-2 rounded text-blue-700">
                    {a.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Past Appointments */}
      {pastAppointments.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            Past Appointments
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastAppointments.map((a) => (
              <div
                key={a.id}
                className="border rounded-xl bg-gray-50 shadow-sm p-5 opacity-80 hover:opacity-100 transition"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-gray-700">{a.doctorName}</h4>
                  <button
                    onClick={() => deleteAppointment(a.id)}
                    className="text-red-500 text-sm hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-sm text-gray-600 mb-1">
                  {a.specialty || "General"}
                </p>
                <p className="text-sm text-gray-700">{formatDate(a.date)}</p>
                <p className="text-sm text-gray-700">{formatTime(a.time)}</p>
                {a.location && (
                  <p className="text-sm text-gray-600 mt-1">{a.location}</p>
                )}
                <span
                  className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(
                    a.type
                  )}`}
                >
                  {a.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Appointments */}
      {appointments.length === 0 && (
        <div className="text-center py-12 bg-gray-100 rounded-xl border mt-6">
          <p className="text-gray-600">No appointments scheduled yet.</p>
          <p className="text-sm text-gray-500 mt-1">
            Click “Schedule Appointment” to get started.
          </p>
        </div>
      )}
    </div>
  );
};

export default Appointments;

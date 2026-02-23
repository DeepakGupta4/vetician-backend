const Appointment = require('../models/Appointment');
const { catchAsync } = require('../utils/catchAsync');

const getPatients = catchAsync(async (req, res) => {
  const veterinarianId = req.user.userId;

  const appointments = await Appointment.find({ veterinarianId })
    .sort({ date: -1 })
    .lean();

  const patientsMap = new Map();
  
  appointments.forEach(apt => {
    const key = `${apt.petName}-${apt.userId}`;
    if (!patientsMap.has(key)) {
      patientsMap.set(key, {
        id: apt._id.toString(),
        name: apt.petName,
        species: apt.petType,
        breed: apt.breed || apt.petType,
        photo: apt.petPic,
        isActive: apt.status !== 'cancelled',
        lastVisit: apt.date
      });
    }
  });

  const patients = Array.from(patientsMap.values());

  res.json({
    success: true,
    count: patients.length,
    patients
  });
});

module.exports = { getPatients };

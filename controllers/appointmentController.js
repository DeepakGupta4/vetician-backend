const Appointment = require('../models/Appointment');

exports.getVeterinarianAppointments = async (req, res) => {
  try {
    const veterinarianId = req.user._id || req.user.userId;
    
    const appointments = await Appointment.find({ veterinarianId })
      .sort({ date: -1 })
      .lean();

    res.json({
      success: true,
      appointments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments',
      error: error.message
    });
  }
};

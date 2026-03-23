const Surgery = require('../models/Surgery');

exports.getSurgeries = async (req, res) => {
  try {
    const veterinarianId = req.user._id || req.user.userId;
    const surgeries = await Surgery.find({ veterinarianId }).sort({ date: -1 });

    res.json({ success: true, surgeries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createSurgery = async (req, res) => {
  try {
    const veterinarianId = req.user._id || req.user.userId;
    const { name, date, hospital, notes } = req.body;

    const surgery = await Surgery.create({
      veterinarianId,
      name,
      date,
      hospital,
      notes
    });

    res.status(201).json({ success: true, surgery });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateSurgery = async (req, res) => {
  try {
    const { id } = req.params;
    const veterinarianId = req.user._id || req.user.userId;

    const surgery = await Surgery.findOneAndUpdate(
      { _id: id, veterinarianId },
      req.body,
      { new: true }
    );

    if (!surgery) {
      return res.status(404).json({ success: false, message: 'Surgery not found' });
    }

    res.json({ success: true, surgery });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteSurgery = async (req, res) => {
  try {
    const { id } = req.params;
    const veterinarianId = req.user._id || req.user.userId;

    const surgery = await Surgery.findOneAndDelete({ _id: id, veterinarianId });

    if (!surgery) {
      return res.status(404).json({ success: false, message: 'Surgery not found' });
    }

    res.json({ success: true, message: 'Surgery deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

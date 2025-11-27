const router = require('express').Router();
const Cut = require('../models/Cut');
const verify = require('./verifyToken');

// Get all cuts for the logged in barber
router.get('/', verify, async (req, res) => {
    try {
        const cuts = await Cut.find({ barber: req.user._id }).sort({ date: -1 });
        res.json(cuts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a new cut
router.post('/', verify, async (req, res) => {
    const cut = new Cut({
        barber: req.user._id,
        price: req.body.price,
        clientName: req.body.clientName,
        type: req.body.type,
        description: req.body.description
    });

    try {
        const savedCut = await cut.save();
        res.json(savedCut);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;

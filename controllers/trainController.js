const Train = require('../models/train');

//get all trains
const getTrains = async (req, res) => {
    try {
        const trains = await Train.find({}).populate('homeStation');
        return res.status(200).json(trains);
    } catch (err) {
        return res.status(500).json({error: err.message });
    }
};

//get single train
const getTrain = async (req, res) => {
    try {
        const train = await Train.findOne({trainId: req.params.trainId})
            .populate('homeStation');

        if (!train) return res.status(404).json({error: 'train not found'});

        return res.status(200).json(train);
    } catch (err) {
        return res.status(500).json({error: err.message});
    }
};

// create a train
const createTrain = async (req, res) => {
    try {
        const {
            trainId,
            model,
            capacity,
            availableSeats,
            status,
            homeStation
        } = req.body;

        if (
            !trainId ||
            !model ||
            !capacity ||
            availableSeats === undefined ||
            !status
        ) {
            return res.status(400).json({error: 'missing required fields'});
        }
        const train = new Train({
            trainId,
            model,
            capacity,
            availableSeats,
            status,
            homeStation,
            delayMinutes: 0 // initial delay set to 0
        });

        await train.save();
        return res.status(201).json(train);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// set delay when the train is running late
const setDelay = async (req, res) => {
    try {
        const { delayMinutes } = req.body;

        if (delayMinutes === undefined || delayMinutes < 0) {
            return res.status(400).json({
                error: 'delay must be a non-negative number'
            });
        }

        const train = await Train.findOneAndUpdate(
            { trainId: req.params.trainId },
            {
                $set: {
                    delayMinutes,
                    status: 'operational'
                }
            },
            { new: true }
        );

        if (!train) return res.status(404).json({error: 'train not found'});

        return res.status(200).json({
            message: `delay set to ${delayMinutes} minutes`,
            train
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};


//update status
const updateStatus = async (req, res) => {
    try {
        const {status} = req.body;

        const train = await Train.findOneAndUpdate(
            {trainId: req.params.trainId },
            {$set: {status}},
            {new: true}
        );

        if (!train) return res.status(404).json({error: 'train not found'});

        return res.status(200).json(train);
    } catch (err) {
        return res.status(500).json({error: err.message});
    }
};

module.exports = {
    getTrains,
    getTrain,
    createTrain,
    setDelay,
    updateStatus
};

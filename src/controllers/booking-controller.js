const {BookingService} = require('../services');
const {StatusCodes} = require('http-status-codes');
const {SuccessResponse, ErrorResponse} = require('../utils/common');

async function createBooking(req, res) {
    try {

        console.log("body", req.body);

        const response = await BookingService.createBooking({
            flightId: req.body.flightId,
            userId: req.body.userId,
            noofSeats: req.body.noofSeats
        });

        return res.status(201).json({
            success: true,
            message: "Booking successful",
            data: response
        });

    } catch (error) {

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message,
            error: error
        });

    }
}
         

module.exports = {
    createBooking
}


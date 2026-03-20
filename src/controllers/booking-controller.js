const {BookingService} = require('../services');
const {StatusCodes} = require('http-status-codes');
const AppError = require('../utils/errors/app-error');
const {SuccessResponse, ErrorResponse} = require('../utils/common');
const inMemoryDb = {};

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

async function makePayment(req, res) {
    try {

        console.log("body", req.body);
        const idempotencyKey = req.headers['x-idempotency-key'];
        if(!idempotencyKey || inMemoryDb[idempotencyKey]){
            throw new AppError(
                'Idempotency key is missing or already used',
                StatusCodes.BAD_REQUEST
            );
        }
        const response = await BookingService.makePayment({
            bookingId: req.body.bookingId,
            userId: req.body.userId,
            totalCost: req.body.totalCost
        });
        inMemoryDb[idempotencyKey] = idempotencyKey; // Store the key to prevent future duplicates

        return res.status(201).json({
            success: true,
            message: "Booking successful",
            data: response
        });

    } catch (error) {

       return res.status(error.statusCode || 500).json({
    success: false,
    message: error.message,
    error: {
        explanation: error.explanation || [],
    }
});

    }
}

module.exports = {
    createBooking,
    makePayment
}


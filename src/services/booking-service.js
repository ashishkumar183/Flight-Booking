const axios = require('axios');
const { StatusCodes } = require('http-status-codes');

const { BookingRepository } = require('../repositories');
const { ServerConfig } = require('../config');
const db = require('../models');
const AppError = require('../utils/errors/app-error');

const bookingRepository = new BookingRepository();


async function createBooking(data) {
    console.log("Incoming data:", data);
    const transaction = await db.sequelize.transaction();

    try {
        const flight = await axios.get(
            `${ServerConfig.FLIGHT_API_URL}/api/v1/flights/${data.flightId}`
        );

        const flightData = flight.data.data;

        if (data.noofSeats > flightData.totalSeats) {
            throw new AppError(
                'Not enough seats available',
                StatusCodes.BAD_REQUEST
            );
        }

        const totalBillingAmount = data.noofSeats * flightData.price;

        const bookingPayLoad = {
            flightId: data.flightId,
            userId: data.userId,
            noOfSeats: data.noofSeats,
            totalCost: totalBillingAmount
        };

        const booking = await bookingRepository.createBooking(
            bookingPayLoad,
            transaction
        );

        await axios.patch(
            `${ServerConfig.FLIGHT_API_URL}/api/v1/flights/${data.flightId}/seats`,
            {
                seats: data.noofSeats,
                dec: 1
            }
        );

        await transaction.commit();

        return booking;

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}

module.exports = {
    createBooking
};
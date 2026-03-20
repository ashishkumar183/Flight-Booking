const axios = require('axios');
const { StatusCodes } = require('http-status-codes');
const { Op } = require('sequelize');
const { BookingRepository } = require('../repositories');
const { ServerConfig } = require('../config');
const db = require('../models');
const AppError = require('../utils/errors/app-error');
const {Enums} = require('../utils/common');
const {CONFIRMED,CANCELLED,INITIATED,PENDING} = Enums.BOOKING_STATUS;

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

async function makePayment(data){
    const transaction = await db.sequelize.transaction();
    try {
        const bookingDetails = await bookingRepository.get(data.bookingId, transaction);

        if(bookingDetails.status === CANCELLED){
            throw new AppError(
                'The booking has been cancelled. Cannot make payment for a cancelled booking.',
                StatusCodes.BAD_REQUEST
            );
        }

        const bookingTime = new Date(bookingDetails.createdAt);
        const currentTime = new Date();
        const timeDifference = (currentTime - bookingTime)
        if(timeDifference > 10 * 60 * 1000){ // 10 minutes
            await cancelBooking({ bookingId: data.bookingId });
            throw new AppError(
                'The booking has been cancelled due to non-payment within the stipulated time.',
                StatusCodes.BAD_REQUEST
            );
        }

        if(bookingDetails.totalCost !== Number(data.totalCost)){
            throw new AppError(
                'The amount of payment is not correct',
                StatusCodes.BAD_REQUEST
            );
        }

        if(bookingDetails.userId !== Number(data.userId)){
            throw new AppError(
                'User not authorized to make payment',
                StatusCodes.UNAUTHORIZED
            );
        }
        // We assume the payment is successful and update the booking status to CONFIRMED
        const response = await bookingRepository.update(data.bookingId, {status: CONFIRMED}, transaction);
        await transaction.commit();
        return response;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }       
}

async function cancelBooking(data){
    const transaction = await db.sequelize.transaction();
    try {
        const bookingDetails = await bookingRepository.get(data.bookingId, transaction);

        console.log("Booking details in cancellation", bookingDetails);

        if(bookingDetails.status === CANCELLED){
            await transaction.commit();
            return true;
        }

        await axios.patch(
            `${ServerConfig.FLIGHT_API_URL}/api/v1/flights/${bookingDetails.flightId}/seats`,
            {
                seats: bookingDetails.noOfSeats,
                dec : 0
            }
        );

        await bookingRepository.update(
            data.bookingId,
            {status: CANCELLED},
            transaction
        );

        await transaction.commit();
        return true;

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}

async function cancelOldBookings(){
    try {
        const time = new Date(Date.now() - 10 * 60 * 1000); // 10 mins ago

        const oldBookings = await bookingRepository.getAll({
            createdAt: {
                [Op.lt]: time
            },
            status: {
    [Op.in]: [PENDING, INITIATED]
}
        });

        await Promise.all(
    oldBookings.map(booking =>
        cancelBooking({ bookingId: booking.id })
    )
);

        return oldBookings;

    } catch (error) {
        console.log("Error in cancelling old bookings", error);
        throw error;
    }
}

module.exports = {
    createBooking,
    makePayment,
    cancelBooking,
    cancelOldBookings
};
const axios = require('axios');
const db = require('../models');
const { BookingRepository } = require('../repositories');
const { ServerConfig } = require('../config');
const { StatusCodes } = require('http-status-codes');
const AppError = require('../utils/errors/app-error');

async function createBooking(data) {
    console.log("Calling seat update API...");
    console.log("Sending params:", {
    seats: data.noofSeats,
    dec: 1
});
    await axios.patch(
  `${ServerConfig.FLIGHT_API_URL}/api/v1/flights/${data.flightId}/seats`,
  {
    seats: data.noofSeats,
    dec: 1
  }
);

    return {
        flightId: data.flightId,
        seatsBooked: data.noofSeats,
        status: "CONFIRMED"
    };
}



module.exports = {
    createBooking
};

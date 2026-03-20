const {StatusCodes} = require('http-status-codes');
const AppError = require('../utils/errors/app-error');
const {Op} = require('sequelize');
const {Booking} = require('../models');
const CrudRepository = require('./crud-repository');
const { Enums } = require('../utils/common');
const { PENDING } = Enums.BOOKING_STATUS;

class BookingRepository extends CrudRepository{
    constructor(){
        super(Booking);
    }
    
    async createBooking(data, transaction) {
        const response = await Booking.create(data, {transaction: transaction});
        return response;
       
    }

    async get(id, transaction){
    const response = await this.model.findByPk(id, { transaction });
    if(!response){
        throw new AppError('Not able to find the resource', StatusCodes.NOT_FOUND);
    }
    return response;
}

async getAll(filter) {
    return await Booking.findAll({
        where: filter
    });
}

async update(id, data, transaction){
    const response = await this.model.update(data, {
        where: { id },
        transaction
    });
    return response;
}

async cancelOldBookings(timestamp){
    return await this.model.findAll({
        where: {
            createdAt: { [Op.lt]: timestamp },
            status: PENDING
        }
    });
}
}

module.exports = BookingRepository;
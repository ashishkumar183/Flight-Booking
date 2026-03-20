const cron = require('node-cron');

function scheduleCrons() {
    cron.schedule('*/30 * * * *', async () => {
        console.log('Running cron job to cancel old bookings...');
        
        const BookingService = require('../../services/booking-service'); 
        
        const response = await BookingService.cancelOldBookings();
        
        console.log("Cancelled bookings:", response.length);
    });
}

module.exports = scheduleCrons;
const Config = require('../models/Config');
const logger = require('../config/logger');

module.exports = {
  // addMarkup will modify the hotelPackage data with latest markup
  addMarkup: async (hotelPackage) => {
    if (!hotelPackage) {
      const err = 'No hotel package found to apply markup at markupService.js';
      logger.error(err);
      throw new Error(err);
    }

    let baseAmount = hotelPackage.chargeable_rate;
    let config = await Config.findOne({});

    if (!config || !config.markup) {
      logger.info('Cannot find any document in the config collection. at markupService.js');
      return;
    }

    try {
      // Calculate base amount with markup
      if (baseAmount > 0 && config.markup.value > 0) {
        let markup = 0;
        if (config.markup.type === 'percentage') {
          markup = (config.markup.value / 100) * baseAmount;
        } else if (config.markup.type === 'fixed') {
          markup = config.markup.value;
        }
        
        // First add base amount and markup
        baseAmount = baseAmount + markup;
        
        // Then apply 18% GST on the total
        const hotelGst = (18 / 100) * baseAmount;
        baseAmount = baseAmount + hotelGst;

        // Calculate service component
        let serviceComponent = 0;
        if (config.service_charge.value > 0) {
          if (config.service_charge.type === 'percentage') {
            serviceComponent = (config.service_charge.value / 100) * baseAmount;
          } else if (config.service_charge.type === 'fixed') {
            serviceComponent = config.service_charge.value;
          }
        }

        // Add processing fee to service component
        if (config.processing_fee > 0) {
          serviceComponent += config.processing_fee;
        }

        // Apply GST on service component
        const serviceGst = (18 / 100) * serviceComponent;
        serviceComponent = serviceComponent + serviceGst;

        // Update hotel package with new values
        hotelPackage.base_amount = +baseAmount.toFixed(2);
        hotelPackage.service_component = +serviceComponent.toFixed(2);
        hotelPackage.gst = +(hotelGst + serviceGst).toFixed(2);
        hotelPackage.chargeable_rate = +(baseAmount + serviceComponent).toFixed(2);
      }
    } catch (err) {
      logger.error('Error in markup calculation:', err);
      throw new Error('Error in markup calculation');
    }
  },

  getMarkup: async () => {
    const config = await Config.findOne({});
    if (!config || !config.markup) {
      throw new Error('Cannot find any document in the config collection. at markupService.js');
    }
    return config.markup;
  }
};
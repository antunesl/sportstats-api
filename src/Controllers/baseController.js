var responseModel = require('./Response.js'),
    logger = require('../Logger.js');

class BaseController {
    
    constructor(){
        
    }

    

    handleError(error) {
        logger.error(error);
        // this.endAction();
        // return responseModel.errorResponse(err);
    }

    returnOk(data) {
        //endAction();
        logger.debug(data);
        return responseModel.successResponse(data);
    }
}

module.exports = BaseController

 var response = {
	successResponse: function () {
        return {
            success: true
        };
     },
     
     successResponse: function (resultObj) {
        return {
            success: true,
            result: resultObj
        };
     },

     successResponse: function (resultObj, message) {
        return {
            success: true,
            result: resultObj,
            message: message
        };
     },
    
     errorResponse: function (message) {
        return {
            success: false,
            message: message
        };
     }
};

module.exports = response;
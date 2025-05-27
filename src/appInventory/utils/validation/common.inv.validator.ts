    import Joi from "joi";

    class CommonInvValidator {

    //=================== Common Modules ======================//

    // create Common validation
    public createCommonModuleValidator = Joi.object({
        name: Joi.string().required(),
    });

    // get all Common query validator
    public getAllCommonModuleQueryValidator = Joi.object({
        limit: Joi.string().allow("").optional(),
        skip: Joi.string().allow("").optional(),
        name: Joi.string().allow("").optional(),
        status: Joi.string().allow("").optional(),
    });

    // update Common validation
    public UpdateCommonModuleValidator = Joi.object({
        name: Joi.string().allow("").optional(),
        status: Joi.number().valid(0,1).optional(),
    });

    //=================== Supplier ======================//

    // create Supplier validation
    public createSupplierValidatorValidator = Joi.object({
        name: Joi.string().uppercase().required(),
        phone: Joi.number().allow("").optional(),
    });

    // get all Supplier query validator
    public getAllSupplierQueryValidator = Joi.object({
        limit: Joi.string().allow("").optional(),
        skip: Joi.string().allow("").optional(),
        name: Joi.string().allow("").optional(),
        status: Joi.string().allow("").optional(),
    });

    // update Supplier validation
    public UpdateSupplierValidator = Joi.object({
        name: Joi.string().allow("").optional(),
        phone: Joi.number().allow("").optional(),
        status: Joi.number().allow("").optional(),
    });

    }
    export default CommonInvValidator;
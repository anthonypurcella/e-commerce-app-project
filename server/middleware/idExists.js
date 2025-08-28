import idCheck from "../../utils/idCheck.js";

export default async function idExists(req, res, next) {
    try {
        const exists = await idCheck(req.resourceType, req.params.id);  
        if (!exists) {
            return res.status(404).send(`${req.resourceType} with id ${req.params.id} not found`);
        }
        next();
    } catch (err) {
        res.status(500).send(`Server error during ID check: ${err.message}`);
    }
};
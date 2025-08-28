export default function baseURLExtract(req, res, next) {
    req.resourceType = req.originalUrl.split("/")[1];
    next();
};
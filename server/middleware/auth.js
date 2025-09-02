import jwt from 'jsonwebtoken';

export function authenticateToken(req, res, next) {
    const token = req.cookies.authToken;

    if (!token) {
        res.status(401).send('Access denied');
    }

    try {
        const decodedUsername = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decodedUsername;
        next();
    } catch (err) {
        res.status(403).send('Invalid token');
    }
};
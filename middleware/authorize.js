const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
    try {

        const token = req.headers.authorization.split(" ")[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {

            req["user"] = {
                id: decoded.id,
                username: decoded.username
            };
        });
        next();
    } catch (error) {
        return res.status(401).json({
            message: 'Auth failed, try again...'
        })
    }
}
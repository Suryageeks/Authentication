const jwt = require('jsonwebtoken')


const auth = (req, res, next) => {
    console.log(req.cookies);
    //searching for token
    const token =
        req.cookies.token ||
        req.body.token ||
        req.header('Authorization').replace('Bearer ', '') 


    if (!token) {
        return res.status(403).send('token is missing')
    }

    try {
        const decode = jwt.verify(token, process.env.SECRET_KEY)
        console.log(decode)
        req.user = decode
        //optional : bring info from DB
    }
    catch (error) {
        return res.status(401).send('Invalid token')
    }
    return next();
}

module.exports = auth

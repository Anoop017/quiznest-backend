import jwt from "jsonwebtoken"

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1]

    if (!token) {
        return res.status(401).json({ message: "No Token, Authorization Denied" })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)//to verify the token
        req.user = decoded
        next();
    } catch (err) {
        res.status(403).json({ message: "Token is not Valid" })

    }



}


export default authMiddleware;
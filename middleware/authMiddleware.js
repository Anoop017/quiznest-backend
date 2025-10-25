import jwt from "jsonwebtoken"

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers["authorization"]
    
    // Debug logging (remove after fixing)
    console.log("Auth Header:", authHeader);
    console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET);
    
    const token = authHeader && authHeader.split(" ")[1]

    if (!token) {
        console.log("No token found in request");
        return res.status(401).json({ message: "No Token, Authorization Denied" })
    }

    try {
        // Verify JWT_SECRET is set
        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is not set!");
            return res.status(500).json({ message: "Server configuration error" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        console.log("Token decoded successfully:", decoded);
        
        req.user = decoded
        next();
    } catch (err) {
        console.error("Token verification error:", err.message);
        
        // More specific error messages
        if (err.name === 'TokenExpiredError') {
            return res.status(403).json({ message: "Token has expired" });
        }
        if (err.name === 'JsonWebTokenError') {
            return res.status(403).json({ message: "Token is invalid" });
        }
        
        res.status(403).json({ message: "Token is not Valid" })
    }
}

export default authMiddleware;
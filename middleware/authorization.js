import jwt from "jsonwebtoken";

function authenticateToken(req, res, next) {
  // Prvo pokušaj iz cookies (novi način)
  let token = req.cookies?.access_token;

  // Fallback: ako nema u cookies, pokušaj iz header-a (stari način)
  if (!token) {
    const authHeader = req.headers["authorization"];
    token = authHeader && authHeader.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, user) => {
    if (error) {
      return res.status(401).json({ error: "Invalid or expired access token" });
    }
    req.user = user;
    next();
  });
}

export { authenticateToken };

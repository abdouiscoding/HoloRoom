package HoloRoom.Security;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import javax.crypto.SecretKey;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

import org.springframework.stereotype.Component;
import HoloRoom.Model.User;

@Component
public class JwtUtil {

    private final SecretKey key = Keys.hmacShaKeyFor(
        "mysecretkeymysecretkeymysecretkey".getBytes()
    );

    private final long EXPIRATION = 1000 * 60 * 60;

    public String generateToken(User user) {

        Map<String, Object> claims = new HashMap<>();
        claims.put("userRole", user.getUserRole());

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(user.getUserName()) 
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public String extractName(String token) {
        return extractAllClaims(token).getSubject();
    }

    public String extractRole(String token) {
        return extractAllClaims(token).get("userRole", String.class);
    }
}
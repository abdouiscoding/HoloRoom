package HoloRoom.Security;

import java.io.IOException;

import jakarta.servlet.*;
import jakarta.servlet.http.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class JwtFilter extends GenericFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse res = (HttpServletResponse) response;

        String authHeader = req.getHeader("Authorization");

        // Only validate token if it's provided
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);

            try {
                String userName = jwtUtil.extractName(token);
                String userRole = jwtUtil.extractRole(token);

                // Attach user info
                req.setAttribute("userName", userName);
                req.setAttribute("userRole", userRole);

            } catch (Exception e) {
                e.printStackTrace();
                res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                res.getWriter().write("Invalid token");
                return;
            }
        }
        // If no header provided, just continue - let Spring Security decide if auth is required

        chain.doFilter(request, response);
    }
}
package HoloRoom.Config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import HoloRoom.Security.JwtFilter;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtFilter jwtFilter;

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
            // ✅ IMPORTANT FIX: explicitly attach CORS config
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            .csrf(csrf -> csrf.disable())

            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            .formLogin(form -> form.disable())
            .httpBasic(basic -> basic.disable())

            .authorizeHttpRequests(auth -> auth

                // ================= PUBLIC =================
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/products/get/**").permitAll()
                .requestMatchers("/api/reviews/all").permitAll()
                .requestMatchers("/api/uploads/**").permitAll()

                // ================= ADMIN ONLY =================
                .requestMatchers("/api/users/**").hasRole("ADMIN")
                .requestMatchers("/api/products/**").hasRole("ADMIN")
                .requestMatchers("/api/cart/**").hasRole("ADMIN")
                .requestMatchers("/api/categories/**").hasRole("ADMIN")

                // ================= USER + ADMIN =================
                .requestMatchers("/api/users/getname/**").hasAnyRole("USER","ADMIN")
                .requestMatchers("/api/cartitem/**").hasAnyRole("USER","ADMIN")
                .requestMatchers("/api/orders/**").hasAnyRole("USER","ADMIN")
                .requestMatchers("/api/reviews/**").hasAnyRole("USER","ADMIN")
                .requestMatchers("/api/wishlist/**").hasAnyRole("USER","ADMIN")
                .requestMatchers("/api/chat/**").hasAnyRole("USER","ADMIN")

                // fallback
                .anyRequest().authenticated()
            )

            // JWT filter
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(List.of(
            "http://localhost:5173",
            "http://192.168.1.10:5173",
            "https://control-parole-grandkid.ngrok-free.dev"
        ));

        config.setAllowedMethods(List.of(
            "GET", "POST", "PUT", "DELETE", "OPTIONS"
        ));

        config.setAllowedHeaders(List.of("*"));

        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
            new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", config);

        return source;
    }
}
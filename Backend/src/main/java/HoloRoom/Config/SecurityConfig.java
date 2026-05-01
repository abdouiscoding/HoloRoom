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
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())

            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            .formLogin(form -> form.disable())
            .httpBasic(basic -> basic.disable())

            .authorizeHttpRequests(auth -> auth

                // =====================================
                // PUBLIC
                // =====================================
                .requestMatchers("/api/users/**").permitAll()
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/products/get/**").permitAll()
                .requestMatchers("/api/reviews/all").permitAll()
                .requestMatchers("/api/uploads/**").permitAll()
                .requestMatchers("/api/users/update/passwordcode/**").permitAll()
                .requestMatchers("/api/users/getbyinfo/**").permitAll()

                // EMAIL CODE APIs
                .requestMatchers("/api/users/send-code/**").hasAnyRole("USER","ADMIN")
                .requestMatchers("/api/users/verify-code/**").hasAnyRole("USER","ADMIN")

                // =====================================
                // USER + ADMIN
                // =====================================
                //.requestMatchers("/api/users/get/{id}").hasAnyRole("USER","ADMIN")

                .requestMatchers("/api/users/update/**").hasAnyRole("USER","ADMIN")
                .requestMatchers("/api/users/update/name/**").hasAnyRole("USER","ADMIN")
                .requestMatchers("/api/users/update/email/**").hasAnyRole("USER","ADMIN")
                .requestMatchers("/api/users/update/passwordcode/**").hasAnyRole("USER","ADMIN")
                .requestMatchers("/api/users/update/emailcode/**").hasAnyRole("USER","ADMIN")
                .requestMatchers("/api/users/update/password/**").hasAnyRole("USER","ADMIN")
                .requestMatchers("/api/users/update/shipping/**").hasAnyRole("USER","ADMIN")
                .requestMatchers("/api/users/update/image/**").hasAnyRole("USER","ADMIN")

                .requestMatchers("/api/cart/**").hasAnyRole("USER","ADMIN")
                .requestMatchers("/api/cartitem/**").hasAnyRole("USER","ADMIN")
                .requestMatchers("/api/orders/**").hasAnyRole("USER","ADMIN")
                .requestMatchers("/api/reviews/**").hasAnyRole("USER","ADMIN")
                .requestMatchers("/api/wishlist/**").hasAnyRole("USER","ADMIN")
                .requestMatchers("/api/chat/**").hasAnyRole("USER","ADMIN")

                // =====================================
                // ADMIN ONLY
                // =====================================
                .requestMatchers("/api/users/get").hasRole("ADMIN")
                .requestMatchers("/api/users/delete/**").hasRole("ADMIN")

                .requestMatchers("/api/products/**").hasRole("ADMIN")
                .requestMatchers("/api/categories/**").hasRole("ADMIN")

                // =====================================
                // FALLBACK
                // =====================================
                .anyRequest().authenticated()
            )

            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(List.of(
            "http://localhost:5173",
            "http://192.168.1.6:5173",
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
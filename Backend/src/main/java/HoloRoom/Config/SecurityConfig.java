package HoloRoom.Config;

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

import org.springframework.beans.factory.annotation.Autowired;


@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Autowired
    private JwtFilter jwtFilter;
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

    http
        .cors(cors -> {})
        .csrf(csrf -> csrf.disable())

        .sessionManagement(session ->
            session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
        )

        .formLogin(form -> form.disable())
        .httpBasic(basic -> basic.disable())

        .authorizeHttpRequests(auth -> auth

    // public routes
        .requestMatchers("/api/auth/**").permitAll()

    // admin only
        .requestMatchers("/api/users/**").hasRole("ADMIN")
        .requestMatchers("/api/products/**").hasRole("ADMIN")
        .requestMatchers("/api/cart/getbyuser/**").hasRole("ADMIN")
        .requestMatchers("/api/cart/delete/**").hasRole("ADMIN")
        .requestMatchers("/api/categories/**").hasRole("ADMIN")

    // user + admin
        .requestMatchers("/api/products/get/**").hasAnyRole("USER", "ADMIN")
        .requestMatchers("/api/cart/getbyuser/**").hasAnyRole("USER", "ADMIN")
        .requestMatchers("/api/cartitem/**").hasAnyRole("USER", "ADMIN")
        .requestMatchers("/api/orders/**").hasAnyRole("USER", "ADMIN")
        .requestMatchers("/api/reviews/**").hasAnyRole("USER", "ADMIN")
        .requestMatchers("/api/wishlist/**").hasAnyRole("USER", "ADMIN")

    // user only
        .requestMatchers("/api/cart/additem/**").hasRole("USER")
        .requestMatchers("/api/cart/removeitem/**").hasRole("USER")

    // everything else locked
        .anyRequest().authenticated()
    )

        .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

    return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

    CorsConfiguration config = new CorsConfiguration();

    config.setAllowedOrigins(List.of("http://localhost:5173"));
    config.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS"));
    config.setAllowedHeaders(List.of("*"));
    config.setAllowCredentials(true);

    UrlBasedCorsConfigurationSource source =
        new UrlBasedCorsConfigurationSource();

    source.registerCorsConfiguration("/**", config);

    return source;
    }

}
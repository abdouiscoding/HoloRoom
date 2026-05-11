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
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/products/get/**").permitAll()
                .requestMatchers("/api/reviews/all").permitAll()
                .requestMatchers("/api/uploads/**").permitAll()
                .requestMatchers("/api/users/getbyinfo/**").permitAll()
                .requestMatchers("/api/users/passwordcode/**").permitAll()
                .requestMatchers("/api/users/update/emailcode/**").permitAll()
                .requestMatchers("/api/discounts/active").permitAll()
                .requestMatchers("/api/users/update/email/**").permitAll()
                .requestMatchers("/api/users/update/password/**").permitAll()

                // EMAIL CODE APIs
                .requestMatchers("/api/users/send-code/**").hasAnyRole("USER","ADMIN","MARKETING_MANAGER", "PRODUCT_MANAGER")
                .requestMatchers("/api/users/verify-code/**").hasAnyRole("USER","ADMIN","MARKETING_MANAGER", "PRODUCT_MANAGER")
                .requestMatchers("/api/users/emailcode/**").hasAnyRole("USER","ADMIN","MARKETING_MANAGER", "PRODUCT_MANAGER")

                // =====================================
                // EVERYONE
                // =====================================
                //.requestMatchers("/api/users/get/{id}").hasAnyRole("USER","ADMIN")

                //ai
                .requestMatchers("/api/chat").permitAll()
                .requestMatchers("/api/chat/**").permitAll()

                // =====================================
                // USER UPDATES
                // =====================================
                .requestMatchers("/api/users/update/name/**").hasAnyRole("USER","ADMIN", "MARKETING_MANAGER", "PRODUCT_MANAGER")
                .requestMatchers("/api/users/update/shipping/**").hasAnyRole("USER","ADMIN", "MARKETING_MANAGER", "PRODUCT_MANAGER")
                .requestMatchers("/api/users/update/image/**").hasAnyRole("USER","ADMIN", "MARKETING_MANAGER", "PRODUCT_MANAGER")

                //change when done with app
                .requestMatchers("/api/cart/**").hasAnyRole("USER","ADMIN", "MARKETING_MANAGER", "PRODUCT_MANAGER")
                .requestMatchers("/api/cartitem/**").hasAnyRole("USER","ADMIN", "MARKETING_MANAGER", "PRODUCT_MANAGER")
                .requestMatchers("/api/orders/**").hasAnyRole("USER","ADMIN", "MARKETING_MANAGER", "PRODUCT_MANAGER")
                .requestMatchers("/api/reviews/**").hasAnyRole("USER","ADMIN", "MARKETING_MANAGER", "PRODUCT_MANAGER")
                .requestMatchers("/api/wishlist/**").hasAnyRole("USER","ADMIN", "MARKETING_MANAGER", "PRODUCT_MANAGER")

                // =====================================
                // PRODUCT MANAGER
                // =====================================
                .requestMatchers("/api/products/**")
                    .hasAnyRole("PRODUCT_MANAGER", "ADMIN")
                .requestMatchers("/api/categories/**")
                    .hasAnyRole("PRODUCT_MANAGER", "ADMIN")
                .requestMatchers("/api/products/delete/**")
                    .hasAnyRole("PRODUCT_MANAGER", "ADMIN")

                // =====================================
                // MARKETING MANAGER
                // =====================================
                .requestMatchers("/api/marketing/**")
                    .hasAnyRole("MARKETING_MANAGER", "ADMIN")
                .requestMatchers("/api/discounts/**")
                    .hasAnyRole("MARKETING_MANAGER", "ADMIN")
                .requestMatchers("/api/featured")
                    .hasAnyRole("MARKETING_MANAGER", "ADMIN")


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
        "https://holoroom-ar.vercel.app",
        "https://holoroom-front.vercel.app"
    ));

    config.setAllowedMethods(List.of(
        "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"
    ));

    config.setAllowedHeaders(List.of("*"));

    config.setExposedHeaders(List.of("*"));

    config.setAllowCredentials(true);

    UrlBasedCorsConfigurationSource source =
        new UrlBasedCorsConfigurationSource();

    source.registerCorsConfiguration("/**", config);

    return source;
}
}
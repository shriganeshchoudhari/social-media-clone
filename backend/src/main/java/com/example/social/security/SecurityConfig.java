package com.example.social.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import jakarta.servlet.Filter;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

        private final JwtAuthenticationFilter jwtAuthenticationFilter;
        private final RestAuthenticationEntryPoint authenticationEntryPoint;
        private final RestAccessDeniedHandler accessDeniedHandler;

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

                http
                                .cors(withDefaults())
                                .csrf(csrf -> csrf.disable())
                                .headers(headers -> headers
                                                .contentSecurityPolicy(
                                                                csp -> csp.policyDirectives("default-src 'self'"))
                                                .frameOptions(frame -> frame.deny())
                                                .xssProtection(xss -> xss.disable()))
                                .formLogin(form -> form.disable())
                                .httpBasic(basic -> basic.disable())

                                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                                .exceptionHandling(ex -> ex
                                                .authenticationEntryPoint(authenticationEntryPoint) // 401
                                                .accessDeniedHandler(accessDeniedHandler) // 403
                                )

                                .authorizeHttpRequests(auth -> auth
                                                .requestMatchers("/api/auth/**").permitAll()
                                                .requestMatchers(HttpMethod.OPTIONS, "/**")
                                                .permitAll()
                                                // Explicit protected APIs
                                                .requestMatchers("/api/posts/**").hasRole("USER")
                                                .requestMatchers("/api/likes/**").hasRole("USER")
                                                .requestMatchers("/api/comments/**").hasRole("USER")
                                                .requestMatchers("/api/follows/**").hasRole("USER")
                                                .requestMatchers("/api/users/**").hasRole("USER")
                                                .anyRequest().authenticated()) // -> .anyRequest().authenticated()
                                .addFilterBefore(
                                                jwtAuthenticationFilter,
                                                UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }

        @Bean
        public FilterRegistrationBean<Filter> rateLimitFilter() {
                Filter filter = new RateLimitFilter();
                FilterRegistrationBean<Filter> reg = new FilterRegistrationBean<>();
                reg.setFilter(filter);
                reg.addUrlPatterns("/api/auth/login");
                return reg;
        }
}

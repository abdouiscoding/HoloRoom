package HoloRoom.Config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/**",
                "file:C:/Users/abder/Desktop/HoloRoom/Backend/src/main/java/HoloRoom/Uploads/Uimages/",
                "file:C:/Users/abder/Desktop/HoloRoom/Backend/src/main/java/HoloRoom/Uploads/Pimages/",
                "file:C:/Users/abder/Desktop/HoloRoom/Backend/src/main/java/HoloRoom/Uploads/Pmodels/"
                );
    }
}
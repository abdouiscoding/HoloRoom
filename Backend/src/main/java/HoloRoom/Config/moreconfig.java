package HoloRoom.Config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class moreconfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        registry.addResourceHandler("/api/uploads/uimages/**")
            .addResourceLocations(
                "file:C:/Users/abder/Desktop/HoloRoom/Backend/src/main/java/HoloRoom/Uploads/Uimages/"
            );
    }
}
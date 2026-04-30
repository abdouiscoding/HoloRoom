package HoloRoom.Controller;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/uploads")
@CrossOrigin("*")
public class UploadsController {

    private final Path imageFolder = Paths.get(
        "C:/Users/abder/Desktop/HoloRoom/Backend/src/main/java/HoloRoom/Uploads/Pimages"
    );

    private final Path modelFolder = Paths.get(
        "C:/Users/abder/Desktop/HoloRoom/Backend/src/main/java/HoloRoom/Uploads/Pmodels"
    );

    @GetMapping("/images/{filename:.+}")
    public ResponseEntity<Resource> getImage(
            @PathVariable String filename) {
        return serveFile(imageFolder, filename);
    }

    @GetMapping("/models/{filename:.+}")
    public ResponseEntity<Resource> getModel(
            @PathVariable String filename) {
        return serveFile(modelFolder, filename);
    }

    private ResponseEntity<Resource> serveFile(
            Path folder,
            String filename) {

        try {
            Path filePath =
                folder.resolve(filename).normalize();

            Resource resource =
                new UrlResource(filePath.toUri());

            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }

            String type =
                Files.probeContentType(filePath);

            if (type == null) {
                type =
                    "application/octet-stream";
            }

            return ResponseEntity.ok()
                .contentType(
                    MediaType.parseMediaType(type))
                .header(
                    HttpHeaders.CONTENT_DISPOSITION,
                    "inline; filename=\"" +
                    resource.getFilename() + "\"")
                .body(resource);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .build();
        }
    }
}
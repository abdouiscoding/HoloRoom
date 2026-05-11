package HoloRoom.Service;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

@Service
public class SupabaseStorageService {

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.key}")
    private String supabaseKey;

    private final WebClient webClient = WebClient.create();

    public String uploadFile(MultipartFile file, String bucketName) throws IOException {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("No file uploaded.");
        }

        String contentType = file.getContentType();

        if (contentType == null) {
            throw new IllegalArgumentException("Could not determine file type.");
        }

        // =========================
        // FIX GLB MIME TYPE
        // =========================
        if (contentType.equals("application/octet-stream")) {

            String filename = file.getOriginalFilename();

            if (filename != null && filename.toLowerCase().endsWith(".glb")) {
                contentType = "model/gltf-binary";
            }
        }

        // =========================
        // ALLOWED TYPES
        // =========================
        List<String> allowedTypes = List.of(
            "image/png",
            "image/jpeg",
            "image/webp",
            "model/gltf-binary",
            "model/gltf+json"
        );

        if (!allowedTypes.contains(contentType)) {
            throw new IllegalArgumentException(
                "Invalid file type: " + contentType
            );
        }

        String fileName =
            UUID.randomUUID() + "-" + file.getOriginalFilename();

        try {

            webClient.put()
                .uri(
                    supabaseUrl +
                    "/storage/v1/object/" +
                    bucketName +
                    "/" +
                    fileName
                )
                .header("apikey", supabaseKey)
                .header("Authorization", "Bearer " + supabaseKey)
                .contentType(MediaType.parseMediaType(contentType))
                .bodyValue(file.getBytes())
                .retrieve()
                .bodyToMono(String.class)
                .block();

        } catch (WebClientResponseException ex) {

            throw new RuntimeException(
                "Supabase upload failed (" +
                ex.getRawStatusCode() +
                "): " +
                ex.getResponseBodyAsString(),
                ex
            );

        } catch (Exception ex) {

            throw new RuntimeException(
                "Supabase upload failed: " + ex.getMessage(),
                ex
            );
        }

        return
            supabaseUrl +
            "/storage/v1/object/public/" +
            bucketName +
            "/" +
            fileName;
    }

    public void deleteFile(String fileUrl) {

        if (fileUrl == null || fileUrl.isBlank()) {
            return;
        }

        try {

            // extract path after /object/public/
            String path = fileUrl.substring(
                fileUrl.indexOf("/object/public/") + "/object/public/".length()
            );

            webClient.delete()
                .uri(supabaseUrl + "/storage/v1/object/" + path)
                .header("apikey", supabaseKey)
                .header("Authorization", "Bearer " + supabaseKey)
                .retrieve()
                .bodyToMono(Void.class)
                .block();

        } catch (Exception ex) {
            throw new RuntimeException(
                "Failed deleting file from Supabase: " + ex.getMessage(),
                ex
            );
        }
    }

}
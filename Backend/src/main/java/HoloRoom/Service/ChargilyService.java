package HoloRoom.Service;

import java.util.HashMap;
import java.util.Map;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class ChargilyService {

    @Value("${chargily.api.key}")
    private String apiKey;

    @Value("${chargily.api.url}")
    private String apiUrl;

    @Value("${chargily.webhook.secret:}")
    private String webhookSecret;

    public Map<String, String> createCheckout(
            Long userId,
            Long cartId,
            int couponDiscount,
            double amount,
            String successUrl,
            String failureUrl,
            String webhookUrl,
            String paymentMethod
    ) throws Exception {
        RestTemplate rest = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        // Chargily wants amount as integer DZD (no cents)
        int amountInt = (int) Math.round(amount);

        JSONObject body = new JSONObject();
        body.put("amount", amountInt);
        body.put("currency", "dzd");
        body.put("success_url", successUrl);
        body.put("failure_url", failureUrl);
        body.put("webhook_endpoint", webhookUrl);
        body.put("payment_method", paymentMethod); // "edahabia" or "cib"

        // metadata is passed back in the webhook untouched
        JSONObject metadata = new JSONObject();
        metadata.put("userId", userId.toString());
        metadata.put("cartId", cartId.toString());
        metadata.put("couponDiscount", String.valueOf(couponDiscount));
        body.put("metadata", metadata);

        HttpEntity<String> req = new HttpEntity<>(body.toString(), headers);
        ResponseEntity<String> res = rest.postForEntity(apiUrl + "/checkouts", req, String.class);
        JSONObject json = new JSONObject(res.getBody());

        Map<String, String> result = new HashMap<>();
        result.put("id", json.optString("id"));
        result.put("checkout_url", json.optString("checkout_url"));
        return result;
    }

    public boolean verifySignature(String payload, String signatureHeader) {
        if (webhookSecret == null || webhookSecret.isEmpty()) return true; // not enforced
        if (signatureHeader == null) return false;
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(webhookSecret.getBytes("UTF-8"), "HmacSHA256"));
            byte[] hash = mac.doFinal(payload.getBytes("UTF-8"));
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) sb.append(String.format("%02x", b));
            return sb.toString().equalsIgnoreCase(signatureHeader);
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}
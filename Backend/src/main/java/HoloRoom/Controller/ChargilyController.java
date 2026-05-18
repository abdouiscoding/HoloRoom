package HoloRoom.Controller;

import java.util.Map;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import HoloRoom.Service.ChargilyService;
import HoloRoom.Service.OrdersItemService;
import HoloRoom.Model.Log;
import HoloRoom.Service.LogService;

@RestController
@RequestMapping("/api/payment/chargily")
public class ChargilyController {

    @Autowired private ChargilyService chargilyService;
    @Autowired private OrdersItemService ordersItemService;
    @Autowired private LogService logService;

    @Value("${chargily.webhook.url}")
    private String webhookUrl;

    @Value("${frontend.url}")
    private String frontendUrl;

    @PostMapping("/create")
    public ResponseEntity<?> createCheckout(@RequestBody Map<String, Object> body) {
        try {
            Long userId = Long.valueOf(body.get("userId").toString());
            Long cartId = Long.valueOf(body.get("cartId").toString());
            double amount = Double.parseDouble(body.get("amount").toString());
            int couponDiscount = body.get("couponDiscount") == null
                ? 0 : Integer.parseInt(body.get("couponDiscount").toString());
            String paymentMethod = body.getOrDefault("paymentMethod", "edahabia").toString();

            String successUrl = frontendUrl + "/payment/success";
            String failureUrl = frontendUrl + "/payment/failure";

            Map<String, String> result = chargilyService.createCheckout(
                userId, cartId, couponDiscount, amount,
                successUrl, failureUrl, webhookUrl, paymentMethod
            );

            logService.saveLog(new Log(
                "PAYMENT_INITIATED",
                "Chargily checkout created (" + paymentMethod + "), " + amount + " DZD",
                userId
            ));

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/webhook")
    public ResponseEntity<?> webhook(
            @RequestBody String payload,
            @RequestHeader(value = "signature", required = false) String signature) {
        try {
            if (!chargilyService.verifySignature(payload, signature)) {
                return ResponseEntity.status(401).body("Invalid signature");
            }

            JSONObject event = new JSONObject(payload);
            String type = event.optString("type", "");

            if ("checkout.paid".equals(type)) {
                JSONObject data = event.getJSONObject("data");
                JSONObject metadata = data.optJSONObject("metadata");
                if (metadata == null) return ResponseEntity.ok().build();

                Long userId = Long.parseLong(metadata.getString("userId"));
                Long cartId = Long.parseLong(metadata.getString("cartId"));
                int couponDiscount = metadata.has("couponDiscount")
                    ? Integer.parseInt(metadata.getString("couponDiscount"))
                    : 0;

                ordersItemService.checkoutFromCart(userId, cartId, couponDiscount);

                logService.saveLog(new Log(
                    "PAYMENT_SUCCESS",
                    "Order paid via Chargily, cart #" + cartId,
                    userId
                ));
            } else if ("checkout.failed".equals(type)) {
                JSONObject data = event.getJSONObject("data");
                JSONObject metadata = data.optJSONObject("metadata");
                if (metadata != null) {
                    Long userId = Long.parseLong(metadata.getString("userId"));
                    logService.saveLog(new Log("PAYMENT_FAILED", "Chargily payment failed", userId));
                }
            }

            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
}
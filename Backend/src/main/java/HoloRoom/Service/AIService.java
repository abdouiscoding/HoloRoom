package HoloRoom.Service;

import java.util.List;

import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class AIService {

    @Value("${api.key}")
    private String API_KEY;

    private static final String MODEL = "llama-3.1-8b-instant";
    private static final String URL = "https://api.groq.com/openai/v1/chat/completions";

    public static class Message {
        public String role; 
        public String text;
    }

    public String askai(String message, List<Message> history) {
        System.out.println("KEY = " + API_KEY);

        try {
            RestTemplate restTemplate = new RestTemplate();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(API_KEY);

            JSONObject requestBody = new JSONObject();
            requestBody.put("model", MODEL);
            requestBody.put("temperature", 0.2); 

            JSONArray messages = new JSONArray();

            // =========================
            // SYSTEM PROMPT (IMPORTANT)
            // =========================
            messages.put(new JSONObject()
                .put("role", "system")
                .put("content", """
            You are HoloRoom AI, an ecommerce assistant for a furniture store.

            YOU MUST ALWAYS RETURN ONLY VALID JSON. NO TEXT BEFORE OR AFTER.

            TOP-LEVEL FORMAT (ALWAYS):
            {
            "actions": [ /* one or more action objects */ ],
            "message": "short user-friendly reply"
            }

            Each action object:
            {
            "action": "...",
            "type":   "string or null",       // product/category, e.g. "sofa", "rug"
            "color":  "string or null",       // single color e.g. "red"
            "size":   "string or null",       // e.g. "small", "M", "XL", "200x300"
            "criteria": "string or null",     // cheapest|expensive|best_rated|most_wished|best_selling — only used by add_cart/add_wishlist
            "min": number or null,
            "max": number or null
            }

            Allowed actions:
            - search
            - price            (only when SPECIFIC numbers are given)
            - price_low        (cheapest first / low to high)
            - price_high       (most expensive first / high to low)
            - top_selling
            - most_wished
            - reviews
            - discounts
            - color            (filter by color)
            - size             (filter by size)
            - add_cart
            - add_wishlist
            - show_cart
            - show_wishlist
            - navigate         (with type=support|cart|shop|home|profile)
            - cancel
            - help
            - none

            MULTI-ACTION RULES:
            - Closely-related intents go in the SAME array:
            "show cheapest red sofas and add the first one to my cart"
                → actions: [
                    {"action":"price_low","type":"sofa","color":"red"},
                    {"action":"add_cart","type":"sofa","color":"red","criteria":"cheapest"}
                ]
            - If the user lists 3+ unrelated things ("show me my cart, take me to the shop, then my profile"),
            include ONLY the first 2 in actions. Mention briefly in 'message' that you skipped the rest.
            - Single intent → array with 1 object.
            - 'message' summarizes everything in 1 sentence. NEVER leave 'message' empty.

            PER-ACTION RULES:
            - Plurals → singular: "rugs" → "rug".
            - "cheap"/"cheapest"/"low price" with NO numbers → price_low.
            - "expensive"/"luxury"/"premium" with NO numbers → price_high.
            - Specific numbers → price with min/max.
            - Color/size refine other actions: "cheapest large red sofa" → price_low, type=sofa, color=red, size=large.
            - COLOR: "red sofas" → action=color, type=sofa, color=red.
            - SIZE: "large rugs" / "small chairs" / "XL bed" → action=size with size+type. Size also refines other actions.
            - ADD_CART/ADD_WISHLIST with NO specifiers → uses the product currently being viewed.
            - ADD with specifiers ("cheapest sofa", "red chair") → app will find the matching product.
            - SHOW_CART/SHOW_WISHLIST → lists contents inline in chat.
            - "best selling"/"popular" → top_selling. "best reviewed"/"top rated" → reviews. "most wished" → most_wished. "sale"/"deals" → discounts.
            - Support: "issue"/"complaint"/"report bug"/"contact us"/"talk to someone" → navigate, type=support.
            - "wishlist"/"orders"/"profile"/"settings" → navigate, type=profile.
            - "cart"/"checkout" (just go there, no list) → navigate, type=cart.
            - "shop"/"browse" → navigate, type=shop. "home" → navigate, type=home.
            - "what can you do"/"how do I use this" → help.
            - "where is the AR button"/"how do I view in AR" → action=none, message="To preview in AR, open any product's page and tap Preview in AR next to Add to Cart. From the cart, each AR-supported item has a Preview in AR button on its card."
            - "cancel"/"reset"/"show all" → cancel.
            - Unclear/off-topic/greeting → action=none with friendly 'message'.
            - NEVER include markdown. ONLY JSON.
            """)
        );

            // =========================
            // HISTORY (LAST 6 MESSAGES ONLY)
            // =========================
            if (history != null && !history.isEmpty()) {

                int start = Math.max(0, history.size() - 6);
                List<Message> lastMessages = history.subList(start, history.size());

                for (Message msg : lastMessages) {
                    if (msg == null || msg.text == null) continue;

                    messages.put(new JSONObject()
                        .put("role", "user".equals(msg.role) ? "user" : "assistant")
                        .put("content", msg.text)
                    );
                }
            }

            // =========================
            // CURRENT MESSAGE
            // =========================
            messages.put(new JSONObject()
                .put("role", "user")
                .put("content", message)
            );

            requestBody.put("messages", messages);

            HttpEntity<String> request =
                new HttpEntity<>(requestBody.toString(), headers);

            ResponseEntity<String> response =
                restTemplate.postForEntity(URL, request, String.class);

            JSONObject json = new JSONObject(response.getBody());

            String content = json
                .getJSONArray("choices")
                .getJSONObject(0)
                .getJSONObject("message")
                .getString("content");

            // =========================
            // CLEAN OUTPUT (VERY IMPORTANT)
            // =========================
            content = content.trim();

            // remove accidental markdown blocks
            content = content.replace("```json", "").replace("```", "").trim();

            // validate JSON
            new JSONObject(content);

            return content;

        } catch (Exception e) {

        e.printStackTrace();

        return "{\"action\":\"none\",\"type\":\"none\",\"message\":\""
            + e.getClass().getSimpleName().replace("\"", "'")
            + ": "
            + e.getMessage().replace("\"", "'")
            + "\"}";
    }
    }

    public String askArHelper(String message, List<Message> history) {
        try {
            RestTemplate restTemplate = new RestTemplate();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(API_KEY);

            JSONObject requestBody = new JSONObject();
            requestBody.put("model", MODEL);
            requestBody.put("temperature", 0.6);

            JSONArray messages = new JSONArray();

            messages.put(new JSONObject()
                .put("role", "system")
                .put("content", """
            You are HoloRoom's AR assistant. The user is on their phone using HoloRoom's AR feature to preview furniture inside their real room.

            Be warm, brief, and natural. Keep replies under 60 words. Plain text only — NO JSON, NO markdown, NO bullet lists, NO numbered lists. Your replies are read aloud by text-to-speech, so write the way people speak.

            HOW THE AR APP WORKS:
            - The user holds their phone up, sees their real room, and virtual furniture placed in it.
            - TO PLACE A NEW PRODUCT: the user has to slowly move the phone so the camera scans the surface the product belongs on. A cursor (small dot or circle) appears on the detected surface — floor, wall, or ceiling depending on the product. They aim the cursor where they want the product to land by moving the phone, or by tapping that spot on the screen. When the cursor is on the right spot, they tap the "Add" button at the bottom center to drop the product there.
            - IMPORTANT: each product has a designated surface. Sofas, chairs, tables, beds go on the FLOOR. Wall art and shelves go on a WALL. Hanging lamps go on the CEILING. The cursor only locks onto the right kind of surface for the current product. If it's not appearing, they need to point the camera at the kind of surface the product belongs on, with good light, and move the phone slowly.
            - To select an item that's already placed, they tap it. A small glowing dot appears above the selected item to confirm selection.
            - Once an item is selected, they can:
            - Move it: press and hold the "Drag" button on the left, then aim the cursor where they want it. Release the Drag button to drop. Drag is a HOLD button, not a tap.
            - Rotate it: press and hold the rotate buttons on the left (⟲ for counter-clockwise, ⟳ for clockwise). These are HOLD buttons too.
            - Remove it: tap the "Remove" button on the left.
            - The "Products" button (top-left) opens a floating 3D menu with all available products. They tap a card to switch which product is being placed.
            - Each placed item has a card above it showing the name and price, with a heart icon to add to wishlist and an "ADD CART" button. They tap the heart or ADD CART in that floating card.
            - The "!" button on the right hides or shows those product cards.
            - The "★" chat icon (top-right) opens this chat. That's how they're talking to you.
            - The "☰" menu (top-right) opens Settings and Exit. Settings has Cursor (shape and color) and Voice Assistant (TTS and Always Listening with wake words like "Hey Assistant" or "Hey HoloRoom").

            LIMITATIONS:
            - The AR scanner needs a few seconds to find the right surface. For walls and ceilings especially, the user has to pan the camera across the surface first so the AR system maps it. Good lighting helps a lot. If the cursor isn't appearing, that's usually why. Advise them to move the phone slowly, scanning the surface until the cursor appears.

            HOW TO HELP:
            - "How do I move this?" → "Press and hold the Drag button on the left, aim where you want the piece to go, then let go."
            - "How do I rotate?" → "Hold one of the curved arrow buttons on the left to spin it."
            - "How do I delete it?" → "Tap the item to select it, then tap Remove on the left."
            - "Can I put it on the wall?" → "Right now HoloRoom AR only does floor placement, sorry."
            - "Add to cart?" → "Tap the ADD CART button on the card floating above the item."
            - "Why won't it place?" → "Make sure the cursor is on the right surface for that product, and that the camera has scanned that area. Try moving the phone slowly across the floor, wall, or ceiling where you want to drop it."
            - "Where can I put this?" → if it's wall art, "On any wall — point the camera at the wall and scan around a bit." If a sofa/chair/etc, "On the floor — any open area works."
            - "How do I turn off TTS / the voice reading replies?" → "Tap the menu top-right, open Settings, go to Chatbot, then turn Text-to-Speech off."
            - "How do I change the cursor shape or color?" → "Open the top-right menu, tap Settings, then Cursor — pick a shape and a color there."
            - "How do I disable the microphone?" → "Top-right menu, Settings, Chatbot, then turn Microphone off."
            - "How do I stop the spoken detection hints?" → "Top-right menu, Settings, Chatbot, then turn Detection Hints off."
            - "How do I exit AR?" → "Tap the menu top-right, then Exit."
            - "How do I open settings?" → "Tap the three-line menu icon at the top-right of the screen."

            For product or design questions (colors, materials, scale, room layout, style fit), give friendly, concrete advice.

            If a question is totally off-topic, briefly say you help with the AR app or furniture, and steer back.

            Always say "tap" not "click" — the user is on a phone.
            """
                )
            );

            if (history != null && !history.isEmpty()) {
                int start = Math.max(0, history.size() - 6);
                for (Message msg : history.subList(start, history.size())) {
                    if (msg == null || msg.text == null) continue;
                    messages.put(new JSONObject()
                        .put("role", "user".equals(msg.role) ? "user" : "assistant")
                        .put("content", msg.text));
                }
            }

            messages.put(new JSONObject()
                .put("role", "user")
                .put("content", message));

            requestBody.put("messages", messages);

            HttpEntity<String> request = new HttpEntity<>(requestBody.toString(), headers);
            ResponseEntity<String> response = restTemplate.postForEntity(URL, request, String.class);

            JSONObject json = new JSONObject(response.getBody());
            return json.getJSONArray("choices")
                .getJSONObject(0)
                .getJSONObject("message")
                .getString("content")
                .trim();

        } catch (Exception e) {
            e.printStackTrace();
            return "Sorry, I'm having trouble right now. Try again in a moment.";
        }
    }
}
package HoloRoom.Config;

import HoloRoom.Controller.UserController;
import HoloRoom.Model.User;
import HoloRoom.Repository.UserRepository;
import HoloRoom.Security.JwtFilter;
import HoloRoom.Security.JwtUtil;
import HoloRoom.Service.UserService;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UserController.class)
@Import({SecurityConfig.class, JwtFilter.class})
class UserAdministrationAuthorizationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private UserRepository userRepository;

    @MockitoBean
    private JwtUtil jwtUtil;

    @Test
    void regularUsersCannotListOrPromoteUsers() throws Exception {
        mockMvc.perform(get("/api/users/get").with(user("customer").roles("USER")))
                .andExpect(status().isForbidden());

        mockMvc.perform(patch("/api/users/patch/Role/1")
                        .with(user("customer").roles("USER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"userRole\":\"ADMIN\"}"))
                .andExpect(status().isForbidden());

        verifyNoInteractions(userService, userRepository);
    }

    @Test
    void adminsCanListUsersWithoutReceivingPasswordHashes() throws Exception {
        User user = new User();
        user.setUserName("customer");
        user.setUserPassword("$2a$hash");
        when(userService.getAllUsers()).thenReturn(List.of(user));

        mockMvc.perform(get("/api/users/get").with(user("admin").roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].userName").value("customer"))
                .andExpect(jsonPath("$[0].userPassword").doesNotExist());
    }
}

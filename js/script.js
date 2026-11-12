
document.addEventListener("DOMContentLoaded", () => {
    const loader = document.querySelector(".page-loader");

    window.addEventListener("load", () => {
        setTimeout(() => loader?.classList.add("hide"), 450);
    });
    setTimeout(() => loader?.classList.add("hide"), 1800);

    // Password visibility
    document.querySelectorAll(".toggle-password").forEach(button => {
        button.addEventListener("click", () => {
            const input = button.parentElement.querySelector("input");
            if (!input) return;
            input.type = input.type === "password" ? "text" : "password";
            button.textContent = input.type === "password" ? "Show" : "Hide";
        });
    });

    const getUser = () => {
        try { return JSON.parse(localStorage.getItem("financeUser") || "null"); }
        catch { return null; }
    };

    const saveUser = user => localStorage.setItem("financeUser", JSON.stringify(user));
    const message = (form, text, success = false) => {
        const el = form.querySelector(".form-message");
        if (el) {
            el.textContent = text;
            el.classList.toggle("success", success);
        } else {
            alert(text);
        }
    };

    // Signup
    const signup = document.querySelector("#signupForm");
    signup?.addEventListener("submit", e => {
        e.preventDefault();
        const name = signup.fullName.value.trim();
        const email = signup.email.value.trim().toLowerCase();
        const phone = signup.phone.value.trim();
        const terms = signup.terms?.checked;

        if (name.length < 2) return message(signup, "Please enter your full name.");
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
            return message(signup, "Please enter a valid email address.");
        if (phone && !/^[0-9+\s()-]{7,16}$/.test(phone))
            return message(signup, "Please enter a valid phone number.");
        if (!terms) return message(signup, "Please accept the terms to continue.");

        saveUser({ name, email, phone, verified: false, created: new Date().toISOString() });
        sessionStorage.setItem("financeFlowEmail", email);
        location.href = "email-verification.html";
    });

    // Demo verification code: 123456
    const verify = document.querySelector("#verifyForm");
    verify?.addEventListener("submit", e => {
        e.preventDefault();
        const code = [...verify.querySelectorAll(".code-inputs input")]
            .map(input => input.value).join("");
        if (code !== "123456") return message(verify, "Invalid code. For this demo, use 123456.");

        const user = getUser() || {};
        user.verified = true;
        saveUser(user);
        location.href = "create-password.html";
    });

    // Move between verification code boxes
    document.querySelectorAll(".code-inputs input").forEach((input, index, inputs) => {
        input.addEventListener("input", () => {
            input.value = input.value.replace(/\D/g, "").slice(0, 1);
            if (input.value && inputs[index + 1]) inputs[index + 1].focus();
        });
        input.addEventListener("keydown", e => {
            if (e.key === "Backspace" && !input.value && inputs[index - 1])
                inputs[index - 1].focus();
        });
    });

    // Create password
    const createPassword = document.querySelector("#createPasswordForm");
    createPassword?.addEventListener("submit", e => {
        e.preventDefault();
        const password = createPassword.password.value;
        const confirm = createPassword.confirmPassword.value;
        if (password.length < 8)
            return message(createPassword, "Password must contain at least 8 characters.");
        if (!/(?=.*[A-Za-z])(?=.*\d)/.test(password))
            return message(createPassword, "Use at least one letter and one number.");
        if (password !== confirm)
            return message(createPassword, "Passwords do not match.");

        const user = getUser() || {};
        user.password = password;
        user.verified = true;
        saveUser(user);
        location.href = "account-created.html";
    });

    // Login
    const login = document.querySelector("#loginForm");
    login?.addEventListener("submit", e => {
        e.preventDefault();
        const email = login.email.value.trim().toLowerCase();
        const password = login.password.value;
        const user = getUser();

        if (!user || user.email !== email || user.password !== password)
            return message(login, "Email or password is incorrect. Create a demo account first.");
        if (!user.verified)
            return message(login, "Please verify your email first.");

        sessionStorage.setItem("financeLoggedIn", "true");
        location.href = "dashboard.html";
    });

    // Forgot password: send demo reset flow
    const forgot = document.querySelector("#forgotForm");
    forgot?.addEventListener("submit", e => {
        e.preventDefault();
        const email = forgot.email.value.trim().toLowerCase();
        const user = getUser();
        if (!user || user.email !== email)
            return message(forgot, "No demo account found with this email.");
        sessionStorage.setItem("financeFlowEmail", email);
        location.href = "create-password.html?reset=1";
    });

    // Dashboard and profile user details
    const user = getUser();
    document.querySelectorAll("[data-user-name]").forEach(el => {
        el.textContent = user?.name || "Guest User";
    });
    document.querySelectorAll("[data-user-email]").forEach(el => {
        el.textContent = user?.email || "guest@example.com";
    });
    document.querySelectorAll("[data-user-phone]").forEach(el => {
        el.textContent = user?.phone || "Not provided";
    });
    document.querySelectorAll("[data-user-initial]").forEach(el => {
        el.textContent = (user?.name || "G").charAt(0).toUpperCase();
    });

    // Profile edit demo
    const profileForm = document.querySelector("#profileForm");
    profileForm?.addEventListener("submit", e => {
        e.preventDefault();
        const current = getUser() || {};
        current.name = profileForm.fullName.value.trim();
        current.phone = profileForm.phone.value.trim();
        saveUser(current);
        message(profileForm, "Profile updated successfully.", true);
        document.querySelectorAll("[data-user-name]").forEach(el => el.textContent = current.name);
        document.querySelectorAll("[data-user-phone]").forEach(el => el.textContent = current.phone);
        document.querySelectorAll("[data-user-initial]").forEach(el => el.textContent = current.name.charAt(0).toUpperCase());
    });

    // Mobile dashboard sidebar
    document.querySelector(".mobile-menu")?.addEventListener("click", () => {
        document.querySelector(".sidebar")?.classList.toggle("open");
    });

    // Demo logout
    document.querySelectorAll("[data-logout]").forEach(button => {
        button.addEventListener("click", () => {
            sessionStorage.removeItem("financeLoggedIn");
            location.href = "login.html";
        });
    });

    // Resend verification demo
    document.querySelector("[data-resend-code]")?.addEventListener("click", () => {
        alert("Demo verification code: 123456");
    });

    // Show current date on dashboard
    const date = document.querySelector("[data-current-date]");
    if (date) {
        date.textContent = new Date().toLocaleDateString("en-IN", {
            weekday: "long", day: "numeric", month: "long", year: "numeric"
        });
    }
});

/**
 * Auth JavaScript - Authentication functionality
 * Login form validation, password visibility toggle
 */

// Auth module
window.Auth = {
	// Initialize auth functionality
	init: function () {
		this.bindEvents();
		this.initPasswordToggle();
		this.initFormValidation();
		console.log("Auth module initialized");
	},

	// Bind event handlers
	bindEvents: function () {
		// Login form submission
		document.addEventListener("submit", (e) => {
			if (e.target.matches("#loginForm")) {
				this.handleLoginSubmit(e);
			}
		});

		// Password visibility toggle
		document.addEventListener("click", (e) => {
			if (
				e.target.matches(".password-toggle") ||
				e.target.closest(".password-toggle")
			) {
				e.preventDefault();
				this.togglePasswordVisibility(e.target.closest(".password-toggle"));
			}
		});

		// Input validation on blur
		document.addEventListener(
			"blur",
			(e) => {
				if (e.target.matches("#username") || e.target.matches("#password")) {
					this.validateField(e.target);
				}
			},
			true,
		);

		// Clear validation on input
		document.addEventListener("input", (e) => {
			if (e.target.matches("#username") || e.target.matches("#password")) {
				this.clearFieldError(e.target);
			}
		});

		// Enter key navigation
		document.addEventListener("keydown", (e) => {
			if (e.key === "Enter") {
				this.handleEnterKey(e);
			}
		});
	},

	// Initialize password toggle functionality
	initPasswordToggle: function () {
		const passwordField = document.getElementById("password");
		const toggleBtn = document.querySelector(".password-toggle");

		if (passwordField && toggleBtn) {
			// Set initial state
			passwordField.type = "password";
			this.updateToggleIcon(toggleBtn, false);
		}
	},

	// Toggle password visibility
	togglePasswordVisibility: function (toggleBtn) {
		const passwordField = document.getElementById("password");

		if (!passwordField || !toggleBtn) return;

		const isVisible = passwordField.type === "text";
		passwordField.type = isVisible ? "password" : "text";

		this.updateToggleIcon(toggleBtn, !isVisible);

		// Focus back to password field
		passwordField.focus();

		// Move cursor to end
		setTimeout(() => {
			passwordField.setSelectionRange(
				passwordField.value.length,
				passwordField.value.length,
			);
		}, 0);
	},

	// Update toggle icon
	updateToggleIcon: function (toggleBtn, isVisible) {
		const icon = toggleBtn.querySelector("i");
		if (!icon) return;

		if (isVisible) {
			icon.className = "fas fa-eye-slash";
			toggleBtn.setAttribute("aria-label", "Hide password");
			toggleBtn.title = "Hide password";
		} else {
			icon.className = "fas fa-eye";
			toggleBtn.setAttribute("aria-label", "Show password");
			toggleBtn.title = "Show password";
		}
	},

	// Initialize form validation
	initFormValidation: function () {
		const form = document.getElementById("loginForm");
		if (!form) return;

		// Add novalidate to prevent browser validation
		form.setAttribute("novalidate", "true");

		// Check for existing errors on page load
		this.checkExistingErrors();
	},

	// Check for existing server-side errors
	checkExistingErrors: function () {
		const errorElements = document.querySelectorAll(".invalid-feedback");
		errorElements.forEach((error) => {
			const formGroup = error.closest(".form-group");
			const input = formGroup.querySelector("input");
			if (input) {
				input.classList.add("is-invalid");
			}
		});
	},

	// Handle login form submission
	handleLoginSubmit: function (e) {
		const form = e.target;

		// Validate form
		if (!this.validateLoginForm(form)) {
			e.preventDefault();
			return false;
		}

		// Show loading state
		const submitBtn = form.querySelector('button[type="submit"]');
		if (submitBtn) {
			App.utils.showLoading(submitBtn, "Signing in...");
		}

		return true;
	},

	// Validate login form
	validateLoginForm: function (form) {
		let isValid = true;

		const username = form.querySelector("#username");
		const password = form.querySelector("#password");

		// Validate username
		if (!this.validateUsername(username.value.trim())) {
			this.showFieldError(username, "Enter username");
			isValid = false;
		} else {
			this.clearFieldError(username);
		}

		// Validate password
		if (!this.validatePassword(password.value)) {
			this.showFieldError(password, "Enter password");
			isValid = false;
		} else {
			this.clearFieldError(password);
		}

		return isValid;
	},

	// Validate individual field
	validateField: function (field) {
		let isValid = true;

		if (field.id === "username") {
			if (!this.validateUsername(field.value.trim())) {
				this.showFieldError(field, "Enter username");
				isValid = false;
			} else {
				this.clearFieldError(field);
			}
		} else if (field.id === "password") {
			if (!this.validatePassword(field.value)) {
				this.showFieldError(field, "Enter password");
				isValid = false;
			} else {
				this.clearFieldError(field);
			}
		}

		return isValid;
	},

	// Validate username
	validateUsername: function (username) {
		return username && username.length > 0;
	},

	// Validate password
	validatePassword: function (password) {
		return password && password.length > 0;
	},

	// Show field error
	showFieldError: function (field, message) {
		const formGroup = field.closest(".form-group");
		let feedback = formGroup.querySelector(".invalid-feedback");

		field.classList.remove("is-valid");
		field.classList.add("is-invalid");

		if (!feedback) {
			feedback = document.createElement("div");
			feedback.className = "invalid-feedback";
			formGroup.appendChild(feedback);
		}

		feedback.textContent = message;

		// Add shake animation
		field.classList.add("shake");
		setTimeout(() => {
			field.classList.remove("shake");
		}, 500);
	},

	// Clear field error
	clearFieldError: function (field) {
		const formGroup = field.closest(".form-group");
		const feedback = formGroup.querySelector(".invalid-feedback");

		field.classList.remove("is-invalid");

		if (feedback && !feedback.textContent.includes("Invalid")) {
			feedback.remove();
		}
	},

	// Handle Enter key navigation
	handleEnterKey: function (e) {
		const target = e.target;

		if (target.id === "username") {
			e.preventDefault();
			const passwordField = document.getElementById("password");
			if (passwordField) {
				passwordField.focus();
			}
		} else if (target.id === "password") {
			e.preventDefault();
			const submitBtn = document.querySelector(
				'#loginForm button[type="submit"]',
			);
			if (submitBtn && !submitBtn.disabled) {
				submitBtn.click();
			}
		}
	},

	// Load saved credentials
	loadSavedCredentials: function () {
		const rememberCheckbox = document.getElementById("remember");
		const usernameField = document.getElementById("username");

		if (!rememberCheckbox || !usernameField) return;

		if (rememberCheckbox.checked) {
			const savedUsername = localStorage.getItem("savedUsername");
			if (savedUsername) {
				usernameField.value = savedUsername;
			}
		}
	},

	// Save credentials on successful login
	saveCredentials: function (username) {
		const rememberCheckbox = document.getElementById("remember");

		if (rememberCheckbox && rememberCheckbox.checked) {
			localStorage.setItem("savedUsername", username);
		} else {
			localStorage.removeItem("savedUsername");
		}
	},

	// Clear saved credentials
	clearSavedCredentials: function () {
		localStorage.removeItem("savedUsername");
	},

	// Handle login rate limiting
	handleRateLimit: function (retryAfter) {
		const form = document.getElementById("loginForm");
		const submitBtn = form.querySelector('button[type="submit"]');
		const inputs = form.querySelectorAll("input");

		// Disable form
		inputs.forEach((input) => {
			input.disabled = true;
		});
		submitBtn.disabled = true;

		// Show countdown
		let timeLeft = retryAfter;
		const originalText = submitBtn.textContent;

		const countdown = setInterval(() => {
			submitBtn.textContent = `Retry in ${timeLeft}s`;
			timeLeft--;

			if (timeLeft < 0) {
				clearInterval(countdown);

				// Re-enable form
				inputs.forEach((input) => {
					input.disabled = false;
				});
				submitBtn.disabled = false;
				submitBtn.textContent = originalText;

				// Focus username field
				const usernameField = document.getElementById("username");
				if (usernameField) {
					usernameField.focus();
				}
			}
		}, 1000);
	},

	// Show login error
	showLoginError: function (message) {
		const form = document.getElementById("loginForm");
		let errorAlert = form.querySelector(".alert-danger");

		if (!errorAlert) {
			errorAlert = document.createElement("div");
			errorAlert.className = "alert alert-danger";
			errorAlert.innerHTML = `
                <i class="fas fa-exclamation-triangle me-2"></i>
                <span class="error-message"></span>
            `;
			form.insertBefore(errorAlert, form.firstChild);
		}

		const messageSpan = errorAlert.querySelector(".error-message");
		messageSpan.textContent = message;

		// Add shake animation
		errorAlert.classList.add("shake");
		setTimeout(() => {
			errorAlert.classList.remove("shake");
		}, 500);

		// Auto-hide after 5 seconds
		setTimeout(() => {
			if (errorAlert.parentNode) {
				errorAlert.remove();
			}
		}, 5000);
	},

	// Clear login errors
	clearLoginErrors: function () {
		const form = document.getElementById("loginForm");
		const errorAlert = form.querySelector(".alert-danger");

		if (errorAlert) {
			errorAlert.remove();
		}
	},
};

// Initialize when DOM is ready
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", function () {
		Auth.init();
	});
} else {
	Auth.init();
}

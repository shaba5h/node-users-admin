/**
 * Users JavaScript - User management functionality
 * Delete confirmation, form validation
 */

// Users module
window.Users = {
	// Initialize users functionality
	init: function () {
		this.bindEvents();
		this.initDeleteConfirmation();
		this.initFilters();
		console.log("Users module initialized");
	},

	// Bind event handlers
	bindEvents: function () {
		// Delete user button
		document.addEventListener("click", (e) => {
			if (
				e.target.matches(".btn-delete-user") ||
				e.target.closest(".btn-delete-user")
			) {
				e.preventDefault();
				const btn = e.target.closest(".btn-delete-user");
				this.showDeleteConfirmation(btn);
			}
		});

		// Handle delete form submission
		document.addEventListener("submit", (e) => {
			if (e.target.matches("#deleteForm")) {
				// Let the form submit normally
				console.log("Submitting delete form");
			}
		});

		// Handle modal close buttons
		document.addEventListener("click", (e) => {
			if (
				e.target.matches('[data-dismiss="modal"]') ||
				e.target.closest('[data-dismiss="modal"]')
			) {
				e.preventDefault();
				this.cancelDelete();
			}
		});

		// Form submission
		document.addEventListener("submit", (e) => {
			if (e.target.matches("#userForm")) {
				this.handleFormSubmit(e);
			}
		});

		// Username input change
		document.addEventListener("input", (e) => {
			if (e.target.matches("#username")) {
				this.clearUsernameErrors();
			}
		});

		// Filters toggle button
		document.addEventListener("click", (e) => {
			if (
				e.target.matches(".filters-toggle") ||
				e.target.closest(".filters-toggle")
			) {
				e.preventDefault();
				this.toggleFilters();
			}
		});

		// Handle window resize for filters
		window.addEventListener("resize", () => {
			const filtersContent = document.getElementById("filtersContent");
			if (!filtersContent) return;
			if (window.innerWidth > 768) {
				filtersContent.classList.add("expanded");
			}
		});
	},

	// Initialize delete confirmation
	initDeleteConfirmation: function () {
		// Modal backdrop click
		document.addEventListener("click", (e) => {
			if (e.target.matches(".modal-overlay")) {
				this.cancelDelete();
			}
		});

		// ESC key
		document.addEventListener("keydown", (e) => {
			if (e.key === "Escape") {
				const modal = document.getElementById("deleteModal");
				if (modal && modal.classList.contains("show")) {
					this.cancelDelete();
				}
			}
		});
	},

	// Filters logic
	initFilters: function () {
		const filtersContent = document.getElementById("filtersContent");
		const toggleButton = document.querySelector(".filters-toggle");
		if (!filtersContent || !toggleButton) return;

		// Determine if active filters exist (server-driven)
		const hasActiveFilters =
			typeof window.hasActiveFilters !== "undefined"
				? window.hasActiveFilters
				: false;

		if (window.innerWidth <= 768) {
			if (hasActiveFilters) {
				filtersContent.classList.add("expanded");
				toggleButton.classList.remove("collapsed");
				const chevronIcon = toggleButton.querySelector(".fa-chevron-down");
				if (chevronIcon) chevronIcon.style.transform = "rotate(180deg)";
			}
		} else {
			filtersContent.classList.add("expanded");
		}
	},

	toggleFilters: function () {
		const filtersContent = document.getElementById("filtersContent");
		const toggleButton = document.querySelector(".filters-toggle");
		if (!filtersContent || !toggleButton) return;

		const chevronIcon = toggleButton.querySelector(".fa-chevron-down");
		if (filtersContent.classList.contains("expanded")) {
			filtersContent.classList.remove("expanded");
			toggleButton.classList.add("collapsed");
			if (chevronIcon) chevronIcon.style.transform = "rotate(0deg)";
		} else {
			filtersContent.classList.add("expanded");
			toggleButton.classList.remove("collapsed");
			if (chevronIcon) chevronIcon.style.transform = "rotate(180deg)";
		}
	},

	// Show delete confirmation modal
	showDeleteConfirmation: function (btn) {
		const userId = btn.dataset.userId;
		const userName = btn.dataset.userName;

		if (!userId || !userName) {
			console.error("Missing user data for delete confirmation");
			return;
		}

		// Update modal content
		const modal = document.getElementById("deleteModal");
		const userNameSpan = modal.querySelector("#deleteUsername");
		const deleteForm = modal.querySelector("#deleteForm");

		if (userNameSpan) {
			userNameSpan.textContent = userName;
		}

		if (deleteForm) {
			deleteForm.action = `/admin/users/${userId}?_method=DELETE`;
		}

		// Show modal
		App.components.modal.show("deleteModal");
	},

	// Confirm delete action
	confirmDelete: function () {
		const deleteForm = document.getElementById("deleteForm");

		if (!deleteForm) {
			console.error("Delete form not found");
			return;
		}

		// Submit the form
		deleteForm.submit();
	},

	// Cancel delete action
	cancelDelete: function () {
		App.components.modal.hide("deleteModal");
	},

	// Handle form submission
	handleFormSubmit: function (e) {
		const form = e.target;

		// Validate form
		if (!this.validateUserForm(form)) {
			e.preventDefault();
			return false;
		}

		// Show loading state on submit button
		const submitBtn = form.querySelector('button[type="submit"]');
		if (submitBtn) {
			App.utils.showLoading(submitBtn, "Saving...");
		}

		return true;
	},

	// Validate user form
	validateUserForm: function (form) {
		let isValid = true;

		// Get form fields
		const username = form.querySelector("#username");
		const firstName = form.querySelector("#firstName");
		const lastName = form.querySelector("#lastName");
		const email = form.querySelector("#email");
		const password = form.querySelector("#password");
		const birthDate = form.querySelector("#birthDate");

		// Validate username
		if (username && !this.validateUsername(username.value.trim())) {
			this.showFieldError(
				username,
				"Username must be 3–50 characters and contain only letters, digits, and underscores",
			);
			isValid = false;
		} else if (username) {
			this.clearFieldError(username);
		}

		// Validate first name
		if (firstName && !this.validateName(firstName.value.trim())) {
			this.showFieldError(firstName, "First name must be 2–50 characters");
			isValid = false;
		} else if (firstName) {
			this.clearFieldError(firstName);
		}

		// Validate last name
		if (lastName && !this.validateName(lastName.value.trim())) {
			this.showFieldError(lastName, "Last name must be 2–50 characters");
			isValid = false;
		} else if (lastName) {
			this.clearFieldError(lastName);
		}

		// Validate email
		if (email && !this.validateEmail(email.value.trim())) {
			this.showFieldError(email, "Enter a valid email address");
			isValid = false;
		} else if (email) {
			this.clearFieldError(email);
		}

		// Validate password (only for new users or when changing password)
		if (password && password.value) {
			if (!this.validatePassword(password.value)) {
				this.showFieldError(
					password,
					"Password must be at least 8 characters and include uppercase, lowercase, and digits",
				);
				isValid = false;
			} else {
				this.clearFieldError(password);
			}
		}

		// Validate birth date
		if (
			birthDate &&
			birthDate.value &&
			!this.validateBirthDate(birthDate.value)
		) {
			this.showFieldError(birthDate, "Enter a valid birthdate");
			isValid = false;
		} else if (birthDate) {
			this.clearFieldError(birthDate);
		}

		return isValid;
	},

	// Validate username
	validateUsername: function (username) {
		if (!username || username.length < 3 || username.length > 50) {
			return false;
		}

		// Only letters, numbers, and underscores
		const usernameRegex = /^[a-zA-Z0-9_]+$/;
		return usernameRegex.test(username);
	},

	// Validate name fields
	validateName: function (name) {
		return name && name.length >= 2 && name.length <= 50;
	},

	// Validate email
	validateEmail: function (email) {
		if (!email) return false;

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	},

	// Validate password
	validatePassword: function (password) {
		if (!password || password.length < 8) {
			return false;
		}

		// Must contain at least one uppercase letter, one lowercase letter, and one number
		const hasUppercase = /[A-Z]/.test(password);
		const hasLowercase = /[a-z]/.test(password);
		const hasNumber = /\d/.test(password);

		return hasUppercase && hasLowercase && hasNumber;
	},

	// Validate birth date
	validateBirthDate: function (dateString) {
		const date = new Date(dateString);
		const now = new Date();

		// Check if date is valid
		if (isNaN(date.getTime())) {
			return false;
		}

		// Check if date is not in the future
		if (date > now) {
			return false;
		}

		// Check if person is not older than 150 years
		const minDate = new Date();
		minDate.setFullYear(now.getFullYear() - 150);

		return date >= minDate;
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
	},

	// Clear field error
	clearFieldError: function (field) {
		const formGroup = field.closest(".form-group");
		const feedback = formGroup.querySelector(".invalid-feedback");

		field.classList.remove("is-invalid");
		field.classList.add("is-valid");

		if (feedback) {
			feedback.remove();
		}
	},

	// Clear username errors (when user starts typing)
	clearUsernameErrors: function () {
		const usernameField = document.getElementById("username");
		if (usernameField) {
			this.clearFieldError(usernameField);
		}
	},
};

// Initialize when DOM is ready
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", function () {
		Users.init();
	});
} else {
	Users.init();
}

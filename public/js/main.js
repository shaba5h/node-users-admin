/**
 * Main JavaScript File
 * Core functionality, DOM utilities, and global event handlers
 */

// Global app object
window.App = {
	// Configuration
	config: {
		animationDuration: 300,
		debounceDelay: 300,
		apiTimeout: 10000,
	},

	// Utility functions
	utils: {},

	// Components
	components: {},

	// Initialize application
	init: function () {
		this.utils.init();
		this.components.init();
		this.bindGlobalEvents();
		console.log("App initialized");
	},

	// Bind global event handlers
	bindGlobalEvents: function () {
		// Handle flash message dismissal
		document.addEventListener("click", function (e) {
			if (e.target.matches(".alert-close")) {
				e.preventDefault();
				const alert = e.target.closest(".alert");
				if (alert) {
					App.utils.fadeOut(alert);
				}
			}
		});

		// Handle dropdown toggles
		document.addEventListener("click", function (e) {
			if (
				e.target.matches(".dropdown-toggle") ||
				e.target.closest(".dropdown-toggle")
			) {
				e.preventDefault();
				const dropdown = e.target.closest(".dropdown");
				if (dropdown) {
					App.components.dropdown.toggle(dropdown);
				}
			}
		});

		// Close dropdowns when clicking outside
		document.addEventListener("click", function (e) {
			if (!e.target.closest(".dropdown")) {
				App.components.dropdown.closeAll();
			}
		});

		// Handle mobile sidebar toggle
		document.addEventListener("click", function (e) {
			if (e.target.matches(".sidebar-toggle")) {
				e.preventDefault();
				App.components.sidebar.toggle();
			}
		});

		// Handle keyboard navigation
		document.addEventListener("keydown", function (e) {
			// ESC key closes modals and dropdowns
			if (e.key === "Escape") {
				App.components.modal.closeAll();
				App.components.dropdown.closeAll();
			}
		});
	},
};

// Utility functions
App.utils = {
	init: function () {
		// Initialize utility functions
	},

	// Debounce function
	debounce: function (func, wait) {
		let timeout;
		return function executedFunction(...args) {
			const later = () => {
				clearTimeout(timeout);
				func(...args);
			};
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
		};
	},

	// Throttle function
	throttle: function (func, limit) {
		let inThrottle;
		return function () {
			const args = arguments;
			const context = this;
			if (!inThrottle) {
				func.apply(context, args);
				inThrottle = true;
				setTimeout(() => {
					inThrottle = false;
				}, limit);
			}
		};
	},

	// Fade out element
	fadeOut: function (element, duration = App.config.animationDuration) {
		element.style.transition = `opacity ${duration}ms ease-out`;
		element.style.opacity = "0";
		setTimeout(() => {
			if (element.parentNode) {
				element.parentNode.removeChild(element);
			}
		}, duration);
	},

	// Fade in element
	fadeIn: function (element, duration = App.config.animationDuration) {
		element.style.opacity = "0";
		element.style.transition = `opacity ${duration}ms ease-in`;
		setTimeout(() => {
			element.style.opacity = "1";
		}, 10);
	},

	// Slide up element
	slideUp: function (element, duration = App.config.animationDuration) {
		element.style.transition = `height ${duration}ms ease-out, opacity ${duration}ms ease-out`;
		element.style.height = element.offsetHeight + "px";
		element.style.overflow = "hidden";
		setTimeout(() => {
			element.style.height = "0";
			element.style.opacity = "0";
		}, 10);
		setTimeout(() => {
			if (element.parentNode) {
				element.parentNode.removeChild(element);
			}
		}, duration);
	},

	// Slide down element
	slideDown: function (element, duration = App.config.animationDuration) {
		element.style.height = "0";
		element.style.overflow = "hidden";
		element.style.transition = `height ${duration}ms ease-in, opacity ${duration}ms ease-in`;
		element.style.opacity = "0";

		const height = element.scrollHeight;
		setTimeout(() => {
			element.style.height = height + "px";
			element.style.opacity = "1";
		}, 10);

		setTimeout(() => {
			element.style.height = "auto";
			element.style.overflow = "visible";
		}, duration);
	},

	// Show loading state
	showLoading: function (element, text = "Loading...") {
		const originalContent = element.innerHTML;
		element.dataset.originalContent = originalContent;
		element.innerHTML = `
            <span class="loading"></span>
            <span class="ml-2">${text}</span>
        `;
		element.disabled = true;
	},

	// Hide loading state
	hideLoading: function (element) {
		if (element.dataset.originalContent) {
			element.innerHTML = element.dataset.originalContent;
			delete element.dataset.originalContent;
		}
		element.disabled = false;
	},

	// Format date
	formatDate: function (date, format = "dd.mm.yyyy") {
		const d = new Date(date);
		const day = String(d.getDate()).padStart(2, "0");
		const month = String(d.getMonth() + 1).padStart(2, "0");
		const year = d.getFullYear();

		return format.replace("dd", day).replace("mm", month).replace("yyyy", year);
	},

	// Copy to clipboard
	copyToClipboard: function (text) {
		if (navigator.clipboard) {
			return navigator.clipboard.writeText(text);
		} else {
			// Fallback for older browsers
			const textArea = document.createElement("textarea");
			textArea.value = text;
			document.body.appendChild(textArea);
			textArea.select();
			document.execCommand("copy");
			document.body.removeChild(textArea);
			return Promise.resolve();
		}
	},

	// Show notification
	showNotification: function (message, type = "info", duration = 5000) {
		const notification = document.createElement("div");
		notification.className = `alert alert-${type} notification`;
		notification.innerHTML = `
            <div class="alert-content">
                <div class="alert-message">${message}</div>
            </div>
            <button type="button" class="alert-close">
                <i class="fas fa-times"></i>
            </button>
        `;

		// Add to page
		let container = document.querySelector(".notifications-container");
		if (!container) {
			container = document.createElement("div");
			container.className = "notifications-container";
			container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 1070;
                max-width: 400px;
            `;
			document.body.appendChild(container);
		}

		container.appendChild(notification);
		App.utils.fadeIn(notification);

		// Auto remove
		if (duration > 0) {
			setTimeout(() => {
				if (notification.parentNode) {
					App.utils.fadeOut(notification);
				}
			}, duration);
		}

		return notification;
	},
};

// Component initialization
App.components = {
	init: function () {
		this.modal.init();
		this.dropdown.init();
		this.sidebar.init();
		this.table.init();
		this.form.init();
	},

	// Modal component
	modal: {
		init: function () {
			// Initialize modals
		},

		show: function (modalId) {
			const modal = document.getElementById(modalId);
			if (modal) {
				modal.classList.add("show");
				document.body.style.overflow = "hidden";

				// Focus first input
				const firstInput = modal.querySelector(
					"input, textarea, select, button",
				);
				if (firstInput) {
					setTimeout(() => firstInput.focus(), 100);
				}
			}
		},

		hide: function (modalId) {
			const modal = document.getElementById(modalId);
			if (modal) {
				modal.classList.remove("show");
				document.body.style.overflow = "";
			}
		},

		closeAll: function () {
			document.querySelectorAll(".modal.show").forEach((modal) => {
				modal.classList.remove("show");
			});
			document.body.style.overflow = "";
		},
	},

	// Dropdown component
	dropdown: {
		init: function () {
			// Initialize dropdowns
		},

		toggle: function (dropdown) {
			const menu = dropdown.querySelector(".dropdown-menu");
			if (menu) {
				const isOpen = menu.classList.contains("show");
				this.closeAll();
				if (!isOpen) {
					menu.classList.add("show");
				}
			}
		},

		closeAll: function () {
			document.querySelectorAll(".dropdown-menu.show").forEach((menu) => {
				menu.classList.remove("show");
			});
		},
	},

	// Sidebar component
	sidebar: {
		init: function () {
			// Initialize sidebar submenu toggles
			this.initSubmenuToggles();
		},

		initSubmenuToggles: function () {
			document.addEventListener("click", function (e) {
				if (
					e.target.matches(".submenu-toggle") ||
					e.target.closest(".submenu-toggle")
				) {
					e.preventDefault();
					const menuItem = e.target.closest(".menu-item");
					if (menuItem && menuItem.classList.contains("has-submenu")) {
						App.components.sidebar.toggleSubmenu(menuItem);
					}
				}
			});
		},

		toggleSubmenu: function (menuItem) {
			const isOpen = menuItem.classList.contains("open");

			// Close all other submenus
			document
				.querySelectorAll(".menu-item.has-submenu.open")
				.forEach((item) => {
					if (item !== menuItem) {
						item.classList.remove("open");
					}
				});

			// Toggle current submenu
			if (isOpen) {
				menuItem.classList.remove("open");
			} else {
				menuItem.classList.add("open");
			}
		},

		toggle: function () {
			const sidebar = document.querySelector(".main-sidebar, .sidebar");
			if (sidebar) {
				sidebar.classList.toggle("open");
			}
		},

		close: function () {
			const sidebar = document.querySelector(".main-sidebar, .sidebar");
			if (sidebar) {
				sidebar.classList.remove("open");
			}
		},
	},

	// Table component
	table: {
		init: function () {
			this.initSorting();
			this.initSearch();
		},

		initSorting: function () {
			document.addEventListener("click", function (e) {
				if (
					e.target.matches("th.sortable") ||
					e.target.closest("th.sortable")
				) {
					e.preventDefault();
					const th = e.target.closest("th.sortable");
					App.components.table.sort(th);
				}
			});
		},

		initSearch: function () {
			const searchInputs = document.querySelectorAll(".table-search input");
			searchInputs.forEach((input) => {
				input.addEventListener(
					"input",
					App.utils.debounce(function (e) {
						App.components.table.search(
							e.target.value,
							e.target.closest(".table-container"),
						);
					}, App.config.debounceDelay),
				);
			});
		},

		sort: function (th) {
			// Get sort field from data-sort attribute
			const sortField = th.getAttribute("data-sort");
			if (!sortField) return;

			// Determine sort direction
			let direction = "asc";
			if (th.classList.contains("sort-asc")) {
				direction = "desc";
			}

			// Build new URL with sort parameters
			const url = new URL(window.location);
			url.searchParams.set("sortBy", sortField);
			url.searchParams.set("sortDir", direction);
			url.searchParams.set("page", "1"); // Reset to first page when sorting

			// Navigate to new URL (server-side sorting)
			window.location.href = url.toString();
		},

		search: function (query, container) {
			const table = container.querySelector("table");
			const rows = table.querySelectorAll("tbody tr");

			rows.forEach((row) => {
				const text = row.textContent.toLowerCase();
				const matches = text.includes(query.toLowerCase());
				row.style.display = matches ? "" : "none";
			});

			// Update empty state
			const visibleRows = Array.from(rows).filter(
				(row) => row.style.display !== "none",
			);
			let emptyState = container.querySelector(".empty-state");

			if (visibleRows.length === 0 && query) {
				if (!emptyState) {
					emptyState = document.createElement("div");
					emptyState.className = "empty-state";
					emptyState.innerHTML = `
                        <div class="empty-state-icon">
                            <i class="fas fa-search"></i>
                        </div>
            <div class="empty-state-title">Nothing found</div>
                        <div class="empty-state-description">
            Try adjusting your search query
                        </div>
                    `;
					table.parentNode.appendChild(emptyState);
				}
				emptyState.style.display = "block";
			} else if (emptyState) {
				emptyState.style.display = "none";
			}
		},
	},

	// Form component
	form: {
		init: function () {
			this.initValidation();
			this.initPasswordToggle();
		},

		initValidation: function () {
			document.addEventListener("submit", function (e) {
				const form = e.target;
				if (form.tagName === "FORM" && form.hasAttribute("data-validate")) {
					if (!App.components.form.validate(form)) {
						e.preventDefault();
					}
				}
			});
		},

		initPasswordToggle: function () {
			document.addEventListener("click", function (e) {
				if (
					e.target.matches(".password-toggle-btn") ||
					e.target.closest(".password-toggle-btn")
				) {
					e.preventDefault();
					const btn = e.target.closest(".password-toggle-btn");
					const input = btn.parentNode.querySelector("input");
					const icon = btn.querySelector("i");

					if (input.type === "password") {
						input.type = "text";
						icon.className = "fas fa-eye-slash";
					} else {
						input.type = "password";
						icon.className = "fas fa-eye";
					}
				}
			});
		},

		validate: function (form) {
			let isValid = true;
			const inputs = form.querySelectorAll(
				"input[required], textarea[required], select[required]",
			);

			inputs.forEach((input) => {
				if (!this.validateField(input)) {
					isValid = false;
				}
			});

			return isValid;
		},

		validateField: function (field) {
			const value = field.value.trim();
			let isValid = true;
			let message = "";

			// Required validation
			if (field.hasAttribute("required") && !value) {
				isValid = false;
				message = "This field is required";
			}

			// Password validation
			if (
				field.type === "password" &&
				value &&
				field.hasAttribute("data-min-length")
			) {
				const minLength = parseInt(field.getAttribute("data-min-length"));
				if (value.length < minLength) {
					isValid = false;
					message = `Password must be at least ${minLength} characters`;
				}
			}

			// Update field state
			this.updateFieldState(field, isValid, message);

			return isValid;
		},

		updateFieldState: function (field, isValid, message) {
			const formGroup = field.closest(".form-group");
			let feedback = formGroup.querySelector(".invalid-feedback");

			if (isValid) {
				field.classList.remove("is-invalid");
				field.classList.add("is-valid");
				if (feedback) {
					feedback.remove();
				}
			} else {
				field.classList.remove("is-valid");
				field.classList.add("is-invalid");

				if (!feedback) {
					feedback = document.createElement("div");
					feedback.className = "invalid-feedback";
					formGroup.appendChild(feedback);
				}
				feedback.textContent = message;
			}
		},
	},
};

// Initialize app when DOM is ready
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", function () {
		App.init();
	});
} else {
	App.init();
}

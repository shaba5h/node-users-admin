import { Router } from "express";
import {
	createUserHandler,
	deleteUserHandler,
	renderEditUserForm,
	renderNewUserForm,
	renderUserShow,
	renderUsersIndex,
	updateUserHandler,
} from "./controllers/usersController";
import {
	createUserValidators,
	idParamValidator,
	listQueryValidators,
	updateUserValidators,
} from "./validators/expressValidators";

const router = Router();

router.get("/", listQueryValidators, renderUsersIndex);
router.get("/new", renderNewUserForm);
router.get("/:id", idParamValidator, renderUserShow);
router.get("/:id/edit", idParamValidator, renderEditUserForm);
router.post("/", createUserValidators, createUserHandler);
router.put("/:id", updateUserValidators, updateUserHandler);
router.delete("/:id", idParamValidator, deleteUserHandler);

export default router;

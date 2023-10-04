import express from 'express';

const router = express.Router();

import {checkCsrf} from "../utils/csrf.js";

// constroller
import {questionsAPI, getApiJson, getUserData, openai} from "../controller/api_controller.js";

//send json
router.get("/questionsAPI", questionsAPI);

//resive json
router.post("/questionsAPI", getApiJson);

//get user data from db
router.get("/getUserData/:id", getUserData);

//openai
router.get("/openai", openai);




export default router;
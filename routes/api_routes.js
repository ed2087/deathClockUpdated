import express from 'express';

const router = express.Router();

// constroller
import {questionsAPI, getApiJson} from "../controller/api_controller.js";

//send json
router.get("/questionsAPI", questionsAPI);

//resive json
router.post("/questionsAPI", getApiJson);


export default router;
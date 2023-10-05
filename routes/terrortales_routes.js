import express from 'express';

const router = express.Router();

import {checkCsrf} from "../utils/csrf.js";

// constroller
import {terrorTalesPage,submission,submissionPost} from "../controller/terrorTales_controller.js";

//submission page
router.get("/submission", submission);

//submission post
router.post("/submission", submissionPost);


//landing page
router.get("*", terrorTalesPage);


export default router;
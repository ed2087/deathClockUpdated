import express from 'express';

const router = express.Router();

// constroller
import {index,deathclockQuestions} from "../controller/main_controller.js";

//landing page
router.get("/", index);

//deathclockQuestions
router.get("/deathclockQuestions", deathclockQuestions);


export default router;
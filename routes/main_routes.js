import express from 'express';

const router = express.Router();

// constroller
import {index,deathclockQuestions,deathclockResults} from "../controller/main_controller.js";

//landing page
router.get("/", index);

//deathclockQuestions
router.get("/deathclockQuestions", deathclockQuestions);

//deathclockResults
router.get("/deathclockResults/:id", deathclockResults);




export default router;
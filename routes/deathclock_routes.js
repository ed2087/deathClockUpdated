import express from 'express';

const router = express.Router();

// constroller
import {deathclockQuestions,deathclockResults} from "../controller/deathclock_controller.js";


//deathclockQuestions
router.get("/questions", deathclockQuestions);

//deathclockResults
router.get("/results/:id", deathclockResults);


export default router;
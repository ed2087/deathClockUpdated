import express from 'express';

const router = express.Router();

// constroller
import {deathclockQuestions,deathclockResults, graveyard, updateUserClock} from "../controller/deathclock_controller.js";


//deathclockQuestions
router.get("/questions", deathclockQuestions);

//deathclockResults
router.get("/results/:id", deathclockResults);

//graveyard
router.get("/graveyard", graveyard);

//updateUserClock
router.post("/updateUserClock", updateUserClock);


export default router;
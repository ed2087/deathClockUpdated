import express from 'express';

const router = express.Router();

// constroller
import {index} from "../controller/main_controller.js";

//landing page
router.get("/", index);


export default router;
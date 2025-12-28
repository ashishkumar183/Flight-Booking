const express = require('express');

const v1Routes = require('./v1');

const router = express.Router();

router.use('/v1',v1Routes);  //Whenever we get /v1 after api then it redirects to v1Routes.

module.exports = router;
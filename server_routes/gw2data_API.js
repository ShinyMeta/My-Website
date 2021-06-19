'use strict';

const express = require('express');
const router = express.Router();

const DB = require('./gw2tools/gw2DB.js')


module.exports = router;







router.get('/TPitemSummary/:item_id', (req, res, next) => {
  const item_id = req.params.item_id
  
  
  //get 1/3/7/30 day
  return Promise.all([
    DB.getTPSummaryForItem(item_id, 1),
    DB.getTPSummaryForItem(item_id, 3),
    DB.getTPSummaryForItem(item_id, 7),
    DB.getTPSummaryForItem(item_id, 30),
  ]).then((results) => {
    res.json({
      current: results[0].current,
      '1day': results[0],
      '3day': results[1],
      '7day': results[2],
      '30day': results[3],
    })
  })
  .catch((err) => {
    console.error(err)
    res.status(400)
    res.json({
      error_message: err.message
    })
  })

})


router.get('/TPitemSummary/all', (req, res, next) => {
  const item_id = req.params.item_id
  
  
  //get 1/3/7/30 day
  return Promise.all([
    DB.getTPSummaryForItem(item_id, 1),
    DB.getTPSummaryForItem(item_id, 3),
    DB.getTPSummaryForItem(item_id, 7),
    DB.getTPSummaryForItem(item_id, 30),
  ]).then((results) => {
    res.json({
      current: results[0].current,
      '1day': results[0],
      '3day': results[1],
      '7day': results[2],
      '30day': results[3],
    })
  })
  .catch((err) => {
    console.error(err)
    res.status(400)
    res.json({
      error_message: err.message
    })
  })

})
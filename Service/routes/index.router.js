const express = require('express');
const router = express.Router();

const userController = require('../controllers/user.controller');

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/getTopicList', userController.getTopicList);
router.post('/subscribeToTopics', userController.subscribeToTopics);
router.get('/getDriverList', userController.getDriverList);
router.get('/getConstructorList', userController.getConstructorList);
router.post('/getUserSubscriptions', userController.getUserSubscriptions);
router.post('/unsubscribeUserTopics', userController.unsubscribeUserTopics);
router.post('/getUserSubscriptionData', userController.getUserSubscriptionData);

router.post('/publishDriverStandings', userController.publishDriverStandings);
router.post('/advertizeFutureTopics', userController.advertizeFutureTopics);
router.post('/unadvertizeFutureTopics', userController.unadvertizeFutureTopics);

module.exports = router;




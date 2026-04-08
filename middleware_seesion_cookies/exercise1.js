const express = require('express');
const router = express.Router();

router.get('/start', (req, res) => {
  req.session.formData = {};
  res.render('exercise1/step1');
});

router.post('/step1', (req, res) => {
  if (!req.session.formData) {
    req.session.formData = {};
  }
  
  const { firstName, lastName, email } = req.body;
  
  if (!firstName || !lastName || !email) {
    return res.render('exercise1/step1', { error: 'All fields are required' });
  }
  
  req.session.formData.firstName = firstName;
  req.session.formData.lastName = lastName;
  req.session.formData.email = email;
  
  res.redirect('/exercise1/step2');
});

router.get('/step2', (req, res) => {
  if (!req.session.formData || !req.session.formData.firstName) {
    return res.redirect('/exercise1/start');
  }
  res.render('exercise1/step2', { formData: req.session.formData });
});

router.post('/step2', (req, res) => {
  const { phone, address, city } = req.body;
  
  if (!phone || !address || !city) {
    return res.render('exercise1/step2', { 
      error: 'All fields are required',
      formData: req.session.formData 
    });
  }
  
  req.session.formData.phone = phone;
  req.session.formData.address = address;
  req.session.formData.city = city;
  
  res.redirect('/exercise1/step3');
});

router.get('/step3', (req, res) => {
  if (!req.session.formData || !req.session.formData.firstName) {
    return res.redirect('/exercise1/start');
  }
  res.render('exercise1/step3', { formData: req.session.formData });
});

router.post('/step3', (req, res) => {
  const { password, confirmPassword } = req.body;
  
  if (!password || !confirmPassword) {
    return res.render('exercise1/step3', { 
      error: 'All fields are required',
      formData: req.session.formData 
    });
  }
  
  if (password !== confirmPassword) {
    return res.render('exercise1/step3', { 
      error: 'Passwords do not match',
      formData: req.session.formData 
    });
  }
  
  req.session.formData.password = password;
  res.redirect('/exercise1/review');
});

router.get('/review', (req, res) => {
  if (!req.session.formData || !req.session.formData.firstName) {
    return res.redirect('/exercise1/start');
  }
  res.render('exercise1/review', { formData: req.session.formData });
});

router.post('/submit', (req, res) => {
  const formData = req.session.formData;
  
  res.render('exercise1/success', { 
    message: `Registration successful for ${formData.firstName} ${formData.lastName}`,
    formData: formData 
  });
  
  delete req.session.formData;
});

router.post('/reset', (req, res) => {
  delete req.session.formData;
  res.redirect('/exercise1/start');
});

module.exports = router;

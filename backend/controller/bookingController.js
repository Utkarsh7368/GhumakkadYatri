const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {Package,PackageDetail} = require('../models/Package');
const helper = require('../functions/helper');
const { User, UserLoginHistory } = require('../models/User');
require('dotenv').config();
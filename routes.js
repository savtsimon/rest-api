'use strict';

const express = require('express');
const auth = require("basic-auth")
const bcrypt = require("bcrypt")
const { User, Course } = require('./models');
const course = require('./models/course');

const router = express.Router();

const asyncHandler = (cb) => {
    return async (req, res, next) => {
        try {
            await cb(req, res, next);
        } catch (error) {
            next(error);
        }
    }
}

const authenticateUser = async (req, res, next) => {
    let message
    // Get credentials from the authorization header
    const creds = auth(req)
    // If credentials are available, find corresponding user
    if (creds) {
        const user = await User.findOne({ where: { emailAddress: creds.name } })
        // If user exists, ensure that the authentication credentials match
        if (user) {
            const authenticated = bcrypt.compareSync(creds.pass, user.password)
            // If user is authenticated, put the user on the body of the request
            if (authenticated) {
                console.log(`Authentication successful for ${user.emailAddress}`)
                req.currentUser = user
            } else {
                message: `Authentication failed for ${user.emailAddress}`
            }
        } else {
            message = `User not found for email: ${creds.name}`
        }
    } else {
        message = "Authorization header not found"
    }
    if (message) {
        console.warn(message)
        res.status(401).json({ message: "Access Denied" })
    } else {
        next()
    }
}

// Return properties and values for currently authenticated user
router.get("/users", authenticateUser, asyncHandler((req, res) => {
    const user = req.currentUser
    res.json({
        firstName: user.firstName,
        lastName: user.lastName,
        emailAddress: user.emailAddress,
    })
}))

// Create new user
router.post("/users", asyncHandler(async (req, res) => {
    try {
        await User.create(req.body)
        res.location("/")
        res.status(201).end()
    } catch (error) {
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            const errors = error.errors.map(error => error.message)
            res.status(400).json({ errors })
        } else {
            throw error;
        }
    }
}))

// Return all courses and users associated with courses
router.get("/courses", asyncHandler(async (req, res) => {
    const courses = await Course.findAll({
        attributes: ["title", "description", "estimatedTime", "materialsNeeded", "userId"],
        include: [{
            model: User,
            attributes: ["firstName", "lastName", "emailAddress"]
        }]
    })
    res.json({ courses })
}))

// Return specific course and associated user data
router.get("/courses/:id", asyncHandler(async (req, res) => {
    const course = await Course.findOne({
        attributes: ["title", "description", "estimatedTime", "materialsNeeded", "userId"],
        where: {
            id: parseInt(req.params.id),
        },
        include: {
            model: User,
            attributes: ["firstName", "lastName", "emailAddress"]
        }
    })
    res.json(course)
}))

// Create a new course
router.post("/courses", authenticateUser, asyncHandler(async (req, res) => {
    try {
        const user = req.currentUser
        const course = await Course.create({
            title: req.body.title,
            description: req.body.description,
            materialsNeeded: req.body.materialsNeeded,
            estimatedTime: req.body.estimatedTime,
            userId: user.id
        })
        res.location("/courses/" + course.id)
        res.status(201).end()
    } catch (error) {
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            const errors = error.errors.map(error => error.message)
            res.status(400).json({ errors })
        } else {
            throw error;
        }
    }
}))

// Update a specific course
router.put("/courses/:id", authenticateUser, asyncHandler(async (req, res) => {
    const user = req.currentUser
    const course = await Course.findByPk(req.params.id)
    if (course.userId === user.id) {
        await course.update(req.body)
        res.status(204).end()
    } else {
        res.status(403).end()
    }
}))

// Delete a specific course
router.delete("/courses/:id", authenticateUser, asyncHandler(async (req, res) => {
    const user = req.currentUser
    const course = await Course.findOne({
        where: {
            // userId: user.id,
            id: parseInt(req.params.id)
        }
    })
    if (course.userId === user.id) {
        await course.destroy()
        res.status(204).end()
    } else {
        res.status(403).end()
    }
}))

module.exports = router
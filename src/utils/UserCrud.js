// Provide CRUD functions for the user model

const User = require('../models/User')

async function findOneUser(username) {
    let result = await User.findOne({username})
    console.log(result)
    return result
}

async function deleteUser(username) {
    let result = await User.deleteOne({username})

    return result
}

module.exports = {
    findOneUser,
    deleteUser
}

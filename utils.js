const validateInput = input => {
    if(input != true)
        throw "Invalid input for command."
}

module.exports = {
    validateInput
}
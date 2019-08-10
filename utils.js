const validateInput = input => {
    if(input == undefined)
        throw "Invalid input for command."
}

module.exports = {
    validateInput
}
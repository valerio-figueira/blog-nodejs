const mongoose = require("mongoose");

const User = mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    eAdmin:{
        type: Number,
        default: 0
    },
    password:{
        type: String,
        required: true
    }
});

mongoose.model("users", User);
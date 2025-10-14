import mongoose from "mongoose"

const countrySchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    code:{
        type:String,
        required:true,
        unique : true,
    },
    flag:{
        type:String,
        required:true,
    },
    capital:String, 
    region:String,
    subregion:String,
    area:Number,
    population:Number,
    continents:[String],
    languages:Object,

})

export default mongoose.model("Country", countrySchema)
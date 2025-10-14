import mongoose from "mongoose"
import dotenv from "dotenv"
import Country from "../models/Country.js"
dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI
console.log("MongoDB_URI present")


try {

    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connection successfull")

    //fetch all countries

    const response = await fetch("https://restcountries.com/v3.1/all?fields=name,cca2,flags,capital,region,subregion,area,population,continents,languages")

    console.log("Fetch Status", response.status)
    const countries = await response.json()

    console.log("Type of Countries", typeof countries);
    console.log("First few countries", Array.isArray(countries) ? countries.slice(0, 2) : countries)
    console.log(`Fetched${Array.isArray(countries) ? countries.length : "unknown"} countries`)
    console.log(`Fetched ${countries.length} countries`)

    //convert the data to quiz format

    const formattedCountries = countries
        .filter(country => country.name && country.cca2 && country.flags && country.flags.png)

        .map(country => ({
            name: country.name.common,
            code: country.cca2,
            flag: country.flags.png,
            capital:country.capital?country.capital[0]:"N/A",
            region:country.region || "Unknown",
            subregion:country.subregion || "Unknown",
            area:country.area || 0,
            population:country.population || 0,
            continents:country.continents  || [],
            languages:country.languages || {},



        }))
    console.log("Example formatted country:", formattedCountries[0]);
    console.log(`Ready to insert ${formattedCountries.length} countries`);

    // Insert the quiz into the MongoDB
    await Country.deleteMany({})

    const result = await Country.insertMany(formattedCountries);
    console.log(`Successfully inserted ${formattedCountries.length} into MongoDB`)

    mongoose.connection.close();






} catch (err) {
    console.error("MongoDB connection failed", err)
}


